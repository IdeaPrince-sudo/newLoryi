import React, { useState, useMemo, useRef, useEffect } from "react";
import Map, { Marker, Popup } from "react-map-gl";
import mapboxgl from "mapbox-gl";
import L from "leaflet";
import "mapbox-gl/dist/mapbox-gl.css";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Download, FileSpreadsheet, FileText, MapPin, Plus, Printer, Search, SlidersHorizontal, Sprout, X } from "lucide-react";
import { clearPendingSoilResult, farmFromPendingSoilResult, loadFarmProfiles, loadPendingSoilResult, saveFarmProfiles } from "./farmSoilStore";
import { useAuth } from "../../../contexts/AuthContext";
import { api } from "../../../lib/api";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const GHANA_REGIONS = [
  "Ahafo", "Ashanti", "Bono", "Bono East", "Central", "Eastern", "Greater Accra", "North East",
  "Northern", "Oti", "Savannah", "Upper East", "Upper West", "Volta", "Western", "Western North",
];

const farmTypeIcons = {
  Crop: "🌾",
  Livestock: "🐄",
  Aquatic: "🐟",
  Mixed: "🌱🐄",
  Default: "📍",
};

const LeafletFarmMap = ({ profiles, onSelect }) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerLayerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return undefined;
    const map = L.map(containerRef.current).setView([7.9465, -1.0232], 6);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);
    markerLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    const resizeObserver = new ResizeObserver(() => map.invalidateSize());
    resizeObserver.observe(containerRef.current);
    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      markerLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const markerLayer = markerLayerRef.current;
    if (!map || !markerLayer) return;
    markerLayer.clearLayers();
    const validProfiles = profiles.filter((profile) => Number.isFinite(profile.location?.lat) && Number.isFinite(profile.location?.lng));
    for (const profile of validProfiles) {
      const iconText = farmTypeIcons[profile.farmType] || farmTypeIcons.Default;
      const icon = L.divIcon({
        className: "",
        html: `<span style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;border:2px solid #16803c;border-radius:50%;background:#fff;font-size:20px;box-shadow:0 1px 5px #0005">${iconText}</span>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });
      const popup = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = profile.farmName || "Farm";
      popup.append(title, document.createElement("br"));
      popup.append(document.createTextNode(`Farmer: ${profile.name || "Not set"}`));
      popup.append(document.createElement("br"));
      popup.append(document.createTextNode(`Type: ${profile.farmType || "Farm"}`));
      popup.append(document.createElement("br"));
      popup.append(document.createTextNode(`Soil: ${profile.soilType || "Not tested"}`));
      L.marker([profile.location.lat, profile.location.lng], { icon })
        .bindPopup(popup)
        .on("click", () => onSelect(profile))
        .addTo(markerLayer);
    }
    if (validProfiles.length > 1) {
      map.fitBounds(L.latLngBounds(validProfiles.map((profile) => [profile.location.lat, profile.location.lng])).pad(0.12), { maxZoom: 12 });
    } else if (validProfiles.length === 1) {
      map.setView([validProfiles[0].location.lat, validProfiles[0].location.lng], 12);
    }
  }, [profiles, onSelect]);

  return <div ref={containerRef} role="application" aria-label="Farm locations map" style={{ width: "100%", height: "100%" }} />;
};

const SoilMap = () => {
  const { currentUser } = useAuth();
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [hoveredFarm, setHoveredFarm] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [farmTypeFilter, setFarmTypeFilter] = useState("All");
  const [regionFilter, setRegionFilter] = useState("All");
  const [sortKey, setSortKey] = useState("farmName");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [farmsPerPage] = useState(5);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [farmError, setFarmError] = useState("");
  const [savedFarm, setSavedFarm] = useState(null);
  const [editingFarmId, setEditingFarmId] = useState(null);
  const [farmNotice, setFarmNotice] = useState("");
  const [mapSupported] = useState(() => {
    try {
      return mapboxgl.supported();
    } catch {
      return false;
    }
  });

  const [farmData, setFarmData] = useState(loadFarmProfiles);
  const [soilPrefillPending, setSoilPrefillPending] = useState(null);
  const [newFarm, setNewFarm] = useState({
    name: currentUser?.name || "", farmName: "", farmType: "Crop", region: "Greater Accra",
    lat: "", lng: "", locationDescription: "", landSize: "", soilType: "",
    pH: "", moisture: "", N: "", P: "", K: "", organicMatter: "", healthStatus: "",
    suitableCrops: "", livestock: "", aquatic: "", images: []
  });

  const mapRef = useRef();
  const fallbackMapRef = useRef();

  useEffect(() => {
    let active = true;
    const migrateLegacyProfiles = async () => {
      try {
        let profiles = await api.geoSenseFarms();
        const migratedIds = new Set(profiles.map((profile) => String(profile.legacyId || "")));
        const farmNames = new Set(profiles.map((profile) => String(profile.farmName || "").trim().toLowerCase()).filter(Boolean));
        const legacyProfiles = loadFarmProfiles().filter((profile) => {
          const legacyId = String(profile.id || "");
          const farmName = String(profile.farmName || "").trim().toLowerCase();
          return legacyId && !migratedIds.has(legacyId) && farmName && !farmNames.has(farmName);
        });
        let failedMigrations = 0;
        for (const profile of legacyProfiles) {
          try {
            const created = await api.createGeoSenseFarm({ ...profile, legacyId: profile.id, name: currentUser?.name || profile.name });
            profiles = [...profiles, created];
            migratedIds.add(String(profile.id));
            farmNames.add(String(profile.farmName).trim().toLowerCase());
          } catch {
            failedMigrations += 1;
          }
        }
        if (!active) return;
        setFarmData(profiles);
        saveFarmProfiles(profiles);
        setFarmError(failedMigrations
          ? `${failedMigrations} older farm ${failedMigrations === 1 ? "record was" : "records were"} not imported. Your server farms are available.`
          : "");
      } catch (error) {
        if (active) setFarmError(error.message || "Farm records could not be synchronized with the server.");
      }
    };

    migrateLegacyProfiles();
    const pending = loadPendingSoilResult();
    if (pending) {
      const farmName = pending.coords
        ? `Farm at ${pending.coords.lat.toFixed(3)}, ${pending.coords.lng.toFixed(3)}`
        : "New Farm";
      setNewFarm((current) => farmFromPendingSoilResult(pending, { ...current, farmName }));
      setSoilPrefillPending(pending);
      setShowAddDialog(true);
    }
    return () => {
      active = false;
    };
  }, [currentUser?.id, currentUser?.name]);

  const sampleProfiles = [
    // Greater Accra
    {
      id: 1,
      name: "Farmer John",
      farmName: "Green Valley",
      farmType: "Crop",
      region: "Greater Accra",
      location: { lat: 5.6037, lng: -0.187 },
      locationDescription: "Accra Central",
      landSize: "5 ha",
      soilType: "Loamy",
      pH: 6.5,
      moisture: 25,
      N: 45,
      P: 30,
      K: 40,
      organicMatter: 3.5,
      healthStatus: "Good",
      suitableCrops: ["Maize", "Beans"],
      livestock: "None",
      aquatic: "None",
      images: [],
    },
    {
      id: 2,
      name: "Farmer Akosua",
      farmName: "East Legon Farm",
      farmType: "Livestock",
      region: "Greater Accra",
      location: { lat: 5.6285, lng: -0.1543 },
      locationDescription: "East Legon",
      landSize: "2 ha",
      soilType: "Sandy",
      pH: 5.9,
      moisture: 18,
      N: 32,
      P: 22,
      K: 29,
      organicMatter: 2.0,
      healthStatus: "Moderate",
      suitableCrops: ["Cassava", "Okra"],
      livestock: "Goats",
      aquatic: "None",
      images: [],
    },
  
    // Ashanti
    {
      id: 3,
      name: "Farmer Kwame",
      farmName: "Kumasi Highlands",
      farmType: "Mixed",
      region: "Ashanti",
      location: { lat: 6.6885, lng: -1.6244 },
      locationDescription: "Kumasi",
      landSize: "6 ha",
      soilType: "Loamy",
      pH: 6.2,
      moisture: 22,
      N: 40,
      P: 27,
      K: 35,
      organicMatter: 3.1,
      healthStatus: "Good",
      suitableCrops: ["Yam", "Plantain", "Cocoa"],
      livestock: "Sheep",
      aquatic: "None",
      images: [],
    },
    {
      id: 4,
      name: "Farmer Abena",
      farmName: "Asante Farm",
      farmType: "Crop",
      region: "Ashanti",
      location: { lat: 6.705, lng: -1.620 },
      locationDescription: "Asante Region",
      landSize: "4 ha",
      soilType: "Clay",
      pH: 6.0,
      moisture: 24,
      N: 42,
      P: 25,
      K: 33,
      organicMatter: 3.3,
      healthStatus: "Good",
      suitableCrops: ["Rice", "Maize"],
      livestock: "None",
      aquatic: "None",
      images: [],
    },
  
    // Northern
    {
      id: 5,
      name: "Farmer Alhassan",
      farmName: "Tamale Fields",
      farmType: "Crop",
      region: "Northern",
      location: { lat: 9.4008, lng: -0.8393 },
      locationDescription: "Tamale Area",
      landSize: "7 ha",
      soilType: "Sandy Loam",
      pH: 6.1,
      moisture: 20,
      N: 37,
      P: 24,
      K: 29,
      organicMatter: 2.7,
      healthStatus: "Moderate",
      suitableCrops: ["Sorghum", "Millet", "Groundnuts"],
      livestock: "Cattle",
      aquatic: "None",
      images: [],
    },
    {
      id: 6,
      name: "Farmer Fatima",
      farmName: "Northern Mixed Farm",
      farmType: "Mixed",
      region: "Northern",
      location: { lat: 9.4200, lng: -0.8400 },
      locationDescription: "Tamale Outskirts",
      landSize: "5 ha",
      soilType: "Loamy",
      pH: 6.3,
      moisture: 22,
      N: 39,
      P: 26,
      K: 31,
      organicMatter: 3.0,
      healthStatus: "Good",
      suitableCrops: ["Beans", "Millet"],
      livestock: "Goats",
      aquatic: "Fish",
      images: [],
    },
  
    // Volta
    {
      id: 7,
      name: "Farmer Esi",
      farmName: "Volta Valley",
      farmType: "Crop",
      region: "Volta",
      location: { lat: 6.6000, lng: 0.4700 },
      locationDescription: "Hohoe Area",
      landSize: "4.5 ha",
      soilType: "Lateritic",
      pH: 5.5,
      moisture: 21,
      N: 33,
      P: 20,
      K: 25,
      organicMatter: 2.4,
      healthStatus: "Moderate",
      suitableCrops: ["Cassava", "Yam", "Plantain"],
      livestock: "None",
      aquatic: "None",
      images: [],
    },
    {
      id: 8,
      name: "Farmer Kojo",
      farmName: "Lake Volta Aquafarm",
      farmType: "Aquatic",
      region: "Volta",
      location: { lat: 6.4000, lng: 0.4500 },
      locationDescription: "Lake Volta",
      landSize: "3 ha",
      soilType: "Clay",
      pH: 6.0,
      moisture: 25,
      N: 30,
      P: 18,
      K: 22,
      organicMatter: 2.0,
      healthStatus: "Good",
      suitableCrops: ["Water Hyacinth"],
      livestock: "None",
      aquatic: "Fish",
      images: [],
    },
  
    // Western
    {
      id: 9,
      name: "Farmer Ama",
      farmName: "Western Highlands",
      farmType: "Crop",
      region: "Western",
      location: { lat: 5.2000, lng: -1.6000 },
      locationDescription: "Wiawso Area",
      landSize: "6 ha",
      soilType: "Loamy",
      pH: 6.4,
      moisture: 24,
      N: 41,
      P: 28,
      K: 35,
      organicMatter: 3.2,
      healthStatus: "Good",
      suitableCrops: ["Maize", "Cocoa", "Yam"],
      livestock: "None",
      aquatic: "None",
      images: [],
    },
    {
      id: 10,
      name: "Farmer Kofi",
      farmName: "Sekondi Coastal Farm",
      farmType: "Mixed",
      region: "Western",
      location: { lat: 4.9376, lng: -1.7603 },
      locationDescription: "Sekondi-Takoradi",
      landSize: "5 ha",
      soilType: "Sandy Loam",
      pH: 6.0,
      moisture: 21,
      N: 36,
      P: 24,
      K: 29,
      organicMatter: 2.5,
      healthStatus: "Moderate",
      suitableCrops: ["Cocoa", "Oil Palm", "Plantain"],
      livestock: "Sheep",
      aquatic: "None",
      images: [],
    },
  
    // Eastern
    {
      id: 11,
      name: "Farmer Yaw",
      farmName: "Bono Farm",
      farmType: "Crop",
      region: "Eastern",
      location: { lat: 6.4000, lng: -0.7830 },
      locationDescription: "Koforidua",
      landSize: "5 ha",
      soilType: "Loamy",
      pH: 6.2,
      moisture: 23,
      N: 39,
      P: 26,
      K: 31,
      organicMatter: 3.0,
      healthStatus: "Good",
      suitableCrops: ["Plantain", "Cocoa", "Pineapple"],
      livestock: "None",
      aquatic: "None",
      images: [],
    },
    {
      id: 12,
      name: "Farmer Afia",
      farmName: "Eastern Aquafarm",
      farmType: "Aquatic",
      region: "Eastern",
      location: { lat: 6.3500, lng: -0.7700 },
      locationDescription: "Eastern Lake",
      landSize: "3 ha",
      soilType: "Clay",
      pH: 6.1,
      moisture: 24,
      N: 30,
      P: 22,
      K: 27,
      organicMatter: 2.1,
      healthStatus: "Good",
      suitableCrops: ["Water Lettuce"],
      livestock: "None",
      aquatic: "Fish",
      images: [],
    },
  
    // Bono
    {
      id: 13,
      name: "Farmer Mensah",
      farmName: "Bono Plains",
      farmType: "Crop",
      region: "Bono",
      location: { lat: 7.7333, lng: -2.1 },
      locationDescription: "Sunyani",
      landSize: "5.5 ha",
      soilType: "Loamy",
      pH: 6.3,
      moisture: 23,
      N: 41,
      P: 27,
      K: 34,
      organicMatter: 3.1,
      healthStatus: "Good",
      suitableCrops: ["Maize", "Yam"],
      livestock: "None",
      aquatic: "None",
      images: [],
    },
    {
      id: 14,
      name: "Farmer Akua",
      farmName: "Bono Livestock",
      farmType: "Livestock",
      region: "Bono",
      location: { lat: 7.7, lng: -2.12 },
      locationDescription: "Sunyani East",
      landSize: "3 ha",
      soilType: "Clay",
      pH: 6.0,
      moisture: 20,
      N: 36,
      P: 24,
      K: 29,
      organicMatter: 2.7,
      healthStatus: "Moderate",
      suitableCrops: ["Cassava"],
      livestock: "Goats",
      aquatic: "None",
      images: [],
    },
  
    // Upper East
    {
      id: 15,
      name: "Farmer Amina",
      farmName: "Upper East Hills",
      farmType: "Crop",
      region: "Upper East",
      location: { lat: 10.7, lng: -0.26 },
      locationDescription: "Bolgatanga",
      landSize: "4 ha",
      soilType: "Sandy",
      pH: 5.8,
      moisture: 19,
      N: 32,
      P: 21,
      K: 27,
      organicMatter: 2.3,
      healthStatus: "Moderate",
      suitableCrops: ["Millet", "Sorghum"],
      livestock: "None",
      aquatic: "None",
      images: [],
    },
    {
      id: 16,
      name: "Farmer Issah",
      farmName: "Upper East Livestock",
      farmType: "Livestock",
      region: "Upper East",
      location: { lat: 10.75, lng: -0.25 },
      locationDescription: "Bolgatanga East",
      landSize: "3 ha",
      soilType: "Loamy",
      pH: 6.1,
      moisture: 22,
      N: 37,
      P: 26,
      K: 31,
      organicMatter: 2.9,
      healthStatus: "Good",
      suitableCrops: ["None"],
      livestock: "Sheep",
      aquatic: "None",
      images: [],
    },
  
    // Upper West
    {
      id: 17,
      name: "Farmer Suleman",
      farmName: "Upper West Plains",
      farmType: "Crop",
      region: "Upper West",
      location: { lat: 10.0, lng: -2.5 },
      locationDescription: "Wa",
      landSize: "5 ha",
      soilType: "Sandy Loam",
      pH: 6.0,
      moisture: 21,
      N: 35,
      P: 24,
      K: 28,
      organicMatter: 2.8,
      healthStatus: "Moderate",
      suitableCrops: ["Groundnuts", "Millet"],
      livestock: "None",
      aquatic: "None",
      images: [],
    },
    {
      id: 18,
      name: "Farmer Hawa",
      farmName: "Upper West Mixed",
      farmType: "Mixed",
      region: "Upper West",
      location: { lat: 10.1, lng: -2.6 },
      locationDescription: "Wa East",
      landSize: "4 ha",
      soilType: "Loamy",
      pH: 6.2,
      moisture: 22,
      N: 38,
      P: 27,
      K: 31,
      organicMatter: 3.0,
      healthStatus: "Good",
      suitableCrops: ["Beans", "Maize"],
      livestock: "Goats",
      aquatic: "Fish",
      images: [],
    },
  
    // Central
    {
      id: 19,
      name: "Farmer Nana",
      farmName: "Central Coast",
      farmType: "Crop",
      region: "Central",
      location: { lat: 5.1000, lng: -1.2500 },
      locationDescription: "Cape Coast",
      landSize: "6 ha",
      soilType: "Loamy",
      pH: 6.4,
      moisture: 24,
      N: 40,
      P: 28,
      K: 36,
      organicMatter: 3.1,
      healthStatus: "Good",
      suitableCrops: ["Cocoa", "Plantain"],
      livestock: "None",
      aquatic: "None",
      images: [],
    },
    {
      id: 20,
      name: "Farmer Abena",
      farmName: "Central Livestock",
      farmType: "Livestock",
      region: "Central",
      location: { lat: 5.1200, lng: -1.2600 },
      locationDescription: "Cape Coast East",
      landSize: "4 ha",
      soilType: "Sandy Loam",
      pH: 6.1,
      moisture: 22,
      N: 35,
      P: 24,
      K: 28,
      organicMatter: 2.7,
      healthStatus: "Moderate",
      suitableCrops: ["Cassava"],
      livestock: "Cattle",
      aquatic: "None",
      images: [],
    },
  
    // Greater Accra (additional)
    {
      id: 21,
      name: "Farmer Kojo",
      farmName: "Tema Farm",
      farmType: "Crop",
      region: "Greater Accra",
      location: { lat: 5.6691, lng: -0.0153 },
      locationDescription: "Tema",
      landSize: "3 ha",
      soilType: "Sandy",
      pH: 6.0,
      moisture: 20,
      N: 35,
      P: 22,
      K: 30,
      organicMatter: 2.5,
      healthStatus: "Good",
      suitableCrops: ["Maize", "Tomato"],
      livestock: "None",
      aquatic: "None",
      images: [],
    },
  
    // Oti
    {
      id: 22,
      name: "Farmer Ebo",
      farmName: "Oti Valley",
      farmType: "Crop",
      region: "Oti",
      location: { lat: 7.5, lng: 0.3 },
      locationDescription: "Nkwanta",
      landSize: "4 ha",
      soilType: "Loamy",
      pH: 6.2,
      moisture: 23,
      N: 39,
      P: 26,
      K: 32,
      organicMatter: 3.0,
      healthStatus: "Good",
      suitableCrops: ["Cassava", "Yam"],
      livestock: "None",
      aquatic: "None",
      images: [],
    },
    {
      id: 23,
      name: "Farmer Adjoa",
      farmName: "Oti Livestock",
      farmType: "Livestock",
      region: "Oti",
      location: { lat: 7.52, lng: 0.32 },
      locationDescription: "Nkwanta East",
      landSize: "3 ha",
      soilType: "Clay",
      pH: 6.1,
      moisture: 21,
      N: 37,
      P: 25,
      K: 29,
      organicMatter: 2.7,
      healthStatus: "Moderate",
      suitableCrops: ["Maize"],
      livestock: "Goats",
      aquatic: "None",
      images: [],
    },
  
    // Savannah
    {
      id: 24,
      name: "Farmer Badu",
      farmName: "Savannah Plains",
      farmType: "Crop",
      region: "Savannah",
      location: { lat: 9.3, lng: -1.3 },
      locationDescription: "Damongo",
      landSize: "6 ha",
      soilType: "Sandy Loam",
      pH: 6.0,
      moisture: 22,
      N: 38,
      P: 27,
      K: 33,
      organicMatter: 3.1,
      healthStatus: "Good",
      suitableCrops: ["Millet", "Groundnuts"],
      livestock: "None",
      aquatic: "None",
      images: [],
    },
    {
      id: 25,
      name: "Farmer Yeboah",
      farmName: "Savannah Livestock",
      farmType: "Livestock",
      region: "Savannah",
      location: { lat: 9.31, lng: -1.29 },
      locationDescription: "Damongo East",
      landSize: "4 ha",
      soilType: "Loamy",
      pH: 6.1,
      moisture: 20,
      N: 35,
      P: 24,
      K: 28,
      organicMatter: 2.8,
      healthStatus: "Moderate",
      suitableCrops: ["None"],
      livestock: "Cattle",
      aquatic: "None",
      images: [],
    },
  
    // North East
    {
      id: 26,
      name: "Farmer Abubakar",
      farmName: "North East Crops",
      farmType: "Crop",
      region: "North East",
      location: { lat: 9.9, lng: -0.7 },
      locationDescription: "Nalerigu",
      landSize: "5 ha",
      soilType: "Sandy Loam",
      pH: 6.0,
      moisture: 21,
      N: 36,
      P: 25,
      K: 30,
      organicMatter: 2.9,
      healthStatus: "Good",
      suitableCrops: ["Millet", "Sorghum"],
      livestock: "None",
      aquatic: "None",
      images: [],
    },
    {
      id: 27,
      name: "Farmer Hawa",
      farmName: "North East Livestock",
      farmType: "Livestock",
      region: "North East",
      location: { lat: 9.92, lng: -0.69 },
      locationDescription: "Nalerigu East",
      landSize: "3 ha",
      soilType: "Loamy",
      pH: 6.2,
      moisture: 20,
      N: 33,
      P: 22,
      K: 28,
      organicMatter: 2.5,
      healthStatus: "Moderate",
      suitableCrops: ["None"],
      livestock: "Goats",
      aquatic: "None",
      images: [],
    },
  
    // Western North
    {
      id: 28,
      name: "Farmer Kwaku",
      farmName: "Western North Farm",
      farmType: "Crop",
      region: "Western North",
      location: { lat: 6.550, lng: -2.300 },
      locationDescription: "Sefwi Wiawso",
      landSize: "5 ha",
      soilType: "Loamy",
      pH: 6.3,
      moisture: 24,
      N: 40,
      P: 28,
      K: 33,
      organicMatter: 3.0,
      healthStatus: "Good",
      suitableCrops: ["Cocoa", "Yam"],
      livestock: "None",
      aquatic: "None",
      images: [],
    },
    {
      id: 29,
      name: "Farmer Abena",
      farmName: "Western North Livestock",
      farmType: "Livestock",
      region: "Western North",
      location: { lat: 6.560, lng: -2.320 },
      locationDescription: "Sefwi Bekwai",
      landSize: "3 ha",
      soilType: "Clay",
      pH: 6.1,
      moisture: 21,
      N: 35,
      P: 24,
      K: 29,
      organicMatter: 2.7,
      healthStatus: "Moderate",
      suitableCrops: ["Cassava"],
      livestock: "Sheep",
      aquatic: "None",
      images: [],
    },
  
    // Ahafo
    {
      id: 30,
      name: "Farmer Kofi",
      farmName: "Ahafo Crops",
      farmType: "Crop",
      region: "Ahafo",
      location: { lat: 7.000, lng: -2.050 },
      locationDescription: "Goaso",
      landSize: "6 ha",
      soilType: "Loamy",
      pH: 6.4,
      moisture: 23,
      N: 41,
      P: 27,
      K: 33,
      organicMatter: 3.1,
      healthStatus: "Good",
      suitableCrops: ["Plantain", "Maize"],
      livestock: "None",
      aquatic: "None",
      images: [],
    },
    {
      id: 31,
      name: "Farmer Ama",
      farmName: "Ahafo Livestock",
      farmType: "Livestock",
      region: "Ahafo",
      location: { lat: 7.020, lng: -2.070 },
      locationDescription: "Goaso East",
      landSize: "4 ha",
      soilType: "Clay",
      pH: 6.1,
      moisture: 20,
      N: 36,
      P: 24,
      K: 29,
      organicMatter: 2.8,
      healthStatus: "Moderate",
      suitableCrops: ["Cassava"],
      livestock: "Goats",
      aquatic: "None",
      images: [],
    },
  ];
  

  const allProfiles = [...sampleProfiles, ...farmData];

  // Marker color based on soil type
  const getMarkerColor = (soilType) => {
    switch (soilType.toLowerCase()) {
      case "loamy": return "#3388ff";
      case "sandy": return "#ff7f50";
      case "clay": return "#8b4513";
      default: return "#888";
    }
  };

  // Filtering + Sorting
  const filteredProfiles = allProfiles
    .filter(p => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = p.farmName.toLowerCase().includes(term) || p.name.toLowerCase().includes(term);
      const matchesType = farmTypeFilter === "All" || p.farmType === farmTypeFilter;
      const matchesRegion = regionFilter === "All" || p.region === regionFilter;
      return matchesSearch && matchesType && matchesRegion;
    })
    .sort((a, b) => {
      const valA = a[sortKey] || "";
      const valB = b[sortKey] || "";
      return sortOrder === "asc" ? valA.toString().localeCompare(valB.toString()) : valB.toString().localeCompare(valA.toString());
    });

  const filteredMyFarms = farmData
    .filter((farm) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = farm.farmName.toLowerCase().includes(term) || farm.name.toLowerCase().includes(term);
      const matchesType = farmTypeFilter === "All" || farm.farmType === farmTypeFilter;
      const matchesRegion = regionFilter === "All" || farm.region === regionFilter;
      return matchesSearch && matchesType && matchesRegion;
    })
    .sort((first, second) => {
      const firstValue = first[sortKey] || "";
      const secondValue = second[sortKey] || "";
      return sortOrder === "asc" ? firstValue.toString().localeCompare(secondValue.toString()) : secondValue.toString().localeCompare(firstValue.toString());
    });

  // Pagination
  const indexOfLast = currentPage * farmsPerPage;
  const currentFarms = filteredMyFarms.slice(indexOfLast - farmsPerPage, indexOfLast);
  const totalPages = Math.max(1, Math.ceil(filteredMyFarms.length / farmsPerPage));

  const handleRowClick = (p) => {
    setSelectedProfile(p);
    setShowDetailsModal(true);
    if (mapSupported) mapRef.current?.flyTo({ center: [p.location.lng, p.location.lat], zoom: 12 });
    else fallbackMapRef.current?.flyTo([p.location.lat, p.location.lng], 12);
  };

  const handleAddFarm = async (e) => {
    e.preventDefault();
    setFarmError("");
    const normalizedFarmName = newFarm.farmName.trim().toLowerCase();
    if (farmData.some((farm) => farm.id !== editingFarmId && farm.farmName?.trim().toLowerCase() === normalizedFarmName)) {
      setFarmError("You already have a farm with this name. Enter a different name.");
      return;
    }
    const selectedLocation = newFarm.location && Number.isFinite(newFarm.location.lat) && Number.isFinite(newFarm.location.lng)
      ? newFarm.location
      : { lat: parseFloat(newFarm.lat), lng: parseFloat(newFarm.lng) };
    if (!Number.isFinite(selectedLocation.lat) || !Number.isFinite(selectedLocation.lng)) {
      setFarmError("Select the farm location with Use Current Location before saving.");
      return;
    }
    const newFarmObj = {
      id: Date.now(),
      ...newFarm,
      farmName: newFarm.farmName.trim(),
      name: currentUser?.name || "",
      location: selectedLocation,
      pH: newFarm.pH === "" ? "" : Number(newFarm.pH),
      moisture: newFarm.moisture === "" ? "" : Number(newFarm.moisture),
      N: newFarm.N === "" ? "" : Number(newFarm.N),
      P: newFarm.P === "" ? "" : Number(newFarm.P),
      K: newFarm.K === "" ? "" : Number(newFarm.K),
      organicMatter: newFarm.organicMatter === "" ? "" : Number(newFarm.organicMatter),
      suitableCrops: Array.isArray(newFarm.suitableCrops) ? newFarm.suitableCrops : newFarm.suitableCrops.split(",").map(c => c.trim()).filter(Boolean),
    };
    try {
      const savedProfile = editingFarmId
        ? await api.updateGeoSenseFarm(editingFarmId, newFarmObj)
        : await api.createGeoSenseFarm(newFarmObj);
      const updatedProfiles = editingFarmId
        ? farmData.map((farm) => farm.id === editingFarmId ? savedProfile : farm)
        : [savedProfile, ...farmData];
      setFarmData(updatedProfiles);
      saveFarmProfiles(updatedProfiles);
      setSearchTerm(savedProfile.farmName);
      setFarmTypeFilter("All");
      setRegionFilter("All");
      setCurrentPage(1);
      if (soilPrefillPending && !editingFarmId) {
        clearPendingSoilResult();
        setSoilPrefillPending(null);
      }
      setShowAddDialog(false);
      setSavedFarm(editingFarmId ? null : savedProfile);
      setFarmNotice(editingFarmId ? `Farm "${savedProfile.farmName}" updated.` : "");
      setEditingFarmId(null);
      setNewFarm({ name: currentUser?.name || "", farmName: "", farmType: "Crop", region: "Greater Accra", lat: "", lng: "", location: null, locationDescription: "", landSize: "", soilType: "", pH: "", moisture: "", N: "", P: "", K: "", organicMatter: "", healthStatus: "", suitableCrops: "", livestock: "", aquatic: "", images: [] });
    } catch (requestError) {
      setFarmError(requestError.message || "Farm could not be saved. Check your connection and try again.");
    }
  };

  const startAddFarm = () => {
    setFarmError("");
    setEditingFarmId(null);
    setSoilPrefillPending(null);
    setNewFarm({ name: currentUser?.name || "", farmName: "", farmType: "Crop", region: "Greater Accra", lat: "", lng: "", location: null, locationDescription: "", landSize: "", soilType: "", pH: "", moisture: "", N: "", P: "", K: "", organicMatter: "", healthStatus: "", suitableCrops: "", livestock: "", aquatic: "", images: [] });
    setShowAddDialog(true);
  };

  const startEditFarm = (farm) => {
    setFarmError("");
    setEditingFarmId(farm.id);
    setSoilPrefillPending(null);
    setNewFarm({
      ...farm,
      name: currentUser?.name || "",
      location: farm.location || null,
      pH: farm.pH ?? "",
      moisture: farm.moisture ?? "",
      N: farm.N ?? "",
      P: farm.P ?? "",
      K: farm.K ?? "",
      organicMatter: farm.organicMatter ?? "",
      suitableCrops: Array.isArray(farm.suitableCrops) ? farm.suitableCrops.join(", ") : farm.suitableCrops || "",
    });
    setShowAddDialog(true);
  };

  const removeFarm = async (farm) => {
    if (!window.confirm(`Delete farm "${farm.farmName}"? This cannot be undone.`)) return;
    setFarmError("");
    try {
      await api.deleteGeoSenseFarm(farm.id);
      const updatedProfiles = farmData.filter((profile) => profile.id !== farm.id);
      setFarmData(updatedProfiles);
      saveFarmProfiles(updatedProfiles);
      if (selectedProfile?.id === farm.id) {
        setSelectedProfile(null);
        setShowDetailsModal(false);
      }
      setSearchTerm("");
      setCurrentPage(1);
      setFarmNotice(`Farm "${farm.farmName}" deleted.`);
    } catch (requestError) {
      setFarmError(requestError.message || "Farm could not be deleted. Check your connection and try again.");
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const urls = files.map(file => URL.createObjectURL(file));
    setNewFarm({ ...newFarm, images: [...newFarm.images, ...urls] });
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredProfiles);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Farms");
    XLSX.writeFile(workbook, "farm_data.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Farm Data Report", 14, 10);
    const tableData = filteredProfiles.map(p => [p.farmName, p.name, p.farmType, p.region, p.soilType, p.healthStatus]);
    doc.autoTable({ head: [["Farm Name", "Farmer", "Type", "Region", "Soil", "Health"]], body: tableData });
    doc.save("farm_data.pdf");
  };

  const printFarm = () => {
    const printContent = `
      <h2>${selectedProfile.farmName}</h2>
      <p>Farmer: ${selectedProfile.name}</p>
      <p>Region: ${selectedProfile.region}</p>
      <p>Soil: ${selectedProfile.soilType}, pH ${selectedProfile.pH}</p>
    `;
    const newWindow = window.open("", "", "width=600,height=400");
    newWindow.document.write(printContent);
    newWindow.print();
  };

  return (
    <div style={{ fontFamily: "Arial", padding: 20 }}>
      <section aria-label="Farm map controls" className="mb-4 rounded-lg border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
          <label className="min-w-0 flex-1 text-xs font-semibold text-gray-600">
            Search farms
            <span className="relative mt-1.5 block">
              <Search size={17} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchTerm}
                onChange={(event) => { setSearchTerm(event.target.value); setCurrentPage(1); }}
                placeholder="Name or farm name"
                className="w-full rounded-md border border-gray-300 bg-gray-50 py-2.5 pl-9 pr-9 text-sm font-normal text-gray-900 outline-none transition focus:border-emerald-700 focus:bg-white focus:ring-2 focus:ring-emerald-700/15"
              />
              {searchTerm && <button type="button" onClick={() => setSearchTerm("")} aria-label="Clear farm search" title="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"><X size={15} aria-hidden="true" /></button>}
            </span>
          </label>

          <label className="text-xs font-semibold text-gray-600 xl:w-40">
            Farm type
            <span className="relative mt-1.5 block">
              <SlidersHorizontal size={15} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select value={farmTypeFilter} onChange={(event) => { setFarmTypeFilter(event.target.value); setCurrentPage(1); }} className="w-full appearance-none rounded-md border border-gray-300 bg-gray-50 py-2.5 pl-9 pr-3 text-sm font-normal text-gray-900 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15">
                <option>All</option><option>Crop</option><option>Livestock</option><option>Aquatic</option><option>Mixed</option>
              </select>
            </span>
          </label>

          <label className="text-xs font-semibold text-gray-600 xl:w-44">
            Region
            <select value={regionFilter} onChange={(event) => { setRegionFilter(event.target.value); setCurrentPage(1); }} className="mt-1.5 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm font-normal text-gray-900 outline-none focus:border-emerald-700 focus:bg-white focus:ring-2 focus:ring-emerald-700/15">
              <option>All</option>{GHANA_REGIONS.map((region) => <option key={region}>{region}</option>)}
            </select>
          </label>

          <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-3 xl:border-l xl:border-t-0 xl:pl-4 xl:pt-0">
            <span className="whitespace-nowrap text-sm text-gray-500"><strong className="text-gray-900">{filteredProfiles.length}</strong> results</span>
            <div className="flex gap-2">
              <button type="button" onClick={exportToExcel} title="Export Excel" className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:border-emerald-700 hover:bg-emerald-50 hover:text-emerald-900"><FileSpreadsheet size={16} aria-hidden="true" /><span className="hidden sm:inline">Excel</span></button>
              <button type="button" onClick={exportToPDF} title="Export PDF" className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:border-emerald-700 hover:bg-emerald-50 hover:text-emerald-900"><FileText size={16} aria-hidden="true" /><span className="hidden sm:inline">PDF</span><Download size={13} aria-hidden="true" className="hidden sm:block" /></button>
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <div style={{ width: "100%", height: "clamp(320px, 58vh, 640px)", minHeight: 320, marginBottom: 20 }}>
        {mapSupported ? <Map
          ref={mapRef}
          initialViewState={{ longitude: -1.0232, latitude: 7.9465, zoom: 6 }}
          style={{ width: "100%", height: "100%" }}
          mapStyle="mapbox://styles/mapbox/streets-v11"
          mapboxAccessToken={MAPBOX_TOKEN}
          onClick={() => setSelectedProfile(null)}
        >
          {filteredProfiles.map((p) => (
            <Marker key={p.id} longitude={p.location.lng} latitude={p.location.lat} anchor="bottom">
              <div
                onClick={() => handleRowClick(p)}
                onMouseEnter={() => setHoveredFarm(p)}
                onMouseLeave={() => setHoveredFarm(null)}
                style={{
                  fontSize: 28,
                  cursor: "pointer",
                  userSelect: "none",
                  textShadow: "0 0 3px white",
                }}
                aria-label={`${p.farmType} farm marker`}
                role="img"
                title={`${p.farmType} Farm: ${p.farmName}`}
              >
                {farmTypeIcons[p.farmType] || farmTypeIcons.Default}
              </div>
            </Marker>
          ))}

          {hoveredFarm && (
            <Popup
              longitude={hoveredFarm.location.lng}
              latitude={hoveredFarm.location.lat}
              closeButton={false}
              closeOnClick={false}
              anchor="top"
              offset={[0, -20]}
            >
              <div style={{ maxWidth: 220 }}>
                <strong>{hoveredFarm.farmName}</strong><br />
                Farmer: {hoveredFarm.name}<br />
                Type: {hoveredFarm.farmType}<br />
                Region: {hoveredFarm.region}<br />
                Soil: {hoveredFarm.soilType}<br />
                Health: {hoveredFarm.healthStatus}
              </div>
            </Popup>
          )}
        </Map> : <LeafletFarmMap profiles={filteredProfiles} onSelect={handleRowClick} />}
      </div>

      <section aria-labelledby="farm-list" className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-4 sm:px-5">
          <div>
            <h2 id="farm-list" className="text-lg font-semibold text-gray-950">Farm List</h2>
            <p className="mt-0.5 text-sm text-gray-500">Select a farm to inspect its profile and soil readings.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">{filteredMyFarms.length} {filteredMyFarms.length === 1 ? "farm" : "farms"}</span>
            <button type="button" onClick={startAddFarm} className="inline-flex items-center gap-2 rounded-md bg-emerald-800 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/30">
              <Plus size={16} aria-hidden="true" />Add farm
            </button>
          </div>
        </header>
        {farmNotice && <p role="status" className="mx-4 mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 sm:mx-5">{farmNotice}</p>}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left text-sm" aria-label="List of farms">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                {["Farm", "Farmer", "Type", "Region", "Soil", "Health", "Manage"].map((header) => (
                  <th key={header} className="border-b border-gray-200 px-4 py-3 font-semibold first:pl-5">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentFarms.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-500">{farmData.length ? "No farms match these filters." : "You have not added a farm yet."}</td></tr>
              ) : currentFarms.map((farm) => (
                <tr
                  key={farm.id}
                  onClick={() => handleRowClick(farm)}
                  onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); handleRowClick(farm); } }}
                  tabIndex={0}
                  aria-label={`Open ${farm.farmName}, farm owned by ${farm.name}`}
                  className="cursor-pointer transition-colors hover:bg-emerald-50/60 focus:bg-emerald-50 focus:outline-none"
                >
                  <td className="px-4 py-3.5 pl-5"><span className="block font-semibold text-gray-950">{farm.farmName}</span><span className="mt-0.5 block text-xs text-gray-500">{farm.landSize || "Farm profile"}</span></td>
                  <td className="px-4 py-3.5 text-gray-700">{farm.name}</td>
                  <td className="px-4 py-3.5"><span className="inline-flex rounded-full bg-lime-50 px-2.5 py-1 text-xs font-medium text-lime-800">{farm.farmType}</span></td>
                  <td className="px-4 py-3.5 text-gray-700">{farm.region}</td>
                  <td className="px-4 py-3.5 text-gray-700">{farm.soilType || "Not tested"}{farm.pH !== "" && farm.pH !== undefined && <span className="mt-0.5 block text-xs text-gray-500">pH {farm.pH}</span>}</td>
                  <td className="px-4 py-3.5"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${/poor|high|urgent|attention/i.test(farm.healthStatus || "") ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-800"}`}>{farm.healthStatus || "Not assessed"}</span></td>
                  <td className="px-4 py-3.5" onClick={(event) => event.stopPropagation()}>
                    {farm.ownerId === currentUser?.id ? (
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => startEditFarm(farm)} className="rounded border border-emerald-700 px-2.5 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-50">Edit</button>
                        <button type="button" onClick={() => removeFarm(farm)} className="rounded border border-red-300 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50">Delete</button>
                      </div>
                    ) : <span className="text-xs text-gray-400">Demo profile</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

{/* Pagination Controls */}
<div
  style={{
    marginTop: 15,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  }}
  aria-label="Pagination Controls"
>
  <button
    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
    disabled={currentPage === 1}
    style={{
      padding: "8px 14px",
      backgroundColor: currentPage === 1 ? "#ccc" : "#27ae60",
      color: "white",
      border: "none",
      borderRadius: 4,
      cursor: currentPage === 1 ? "not-allowed" : "pointer",
      transition: "background-color 0.3s ease",
    }}
    aria-disabled={currentPage === 1}
    aria-label="Previous page"
  >
    Previous
  </button>
  <span style={{ fontWeight: "bold" }}>
    Page {currentPage} of {totalPages}
  </span>
  <button
    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
    disabled={currentPage === totalPages}
    style={{
      padding: "8px 14px",
      backgroundColor: currentPage === totalPages ? "#ccc" : "#27ae60",
      color: "white",
      border: "none",
      borderRadius: 4,
      cursor: currentPage === totalPages ? "not-allowed" : "pointer",
      transition: "background-color 0.3s ease",
    }}
    aria-disabled={currentPage === totalPages}
    aria-label="Next page"
  >
    Next
  </button>
</div>

      {/* Farm Details Modal */}
      {showDetailsModal && selectedProfile && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-gray-950/55 p-3 backdrop-blur-sm sm:p-6"
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="farm-profile-title"
            className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-gray-50 shadow-2xl"
          >
            <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-emerald-100 bg-white px-5 py-5 sm:px-7">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase text-emerald-800">Farm profile</p>
                <h2 id="farm-profile-title" className="mt-1 truncate text-2xl font-bold text-gray-950">{selectedProfile.farmName || "Unnamed farm"}</h2>
                <p className="mt-1 text-sm text-gray-600">Managed by {selectedProfile.name || "Farmer not recorded"}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900">{selectedProfile.farmType || "Farm"}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"><MapPin size={13} aria-hidden="true" />{selectedProfile.region || "Region not set"}</span>
                </div>
              </div>
              <button type="button" onClick={() => setShowDetailsModal(false)} aria-label="Close farm profile" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900"><X size={19} aria-hidden="true" /></button>
            </header>

            <div className="space-y-5 p-4 sm:p-7">
              <section className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="Soil summary">
                <FarmMetric label="Soil type" value={selectedProfile.soilType || "Not tested"} />
                <FarmMetric label="pH" value={selectedProfile.pH ?? "—"} />
                <FarmMetric label="Moisture" value={selectedProfile.moisture === "" || selectedProfile.moisture === undefined ? "—" : `${selectedProfile.moisture}%`} />
                <FarmMetric label="Organic matter" value={selectedProfile.organicMatter === "" || selectedProfile.organicMatter === undefined ? "—" : `${selectedProfile.organicMatter}%`} />
              </section>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.2fr_0.8fr]">
                <section className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div><h3 className="font-semibold text-gray-950">Soil nutrients</h3><p className="mt-1 text-xs text-gray-500">Recorded NPK values</p></div>
                    <Sprout className="text-emerald-700" size={20} aria-hidden="true" />
                  </div>
                  <div className="mt-4 h-56 min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[{ name: "Nitrogen", value: Number(selectedProfile.N) || 0 }, { name: "Phosphorus", value: Number(selectedProfile.P) || 0 }, { name: "Potassium", value: Number(selectedProfile.K) || 0 }]} margin={{ top: 8, right: 12, left: -18, bottom: 4 }}>
                        <XAxis dataKey="name" tick={{ fill: "#4b5563", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip cursor={{ fill: "#f0fdf4" }} contentStyle={{ borderRadius: 8, borderColor: "#d1d5db" }} />
                        <Bar dataKey="value" name="Level" fill="#16803c" radius={[5, 5, 0, 0]} maxBarSize={48} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
                  <h3 className="font-semibold text-gray-950">Farm details</h3>
                  <Detail label="Location" value={selectedProfile.locationDescription || (selectedProfile.location ? `${selectedProfile.location.lat.toFixed(5)}, ${selectedProfile.location.lng.toFixed(5)}` : "Not recorded")} />
                  <Detail label="Land size" value={selectedProfile.landSize || "Not recorded"} />
                  <Detail label="Health status" value={selectedProfile.healthStatus || "Not assessed"} />
                  <Detail label="Suitable crops" value={Array.isArray(selectedProfile.suitableCrops) ? selectedProfile.suitableCrops.join(", ") || "Not recorded" : selectedProfile.suitableCrops || "Not recorded"} />
                  <Detail label="Livestock" value={selectedProfile.livestock || "None recorded"} />
                  <Detail label="Aquatic" value={selectedProfile.aquatic || "None recorded"} />
                </section>
              </div>

              <section className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
                <h3 className="font-semibold text-gray-950">Farm photos</h3>
                {selectedProfile.images?.length > 0 ? (
                  <div className="mt-3 flex gap-3 overflow-x-auto pb-1">{selectedProfile.images.map((image, index) => <img key={`${image}-${index}`} src={image} alt={`${selectedProfile.farmName} view ${index + 1}`} className="h-24 w-32 rounded-md object-cover" />)}</div>
                ) : <p className="mt-2 text-sm text-gray-500">No images uploaded.</p>}
              </section>

              <footer className="flex flex-wrap justify-end gap-2 border-t border-gray-200 pt-4">
                <button type="button" onClick={printFarm} className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"><Printer size={16} aria-hidden="true" />Print report</button>
                <button type="button" onClick={() => setShowDetailsModal(false)} className="rounded-md bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-900">Close profile</button>
              </footer>
            </div>
          </div>
        </div>
      )}

    {/* Add Farm Dialog */}
    {showAddDialog && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 20, 0.58)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflowY: "auto",
            padding: 16,
            zIndex: 9999,
          }}
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={handleAddFarm}
            className="geosense-farm-editor"
            style={{
              background: "#f8faf8",
              padding: 0,
              borderRadius: 12,
              border: "1px solid #dce8dc",
              width: "100%",
              maxWidth: 820,
              maxHeight: "92vh",
              overflowY: "auto",
              boxShadow: "0 24px 70px rgba(0,0,0,0.24)",
            }}
          >
            <header className="geosense-farm-editor-header">
              <div>
                <span className="geosense-farm-editor-eyebrow">Farm profile</span>
                <h2>{editingFarmId ? "Update Farm" : "Add New Farm"}</h2>
                <p>{editingFarmId ? "Keep your farm details and soil records current." : "Create a farm profile with location and soil details."}</p>
              </div>
              <div className="geosense-farm-editor-header-actions">
                <span className="geosense-farm-editor-owner">{currentUser?.name || "Signed-in farmer"}</span>
                <button type="button" onClick={() => { setShowAddDialog(false); setEditingFarmId(null); setFarmError(""); }} aria-label="Close farm form" title="Close" className="geosense-farm-editor-close"><X size={18} aria-hidden="true" /></button>
              </div>
            </header>
            {farmError && <p className="geosense-farm-editor-error" role="alert">{farmError}</p>}
            {soilPrefillPending && (
              <div className="geosense-farm-editor-prefill">
                <strong>Soil results ready to attach</strong>
                <span>Review the prefilled readings, then save this farm to keep them with its profile.</span>
              </div>
            )}

            <section className="geosense-farm-editor-group">
            <div className="geosense-farm-editor-section">
              <span>01</span><div><h3>Farm identity</h3><p>Who owns this farm and how should it be listed?</p></div>
            </div>

            <label>
              Farmer name
              <input
                type="text"
                value={newFarm.name}
                readOnly
                required
                title="Set from your signed-in account"
                style={{ width: "100%", marginBottom: 0, padding: "10px 12px", borderRadius: 6, border: "1px solid #d1d9d1", background: "#eef3ee", color: "#4b5d4b" }}
              />
            </label>

            <label>
              Farm name
              <input
                type="text"
                value={newFarm.farmName}
                onChange={(e) => setNewFarm({ ...newFarm, farmName: e.target.value })}
                required
                style={{ width: "100%", marginBottom: 0, padding: "10px 12px", borderRadius: 6, border: "1px solid #cbd5cb" }}
              />
            </label>

            <label>
              Farm type
              <select
                value={newFarm.farmType}
                onChange={(e) => setNewFarm({ ...newFarm, farmType: e.target.value })}
                style={{ width: "100%", marginBottom: 0, padding: "10px 12px", borderRadius: 6, border: "1px solid #cbd5cb" }}
              >
                <option>Crop</option>
                <option>Livestock</option>
                <option>Aquatic</option>
                <option>Mixed</option>
              </select>
            </label>

            <label>
              Region
              <select
                value={newFarm.region}
                onChange={(e) => setNewFarm({ ...newFarm, region: e.target.value })}
                style={{ width: "100%", marginBottom: 0, padding: "10px 12px", borderRadius: 6, border: "1px solid #cbd5cb" }}
              >
                {GHANA_REGIONS.map((region) => <option key={region}>{region}</option>)}
              </select>
            </label>
            </section>

            <section className="geosense-farm-editor-group">
            <div className="geosense-farm-editor-section">
              <span>02</span><div><h3>Location & size</h3><p>Set a map point and describe the site.</p></div>
            </div>

            <label className="geosense-farm-location-field">
              Farm location
              <div
                className="geosense-farm-location-value"
                style={{
                  padding: "11px 12px",
                  border: "1px solid #d5ddd5",
                  borderRadius: 6,
                  backgroundColor: "#f1f5f1",
                  marginBottom: 0,
                  color: "#4b5d4b",
                  fontSize: 14,
                }}
              >
                {newFarm.location
                  ? `Lat: ${newFarm.location.lat.toFixed(5)}, Lng: ${newFarm.location.lng.toFixed(5)}`
                  : "No location selected"}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!navigator.geolocation) {
                    alert("Geolocation is not supported by your browser.");
                    return;
                  }
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      setNewFarm((prev) => ({
                        ...prev,
                        location: {
                          lat: position.coords.latitude,
                          lng: position.coords.longitude,
                        },
                      }));
                    },
                    () => alert("Unable to retrieve your location.")
                  );
                }}
                style={{
                  marginTop: 8,
                  padding: "9px 12px",
                  backgroundColor: "#e8f3e9",
                  color: "#17603a",
                  border: "1px solid #b9d6be",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                {newFarm.location ? "Refresh current location" : "Use current location"}
              </button>
            </label>

            <label>
              Location description
              <input
                type="text"
                value={newFarm.locationDescription}
                onChange={(e) => setNewFarm({ ...newFarm, locationDescription: e.target.value })}
                style={{ width: "100%", marginBottom: 0, padding: "10px 12px", borderRadius: 6, border: "1px solid #cbd5cb" }}
              />
            </label>

            <label>
              Land size
              <input
                type="text"
                value={newFarm.landSize}
                onChange={(e) => setNewFarm({ ...newFarm, landSize: e.target.value })}
                placeholder="e.g. 5 ha"
                style={{ width: "100%", marginBottom: 0, padding: "10px 12px", borderRadius: 6, border: "1px solid #cbd5cb" }}
              />
            </label>
            </section>

            <section className="geosense-farm-editor-group">
            <div className="geosense-farm-editor-section">
              <span>03</span><div><h3>Soil profile</h3><p>Add soil test values and the latest condition.</p></div>
            </div>

            <label>
              Soil type
              <input
                type="text"
                value={newFarm.soilType}
                onChange={(e) => setNewFarm({ ...newFarm, soilType: e.target.value })}
                style={{ width: "100%", marginBottom: 0, padding: "10px 12px", borderRadius: 6, border: "1px solid #cbd5cb" }}
              />
            </label>

            <label>
              Soil pH
              <input
                type="number"
                step="0.1"
                value={newFarm.pH}
                onChange={(e) => setNewFarm({ ...newFarm, pH: e.target.value })}
                style={{ width: "100%", marginBottom: 0, padding: "10px 12px", borderRadius: 6, border: "1px solid #cbd5cb" }}
              />
            </label>

            <label>
              Moisture (%)
              <input
                type="number"
                value={newFarm.moisture}
                onChange={(e) => setNewFarm({ ...newFarm, moisture: e.target.value })}
                style={{ width: "100%", marginBottom: 0, padding: "10px 12px", borderRadius: 6, border: "1px solid #cbd5cb" }}
              />
            </label>

            <label>
              Nitrogen (N)
              <input
                type="number"
                value={newFarm.N}
                onChange={(e) => setNewFarm({ ...newFarm, N: e.target.value })}
                style={{ width: "100%", marginBottom: 0, padding: "10px 12px", borderRadius: 6, border: "1px solid #cbd5cb" }}
              />
            </label>

            <label>
              Phosphorus (P)
              <input
                type="number"
                value={newFarm.P}
                onChange={(e) => setNewFarm({ ...newFarm, P: e.target.value })}
                style={{ width: "100%", marginBottom: 0, padding: "10px 12px", borderRadius: 6, border: "1px solid #cbd5cb" }}
              />
            </label>

            <label>
              Potassium (K)
              <input
                type="number"
                value={newFarm.K}
                onChange={(e) => setNewFarm({ ...newFarm, K: e.target.value })}
                style={{ width: "100%", marginBottom: 0, padding: "10px 12px", borderRadius: 6, border: "1px solid #cbd5cb" }}
              />
            </label>

            <label>
              Organic matter (%)
              <input
                type="number"
                step="0.1"
                value={newFarm.organicMatter}
                onChange={(e) => setNewFarm({ ...newFarm, organicMatter: e.target.value })}
                style={{ width: "100%", marginBottom: 0, padding: "10px 12px", borderRadius: 6, border: "1px solid #cbd5cb" }}
              />
            </label>

            <label>
              Soil health status
              <input
                type="text"
                value={newFarm.healthStatus}
                onChange={(e) => setNewFarm({ ...newFarm, healthStatus: e.target.value })}
                style={{ width: "100%", marginBottom: 0, padding: "10px 12px", borderRadius: 6, border: "1px solid #cbd5cb" }}
              />
            </label>
            </section>

            <section className="geosense-farm-editor-group">
            <div className="geosense-farm-editor-section">
              <span>04</span><div><h3>Farm activity</h3><p>Record crops, animals, aquatic production, or photos.</p></div>
            </div>

            <label>
              Suitable crops
              <input
                type="text"
                value={newFarm.suitableCrops}
                onChange={(e) => setNewFarm({ ...newFarm, suitableCrops: e.target.value })}
                placeholder="Separate crop names with commas"
                style={{ width: "100%", marginBottom: 0, padding: "10px 12px", borderRadius: 6, border: "1px solid #cbd5cb" }}
              />
            </label>

            <label>
              Livestock
              <input
                type="text"
                value={newFarm.livestock}
                onChange={(e) => setNewFarm({ ...newFarm, livestock: e.target.value })}
                placeholder="Optional"
                style={{ width: "100%", marginBottom: 0, padding: "10px 12px", borderRadius: 6, border: "1px solid #cbd5cb" }}
              />
            </label>

            <label>
              Aquatic
              <input
                type="text"
                value={newFarm.aquatic}
                onChange={(e) => setNewFarm({ ...newFarm, aquatic: e.target.value })}
                placeholder="Optional"
                style={{ width: "100%", marginBottom: 0, padding: "10px 12px", borderRadius: 6, border: "1px solid #cbd5cb" }}
              />
            </label>

            <label className="geosense-farm-photo-field">
              Farm photos
              <input className="geosense-farm-file" type="file" multiple accept="image/*" onChange={handleImageUpload} />
            </label>
            </section>

            <div className="geosense-farm-editor-actions">
              <button
                type="submit"
                style={{
                  backgroundColor: "#17603a",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  padding: "11px 16px",
                  cursor: "pointer",
                  flexGrow: 1,
                }}
              >
                {editingFarmId ? "Update Farm" : soilPrefillPending ? "Save Farm & Soil Results" : "Save Farm"}
              </button>
              <button
                type="button"
                onClick={() => { setShowAddDialog(false); setEditingFarmId(null); setFarmError(""); }}
                style={{
                  backgroundColor: "white",
                  color: "#4b5d4b",
                  border: "1px solid #cbd5cb",
                  borderRadius: 6,
                  padding: "11px 16px",
                  cursor: "pointer",
                  flexGrow: 1,
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {savedFarm && (
        <div role="presentation" style={{ position: "fixed", inset: 0, zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: "rgba(0,0,0,0.45)" }}>
          <section role="dialog" aria-modal="true" aria-labelledby="farm-saved-title" className="w-full max-w-md rounded-lg border border-green-200 bg-white p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-lg text-green-800">✓</span>
              <div>
                <h2 id="farm-saved-title" className="text-lg font-semibold text-gray-950">Farm added successfully</h2>
                <p className="mt-1 text-sm text-gray-700"><strong>{savedFarm.farmName}</strong> is saved to your account and now appears in the Farm List.</p>
                {savedFarm.latestSoilTest && <p className="mt-2 text-sm text-green-800">The latest soil-test results are attached to this farm.</p>}
              </div>
            </div>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button type="button" onClick={() => setSavedFarm(null)} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Close</button>
              <button type="button" onClick={() => { setSavedFarm(null); document.getElementById("farm-list")?.scrollIntoView({ behavior: "smooth", block: "start" }); }} className="rounded-md bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800">View in Farm List</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

const FarmMetric = ({ label, value }) => (
  <div className="min-w-0 rounded-md border border-gray-200 bg-white p-3 sm:p-4">
    <p className="text-xs font-medium text-gray-500">{label}</p>
    <p className="mt-1 truncate text-base font-semibold text-gray-950 sm:text-lg">{value}</p>
  </div>
);

const Detail = ({ label, value }) => (
  <div className="flex flex-col gap-0.5 border-b border-gray-100 pb-2 last:border-0 last:pb-0 sm:flex-row sm:justify-between sm:gap-4">
    <span className="text-xs font-medium text-gray-500">{label}</span>
    <span className="break-words text-sm text-gray-900 sm:max-w-[65%] sm:text-right">{value}</span>
  </div>
);

export default SoilMap;
