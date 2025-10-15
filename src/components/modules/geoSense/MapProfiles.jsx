import React, { useState, useMemo, useRef } from "react";
import Map, { Marker, Popup } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const farmTypeIcons = {
  Crop: "🌾",
  Livestock: "🐄",
  Aquatic: "🐟",
  Mixed: "🌱🐄",
  Default: "📍",
};

const SoilMap = () => {
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

  const [farmData, setFarmData] = useState([]);
  const [newFarm, setNewFarm] = useState({
    name: "", farmName: "", farmType: "Crop", region: "Greater Accra",
    lat: "", lng: "", locationDescription: "", landSize: "", soilType: "",
    pH: "", moisture: "", N: "", P: "", K: "", organicMatter: "", healthStatus: "",
    suitableCrops: "", livestock: "", aquatic: "", images: []
  });

  const mapRef = useRef();

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

  // Pagination
  const indexOfLast = currentPage * farmsPerPage;
  const currentFarms = filteredProfiles.slice(indexOfLast - farmsPerPage, indexOfLast);
  const totalPages = Math.ceil(filteredProfiles.length / farmsPerPage);

  const handleRowClick = (p) => {
    setSelectedProfile(p);
    setShowDetailsModal(true);
    mapRef.current?.flyTo({ center: [p.location.lng, p.location.lat], zoom: 12 });
  };

  const handleAddFarm = (e) => {
    e.preventDefault();
    const newFarmObj = {
      id: Date.now(),
      ...newFarm,
      location: { lat: parseFloat(newFarm.lat), lng: parseFloat(newFarm.lng) },
      suitableCrops: newFarm.suitableCrops.split(",").map(c => c.trim())
    };
    setFarmData([...farmData, newFarmObj]);
    setShowAddDialog(false);
    setNewFarm({ ...newFarm, name: "", farmName: "", lat: "", lng: "", images: [] });
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
      <h1 style={{ textAlign: "center", color: "#27ae60" }}>🌍 Farm & Soil Dashboard</h1>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search farms..."
          style={{ flex: 1, padding: 6, borderRadius: 4, border: "1px solid #ccc" }}
        />
        <select value={farmTypeFilter} onChange={(e) => setFarmTypeFilter(e.target.value)} style={{ padding: 6, borderRadius: 4 }}>
          <option>All</option><option>Crop</option><option>Livestock</option><option>Aquatic</option><option>Mixed</option>
        </select>
        <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)} style={{ padding: 6, borderRadius: 4 }}>
          <option>All</option><option>Greater Accra</option><option>Ashanti</option><option>Northern</option><option>Volta</option>
        </select>
        <button onClick={() => setShowAddDialog(true)} style={{ backgroundColor: "#27ae60", color: "white", border: "none", padding: "6px 12px", borderRadius: 4, cursor: "pointer" }}>
          + Add Farm
        </button>
        <button onClick={exportToExcel} style={{ padding: "6px 12px", borderRadius: 4, cursor: "pointer" }}>Export Excel</button>
        <button onClick={exportToPDF} style={{ padding: "6px 12px", borderRadius: 4, cursor: "pointer" }}>Export PDF</button>
      </div>

      {/* Map */}
      <div style={{ height: "90vh", marginBottom: 20 }}>
        <Map
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
        </Map>
      </div>

      {/* Farm List Table */}
     
{/* Farm List Table */}
<h2 style={{ marginBottom: 12, color: "#27ae60", fontWeight: "bold" }}>📋 Farm List</h2>
<table
  style={{
    width: "100%",
    borderCollapse: "collapse",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  }}
  aria-label="List of farms"
>
  <thead style={{ backgroundColor: "#27ae60", color: "white" }}>
    <tr>
      {["Farm Name", "Farmer", "Type", "Region", "Soil", "Health"].map((header) => (
        <th key={header} style={{ padding: "12px 15px", textAlign: "left" }}>
          {header}
        </th>
      ))}
    </tr>
  </thead>
  <tbody>
    {currentFarms.length === 0 ? (
      <tr>
        <td colSpan={6} style={{ textAlign: "center", padding: "15px" }}>
          No farms found.
        </td>
      </tr>
    ) : (
      currentFarms.map((p, index) => (
        <tr
          key={p.id}
          onClick={() => handleRowClick(p)}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleRowClick(p);
          }}
          style={{
            cursor: "pointer",
            backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#fff",
            transition: "background-color 0.3s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#d4f1d4")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = index % 2 === 0 ? "#f9f9f9" : "#fff")
          }
          role="row"
          aria-label={`Farm ${p.farmName} by ${p.name}`}
        >
          <td style={{ padding: "10px 15px", borderBottom: "1px solid #ddd" }}>{p.farmName}</td>
          <td style={{ padding: "10px 15px", borderBottom: "1px solid #ddd" }}>{p.name}</td>
          <td style={{ padding: "10px 15px", borderBottom: "1px solid #ddd" }}>{p.farmType}</td>
          <td style={{ padding: "10px 15px", borderBottom: "1px solid #ddd" }}>{p.region}</td>
          <td style={{ padding: "10px 15px", borderBottom: "1px solid #ddd" }}>{p.soilType}</td>
          <td style={{ padding: "10px 15px", borderBottom: "1px solid #ddd" }}>{p.healthStatus}</td>
        </tr>
      ))
    )}
  </tbody>
</table>

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
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#fff", padding: 20, borderRadius: 8, width: "90%", maxWidth: 600 }}
          >
            <h2>
            <b>Farm Name:</b> {selectedProfile.farmName} 
            </h2>
            <h2><b>Farm Type:</b> {selectedProfile.farmType}</h2>
            <p><b>Farmer:</b> {selectedProfile.name}</p>
            <p><b>Region:</b> {selectedProfile.region}</p>
            <p><b>Location:</b> {selectedProfile.locationDescription}</p>
            <p><b>Land Size:</b> {selectedProfile.landSize}</p>
            <p><b>Soil Type:</b> {selectedProfile.soilType}</p>
            <p><b>pH:</b> {selectedProfile.pH}</p>
            <p><b>Moisture:</b> {selectedProfile.moisture}%</p>
            <p><b>Organic Matter:</b> {selectedProfile.organicMatter}%</p>
            <p><b>Health Status:</b> {selectedProfile.healthStatus}</p>
            <p><b>Suitable Crops:</b> {selectedProfile.suitableCrops.join(", ")}</p>
            <p><b>Livestock:</b> {selectedProfile.livestock}</p>
            <p><b>Aquatic:</b> {selectedProfile.aquatic}</p>

            {/* Images */}
            <div style={{ display: "flex", gap: 10, overflowX: "auto", marginBottom: 12 }}>
              {selectedProfile.images?.length > 0 ? (
                selectedProfile.images.map((img, i) => (
                  <img key={i} src={img} alt="Farm" width="100" style={{ borderRadius: 6 }} />
                ))
              ) : (
                <p>No images uploaded.</p>
              )}
            </div>

            <h3>Soil NPK Chart</h3>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart
                data={[
                  { name: "N", value: selectedProfile.N },
                  { name: "P", value: selectedProfile.P },
                  { name: "K", value: selectedProfile.K },
                ]}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#27ae60" />
              </BarChart>
            </ResponsiveContainer>

            <button onClick={printFarm} style={{ marginRight: 10 }}>
              🖨 Print Report
            </button>
            <button onClick={() => setShowDetailsModal(false)}>Close</button>
          </div>
        </div>
      )}

    {/* Add Farm Dialog */}
    {showAddDialog && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflowY: "auto",
            padding: 20,
            zIndex: 9999,
          }}
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={handleAddFarm}
            style={{
              background: "white",
              padding: 20,
              borderRadius: 8,
              width: "100%",
              maxWidth: 600,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: 20 }}>Add New Farm</h2>

            <label>
              Farmer Name*:
              <input
                type="text"
                value={newFarm.name}
                onChange={(e) => setNewFarm({ ...newFarm, name: e.target.value })}
                required
                style={{ width: "100%", marginBottom: 10, padding: 6, borderRadius: 4, border: "1px solid #ccc" }}
              />
            </label>

            <label>
              Farm Name*:
              <input
                type="text"
                value={newFarm.farmName}
                onChange={(e) => setNewFarm({ ...newFarm, farmName: e.target.value })}
                required
                style={{ width: "100%", marginBottom: 10, padding: 6, borderRadius: 4, border: "1px solid #ccc" }}
              />
            </label>

            <label>
              Farm Type:
              <select
                value={newFarm.farmType}
                onChange={(e) => setNewFarm({ ...newFarm, farmType: e.target.value })}
                style={{ width: "100%", marginBottom: 10, padding: 6, borderRadius: 4, border: "1px solid #ccc" }}
              >
                <option>Crop</option>
                <option>Livestock</option>
                <option>Aquatic</option>
                <option>Mixed</option>
              </select>
            </label>

            <label>
              Region:
              <select
                value={newFarm.region}
                onChange={(e) => setNewFarm({ ...newFarm, region: e.target.value })}
                style={{ width: "100%", marginBottom: 10, padding: 6, borderRadius: 4, border: "1px solid #ccc" }}
              >
                <option>Greater Accra</option>
                <option>Ashanti</option>
                <option>Northern</option>
                <option>Volta</option>
              </select>
            </label>

            <label>
              Location*:
              <div
                style={{
                  padding: 8,
                  border: "1px solid #ccc",
                  borderRadius: 5,
                  backgroundColor: "#f9f9f9",
                  marginBottom: 8,
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
                  marginBottom: 10,
                  padding: "6px 12px",
                  backgroundColor: "#27ae60",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                Use Current Location
              </button>
            </label>

            <label>
              Location Description:
              <input
                type="text"
                value={newFarm.locationDescription}
                onChange={(e) => setNewFarm({ ...newFarm, locationDescription: e.target.value })}
                style={{ width: "100%", marginBottom: 10, padding: 6, borderRadius: 4, border: "1px solid #ccc" }}
              />
            </label>

            <label>
              Land Size (e.g., 5 ha):
              <input
                type="text"
                value={newFarm.landSize}
                onChange={(e) => setNewFarm({ ...newFarm, landSize: e.target.value })}
                style={{ width: "100%", marginBottom: 10, padding: 6, borderRadius: 4, border: "1px solid #ccc" }}
              />
            </label>

            <label>
              Soil Type:
              <input
                type="text"
                value={newFarm.soilType}
                onChange={(e) => setNewFarm({ ...newFarm, soilType: e.target.value })}
                style={{ width: "100%", marginBottom: 10, padding: 6, borderRadius: 4, border: "1px solid #ccc" }}
              />
            </label>

            <label>
              pH:
              <input
                type="number"
                step="0.1"
                value={newFarm.pH}
                onChange={(e) => setNewFarm({ ...newFarm, pH: e.target.value })}
                style={{ width: "100%", marginBottom: 10, padding: 6, borderRadius: 4, border: "1px solid #ccc" }}
              />
            </label>

            <label>
              Moisture (%):
              <input
                type="number"
                value={newFarm.moisture}
                onChange={(e) => setNewFarm({ ...newFarm, moisture: e.target.value })}
                style={{ width: "100%", marginBottom: 10, padding: 6, borderRadius: 4, border: "1px solid #ccc" }}
              />
            </label>

            <label>
              Nitrogen (N):
              <input
                type="number"
                value={newFarm.N}
                onChange={(e) => setNewFarm({ ...newFarm, N: e.target.value })}
                style={{ width: "100%", marginBottom: 10, padding: 6, borderRadius: 4, border: "1px solid #ccc" }}
              />
            </label>

            <label>
              Phosphorus (P):
              <input
                type="number"
                value={newFarm.P}
                onChange={(e) => setNewFarm({ ...newFarm, P: e.target.value })}
                style={{ width: "100%", marginBottom: 10, padding: 6, borderRadius: 4, border: "1px solid #ccc" }}
              />
            </label>

            <label>
              Potassium (K):
              <input
                type="number"
                value={newFarm.K}
                onChange={(e) => setNewFarm({ ...newFarm, K: e.target.value })}
                style={{ width: "100%", marginBottom: 10, padding: 6, borderRadius: 4, border: "1px solid #ccc" }}
              />
            </label>

            <label>
              Organic Matter (%):
              <input
                type="number"
                step="0.1"
                value={newFarm.organicMatter}
                onChange={(e) => setNewFarm({ ...newFarm, organicMatter: e.target.value })}
                style={{ width: "100%", marginBottom: 10, padding: 6, borderRadius: 4, border: "1px solid #ccc" }}
              />
            </label>

            <label>
              Health Status:
              <input
                type="text"
                value={newFarm.healthStatus}
                onChange={(e) => setNewFarm({ ...newFarm, healthStatus: e.target.value })}
                style={{ width: "100%", marginBottom: 10, padding: 6, borderRadius: 4, border: "1px solid #ccc" }}
              />
            </label>

            <label>
              Suitable Crops (comma separated):
              <input
                type="text"
                value={newFarm.suitableCrops}
                onChange={(e) => setNewFarm({ ...newFarm, suitableCrops: e.target.value })}
                style={{ width: "100%", marginBottom: 10, padding: 6, borderRadius: 4, border: "1px solid #ccc" }}
              />
            </label>

            <label>
              Livestock:
              <input
                type="text"
                value={newFarm.livestock}
                onChange={(e) => setNewFarm({ ...newFarm, livestock: e.target.value })}
                style={{ width: "100%", marginBottom: 10, padding: 6, borderRadius: 4, border: "1px solid #ccc" }}
              />
            </label>

            <label>
              Aquatic:
              <input
                type="text"
                value={newFarm.aquatic}
                onChange={(e) => setNewFarm({ ...newFarm, aquatic: e.target.value })}
                style={{ width: "100%", marginBottom: 10, padding: 6, borderRadius: 4, border: "1px solid #ccc" }}
              />
            </label>

            <label>
              Upload Images:
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} />
            </label>

            <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
              <button
                type="submit"
                style={{
                  backgroundColor: "#27ae60",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  padding: "8px 16px",
                  cursor: "pointer",
                  flexGrow: 1,
                }}
              >
                Save Farm
              </button>
              <button
                type="button"
                onClick={() => setShowAddDialog(false)}
                style={{
                  backgroundColor: "#aaa",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  padding: "8px 16px",
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
    </div>
  );
};

export default SoilMap;
