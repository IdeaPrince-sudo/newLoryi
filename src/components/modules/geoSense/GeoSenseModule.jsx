import React, { useState } from "react";
import { jsPDF } from "jspdf";
import { Bar } from "react-chartjs-2";
import SoilMap from "./MapProfiles";
import FAQ from "./FAQ";
import HelpSupport from "./HelpSupport";
import { useAuth } from "../../../contexts/AuthContext";
import { matchOrQueueSoilResult, updateFarmWithSoilResult } from "./farmSoilStore";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Tabs definition
const tabs = [
  { id: "mapProfiles", name: "Farm Map", icon: "M12 2C8 2 4 6 4 10c0 5 8 12 8 12s8-7 8-12c0-4-4-8-8-8z" },
  { id: "dashboard", name: "Test Soil", icon: "M3 12h18M12 3v18" },
  { id: "soilReport", name: "Soil Report", icon: "M9 17v-2m3 2v-4m3 4v-6" },

  { id: "history", name: "History", icon: "M3 7h18M3 12h18M3 17h18" },
  { id: "faq", name: "FAQ", icon: "M8 10h.01M12 14h.01M12 10h.01" },
  { id: "help", name: "Help & Support", icon: "M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
];

// Fake soil data generator
const getFakeSoilData = (coords) => ({
  soilType: "Loamy",
  soilDescription:
    "Loamy soil is fertile and good for crops, retaining nutrients and moisture well.",
  pH: 6.7,
  moisture: 28,
  nutrients: { N: 40, P: 35, K: 38 },
  micronutrients: { Zn: 2.5, Fe: 5.0, Mn: 3.1 },
  organicMatter: 3.2,
  contaminants: "None detected",
  warning: null,
  recommendations: "pH is optimal for most crops. Maintain organic matter and proper irrigation.",
  suitableCrops: ["Tomatoes", "Corn", "Soybeans"],
});

const getWarningDetails = (soilData) => {
  if (!soilData) return { level: "none", message: null };
  if (soilData.pH < 5.5) {
    return {
      level: "high",
      message: "Soil pH is too acidic, which may inhibit nutrient uptake.",
    };
  }
  if (soilData.pH > 7.8) {
    return {
      level: "high",
      message: "Soil pH is too alkaline, which may affect crop growth.",
    };
  }
  if (soilData.moisture < 15) {
    return {
      level: "medium",
      message: "Soil moisture is low; irrigation is recommended.",
    };
  }
  if (soilData.contaminants && soilData.contaminants !== "None detected") {
    return {
      level: "high",
      message: `Contaminants detected: ${soilData.contaminants}`,
    };
  }
  return { level: "none", message: null };
};

export default function GeoSenseModule() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("mapProfiles");
  const [location, setLocation] = useState(null);
  const [soilData, setSoilData] = useState(null);
  const [farmLink, setFarmLink] = useState(null);
  const [selectedFarmId, setSelectedFarmId] = useState("");
  const [isUpdatingFarm, setIsUpdatingFarm] = useState(false);
  const [history, setHistory] = useState(() => {
    const stored = localStorage.getItem("soilTestHistory");
    return stored ? JSON.parse(stored) : [];
  });
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = React.useState(1);

  const totalPages = Math.ceil(history.length / itemsPerPage);

  // Calculate items to show on current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = history.slice(startIndex, startIndex + itemsPerPage);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState(0);
  const [manualInput, setManualInput] = useState({
    soilType: "",
    pH: "",
    moisture: "",
  });

  const storeSoilResult = async (data, coords) => {
    setSoilData(data);
    const link = matchOrQueueSoilResult({ coords, soilData: data, farmerName: currentUser?.name, farmerId: currentUser?.id });
    const result = await link;
    setFarmLink(result);
    setSelectedFarmId(result.status === "needs-farm" && result.farms?.length === 1 ? String(result.farms[0].id) : "");
    return result;
  };

  const handleUpdateSelectedFarm = async () => {
    if (!selectedFarmId || !["needs-farm", "selected-update-error"].includes(farmLink?.status)) return;
    setIsUpdatingFarm(true);
    const result = await updateFarmWithSoilResult(selectedFarmId, farmLink.result, currentUser?.id);
    setFarmLink((current) => result.status === "error"
      ? { ...current, ...result, status: "selected-update-error" }
      : result);
    setIsUpdatingFarm(false);
  };

  const renderUnmatchedFarmActions = () => (
    <div className="mt-3 space-y-3">
      {farmLink.farms?.length > 0 ? (
        <>
          <p className="text-sm">
            You have {farmLink.farms.length} registered {farmLink.farms.length === 1 ? "farm" : "farms"}. Choose one to update with these soil results, or add a new farm.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              aria-label="Select a farm to update with soil results"
              value={selectedFarmId}
              onChange={(event) => setSelectedFarmId(event.target.value)}
              className="min-w-0 flex-1 rounded-md border border-amber-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-700/20"
            >
              <option value="">Choose an existing farm</option>
              {farmLink.farms.map((farm) => <option key={farm.id} value={farm.id}>{farm.farmName} · {farm.region || "Region not set"}</option>)}
            </select>
            <button type="button" disabled={!selectedFarmId || isUpdatingFarm} onClick={handleUpdateSelectedFarm} className="rounded-md bg-green-800 px-3 py-2 text-sm font-semibold text-white hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-50">
              {isUpdatingFarm ? "Updating…" : "Update selected farm"}
            </button>
          </div>
        </>
      ) : (
        <p className="text-sm">No farms are registered to your account yet. Add a farm to keep these results with its profile{!farmLink.result.coords ? "; select GPS location in the form to link it accurately" : ""}.</p>
      )}
      {farmLink.status === "selected-update-error" && <p role="alert" className="text-sm font-medium text-red-800">{farmLink.message}</p>}
      <button type="button" onClick={() => setActiveTab("mapProfiles")} className="rounded-md bg-green-700 px-3 py-2 text-sm font-semibold text-white hover:bg-green-800">
        Add new farm with these results
      </button>
    </div>
  );
  const loadingStages = [
    "Collecting soil samples...",
    "Analyzing pH levels...",
    "Measuring moisture content...",
    "Calculating NPK ratios...",
    "Generating detailed report..."
  ];
  
  const startAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisStage(0);
  
    // Simulate multiple stages
    let stage = 0;
    const interval = setInterval(() => {
      stage++;
      if (stage < loadingStages.length) {
        setAnalysisStage(stage);
      } else {
        clearInterval(interval);
        setIsAnalyzing(false);
        submitManualData(); // Call original function to show final data
      }
    }, 1200); // 1.2s per stage
  };
  const getUserLocationAndData = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(coords);
        const data = getFakeSoilData(coords);
        await storeSoilResult(data, coords);
        saveToHistory({
          id: Date.now(),
          date: new Date().toLocaleDateString(),
          coords,
          soilType: data.soilType,
          pH: data.pH,
          moisture: data.moisture,
          nutrients: data.nutrients,
          organicMatter: data.organicMatter,
        });
        setActiveTab("soilReport");
      },
      () => alert("Failed to get location")
    );
  };

  const saveToHistory = (entry) => {
    const updated = [entry, ...history];
    setHistory(updated);
    localStorage.setItem("soilTestHistory", JSON.stringify(updated));
  };

  const handleManualChange = (e) => {
    const { name, value } = e.target;
    setManualInput((prev) => ({ ...prev, [name]: value }));
  };

  const submitManualData = async () => {
    if (!manualInput.soilType || !manualInput.pH || !manualInput.moisture) {
      alert("Please fill all fields before submitting.");
      return;
    }
    const coords = location;
    const data = {
      soilType: manualInput.soilType,
      soilDescription: `${manualInput.soilType} soil - typical characteristics.`,
      pH: parseFloat(manualInput.pH),
      moisture: parseFloat(manualInput.moisture),
      nutrients: { N: 40, P: 35, K: 38 },
      micronutrients: { Zn: 2.5, Fe: 5.0, Mn: 3.1 },
      organicMatter: 3.2,
      contaminants: "None detected",
      warning: null,
      recommendations: "Maintain good soil management practices.",
      suitableCrops: ["Tomatoes", "Corn", "Soybeans"],
    };
    await storeSoilResult(data, coords);
    saveToHistory({
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      coords,
      soilType: data.soilType,
      pH: data.pH,
      moisture: data.moisture,
      nutrients: data.nutrients,
      organicMatter: data.organicMatter,
    });
    setActiveTab("soilReport");
  };

  const generatePDF = () => {
    if (!soilData) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Soil Health Report", 14, 20);
    doc.setFontSize(12);
    doc.text(`Soil Type: ${soilData.soilType}`, 14, 30);
    doc.text(`Description: ${soilData.soilDescription}`, 14, 37);
    doc.text(`pH: ${soilData.pH}`, 14, 44);
    doc.text(`Moisture: ${soilData.moisture}%`, 14, 51);
    doc.text(
      `Nutrients (NPK): N=${soilData.nutrients.N}, P=${soilData.nutrients.P}, K=${soilData.nutrients.K}`,
      14,
      58
    );
    doc.text(
      `Micronutrients: Zn=${soilData.micronutrients.Zn}, Fe=${soilData.micronutrients.Fe}, Mn=${soilData.micronutrients.Mn}`,
      14,
      65
    );
    doc.text(`Organic Matter: ${soilData.organicMatter}%`, 14, 72);
    doc.text(`Contaminants: ${soilData.contaminants}`, 14, 79);
    doc.text(`Recommendations: ${soilData.recommendations}`, 14, 86);
    doc.text(`Suitable Crops: ${soilData.suitableCrops.join(", ")}`, 14, 93);
    doc.save("soil_health_report.pdf");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "mapProfiles":
        return <SoilMap />;
        case "dashboard":
          return (
            <div className="mx-auto w-full max-w-lg rounded-lg bg-white p-4 sm:p-6">
              {/* Button to Get User Location */}
              <button
                onClick={() => {
                  setAnalysisStage(0); // reset
                  getUserLocationAndData(); 
                }}
                className="w-full bg-green-600 text-white font-semibold px-5 py-3 rounded-md hover:bg-green-700 transition"
              >
                📍 Get My Location & Soil Data
              </button>
        
              {/* Display Location Info */}
              {location && (
                <p className="mt-4 text-gray-700 text-center font-medium">
                  <span className="font-semibold">Location:</span> Lat {location.lat.toFixed(4)}, Lng {location.lng.toFixed(4)}
                </p>
              )}
        
              {/* Manual Input Section */}
              <h3 className="mt-8 mb-4 text-lg font-semibold text-gray-800 border-b pb-2">
                Or enter soil data manually:
              </h3>
        
              <form 
                className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-3 sm:gap-6" 
                onSubmit={e => { 
                  e.preventDefault(); 
                  startAnalysis(); // start animation before showing result
                }}
              >
                {/* Soil Type */}
                <div>
                  <label htmlFor="soilType" className="block mb-2 text-gray-700 font-medium">
                    Soil Type
                  </label>
                  <select
                    id="soilType"
                    name="soilType"
                    value={manualInput.soilType}
                    onChange={handleManualChange}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                    required
                  >
                    <option value="">Select soil type</option>
                    <option value="Loamy">Loamy</option>
                    <option value="Sandy">Sandy</option>
                    <option value="Clay">Clay</option>
                    <option value="Silty">Silty</option>
                    <option value="Peaty">Peaty</option>
                    <option value="Chalky">Chalky</option>
                  </select>
                </div>
        
                {/* Soil pH */}
                <div>
                  <label htmlFor="pH" className="block mb-2 text-gray-700 font-medium">Soil pH</label>
                  <input
                    type="number"
                    step="0.1"
                    id="pH"
                    name="pH"
                    value={manualInput.pH}
                    onChange={handleManualChange}
                    placeholder="e.g. 6.5"
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                    required
                    min="0"
                    max="14"
                  />
                </div>
        
                {/* Soil Moisture */}
                <div>
                  <label htmlFor="moisture" className="block mb-2 text-gray-700 font-medium">Soil Moisture (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    id="moisture"
                    name="moisture"
                    value={manualInput.moisture}
                    onChange={handleManualChange}
                    placeholder="e.g. 25"
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                    required
                    min="0"
                    max="100"
                  />
                </div>
        
                {/* Submit Button */}
                <div className="sm:col-span-3 text-center">
                  <button
                    type="submit"
                    className="bg-green-600 text-white font-semibold px-8 py-3 rounded-md shadow-md hover:bg-green-700 transition"
                  >
                    🔍 Analyze Soil Data
                  </button>
                </div>
              </form>
        
              {/* Loading Animation with Stages */}
              {isAnalyzing && (
                <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-md shadow-inner text-yellow-900 animate-pulse">
                  <p className="text-center font-medium">
                    ⏳ {loadingStages[analysisStage]}
                  </p>
                </div>
              )}
        
              {/* Display Final Results */}
              {!isAnalyzing && soilData && (
                <div className="bg-green-50 border border-green-300 rounded-md p-4 shadow-inner text-green-900 mt-4">
                  <p>
                    ✅ <strong>Latest Soil Data:</strong> {soilData.soilType}, 
                    pH: {soilData.pH}, Moisture: {soilData.moisture}%
                  </p>
                  {farmLink?.status === "matched" || farmLink?.status === "matched-local" ? (
                    <p className="mt-2 text-sm">Updated the soil results for <strong>{farmLink.farm.farmName}</strong> at this location ({farmLink.distanceMeters} m match){farmLink.status === "matched-local" ? "; server update unavailable, saved locally" : " on the server"}.</p>
                  ) : farmLink?.status === "selected-update" || farmLink?.status === "selected-update-local" ? (
                    <p role="status" className="mt-2 text-sm">Updated <strong>{farmLink.farm.farmName}</strong> with these soil results{farmLink.status === "selected-update-local" ? "; the API was unavailable, so this update is only in this browser" : " on the server"}.</p>
                  ) : farmLink?.status === "error" ? (
                    <p role="alert" className="mt-2 text-sm">A nearby farm was found, but its server record could not be updated. Please retry when the API is available; no duplicate farm was created.</p>
                  ) : farmLink?.status === "needs-farm" || farmLink?.status === "selected-update-error" ? (
                    <div className="mt-3">
                      <p className="text-sm">No farm matches this test location.</p>
                      {renderUnmatchedFarmActions()}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          );
        
      case "soilReport":
        if (!soilData)
          return (
            <p className="text-center text-gray-500">
              No soil data available. Run test from Dashboard.
            </p>
          );

        const normalizedPH = (soilData.pH / 14).toFixed(2);
        const { level, message } = getWarningDetails(soilData);

        const levelColors = {
          high: "bg-red-100 text-red-700 border-red-500",
          medium: "bg-yellow-100 text-yellow-700 border-yellow-500",
          none: "bg-green-100 text-green-700 border-green-500",
        };

        const educationalTips = [
          "Soil pH affects nutrient availability to plants.",
          "Loamy soils retain moisture and nutrients well.",
          "Micronutrients like Zn and Fe are vital for plant health.",
        ];

        const generalTips = [
          "Test soil regularly for best crop yields.",
          "Rotate crops to improve soil fertility and reduce pests.",
          "Manage water carefully to avoid erosion and nutrient loss.",
          "Increase organic matter for better soil structure.",
        ];

        const commonMistakes = [
          "Ignoring soil pH when choosing crops.",
          "Over-fertilizing leading to nutrient imbalance.",
          "Skipping crop rotation causing soil degradation.",
          "Poor water management leading to erosion.",
        ];

        const npkData = {
          labels: ["Nitrogen (N)", "Phosphorus (P)", "Potassium (K)"],
          datasets: [
            {
              label: "Nutrient Levels",
              data: [soilData.nutrients.N, soilData.nutrients.P, soilData.nutrients.K],
              backgroundColor: ["#3b82f6", "#ef4444", "#f59e0b"],
            },
          ],
        };

        return (
          <div className="mx-auto max-w-4xl space-y-6 sm:space-y-8">
            <h2 className="text-2xl font-extrabold text-green-700 mb-6 text-center sm:text-3xl">
              🌱 Soil Health Report
            </h2>

            {farmLink?.status === "matched" || farmLink?.status === "matched-local" ? (
              <div className="rounded-md border border-green-300 bg-green-50 p-4 text-sm text-green-900" role="status">
                This test updated <strong>{farmLink.farm.farmName}</strong>, the registered farm closest to the test location ({farmLink.distanceMeters} m away){farmLink.status === "matched-local" ? "; the API was unavailable, so this update is only in this browser" : " on the server"}.
              </div>
            ) : farmLink?.status === "selected-update" || farmLink?.status === "selected-update-local" ? (
              <div className="rounded-md border border-green-300 bg-green-50 p-4 text-sm text-green-900" role="status">
                This report updated <strong>{farmLink.farm.farmName}</strong>{farmLink.status === "selected-update-local" ? "; the API was unavailable, so this update is only in this browser" : " on the server"}.
              </div>
            ) : farmLink?.status === "error" ? (
              <div className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-900" role="alert">
                A nearby farm was found, but the server could not update it. Retry the soil test when the API is available; no duplicate farm was created.
              </div>
            ) : farmLink?.status === "needs-farm" || farmLink?.status === "selected-update-error" ? (
              <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
                <p>No registered farm matches this soil-test location.</p>
                {renderUnmatchedFarmActions()}
              </div>
            ) : null}

            {/* Soil Type Card */}
            <div className="bg-white shadow-md rounded-lg p-6 border border-green-200">
              <h3 className="text-xl font-semibold mb-2 flex items-center space-x-2 text-green-800">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 17l4-4 4 4m0-8l-4 4-4-4"
                  />
                </svg>
                Soil Type & Description
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {soilData.soilType} - {soilData.soilDescription}
              </p>
            </div>

            {/* pH, Moisture & Nutrients Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
              <div className="bg-white rounded-lg shadow p-5 border border-green-100 text-center">
                <h4 className="text-lg font-semibold mb-1">🌡 Soil pH</h4>
                <p className="text-4xl font-bold text-green-600">{soilData.pH}</p>
                <p className="text-sm text-gray-500">Normalized: {normalizedPH}</p>
              </div>

              <div className="bg-white rounded-lg shadow p-5 border border-green-100 text-center">
                <h4 className="text-lg font-semibold mb-1">💧 Moisture (%)</h4>
                <p className="text-4xl font-bold text-blue-500">{soilData.moisture}</p>
              </div>

              <div className="bg-white rounded-lg shadow p-5 border border-green-100">
                <h4 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-yellow-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-3.866 0-7 3.134-7 7h14c0-3.866-3.134-7-7-7z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 0v4m0-4h4m-4 0H8"
                    />
                  </svg>
                  Nutrients (NPK)
                </h4>
                <ul className="text-gray-700 text-sm space-y-1">
                  <li>
                    Nitrogen (N): <strong>{soilData.nutrients.N}</strong>
                  </li>
                  <li>
                    Phosphorus (P): <strong>{soilData.nutrients.P}</strong>
                  </li>
                  <li>
                    Potassium (K): <strong>{soilData.nutrients.K}</strong>
                  </li>
                </ul>
              </div>
            </div>

            {/* Micronutrients & Organic Matter */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
              <div className="bg-white rounded-lg shadow p-5 border border-green-100">
                <h4 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-indigo-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 1.343-3 3m6 0c0 1.657-1.343 3-3 3"
                    />
                  </svg>
                  Micronutrients
                </h4>
                <ul className="text-gray-700 text-sm space-y-1">
                  <li>
                    Zn: <strong>{soilData.micronutrients.Zn}</strong>
                  </li>
                  <li>
                    Fe: <strong>{soilData.micronutrients.Fe}</strong>
                  </li>
                  <li>
                    Mn: <strong>{soilData.micronutrients.Mn}</strong>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow p-5 border border-green-100 text-center">
                <h4 className="text-lg font-semibold mb-3">🌿 Organic Matter</h4>
                <p className="text-4xl font-bold text-green-700">
                  {soilData.organicMatter}%
                </p>
              </div>
            </div>

            {/* Contaminants Warning */}
            {level !== "none" && (
              <div
                className={`border-l-4 p-4 mb-6 ${levelColors[level]} border-4 rounded shadow-md`}
                role="alert"
              >
                <p className="font-semibold">⚠ Warning:</p>
                <p>{message}</p>
              </div>
            )}

            {/* Recommendations */}
            <div className="bg-white rounded-lg shadow p-6 border border-green-200">
              <h3 className="text-xl font-semibold mb-3 text-green-800">Recommendations</h3>
              <p className="text-gray-700 leading-relaxed">{soilData.recommendations}</p>
            </div>

            {/* Suitable Crops */}
            <div className="bg-white rounded-lg shadow p-6 border border-green-200">
              <h3 className="text-xl font-semibold mb-3 text-green-800">Suitable Crops</h3>
              <ul className="list-disc list-inside text-gray-700">
                {soilData.suitableCrops.map((crop) => (
                  <li key={crop}>{crop}</li>
                ))}
              </ul>
            </div>

            {/* Nutrient Bar Chart */}
            <div className="bg-white rounded-lg shadow p-6 border border-green-200">
              <h3 className="text-xl font-semibold mb-4 text-green-800">Nutrient Levels Visualization</h3>
              <Bar data={npkData} />
            </div>

            {/* Educational Tips */}
            <div className="bg-white rounded-lg shadow p-6 border border-green-200">
              <h3 className="text-xl font-semibold mb-3 text-green-800">Educational Tips</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {educationalTips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>

            {/* General Tips */}
            <div className="bg-white rounded-lg shadow p-6 border border-green-200">
              <h3 className="text-xl font-semibold mb-3 text-green-800">General Farming Tips</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {generalTips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>

            {/* Common Mistakes */}
            <div className="bg-white rounded-lg shadow p-6 border border-green-200">
              <h3 className="text-xl font-semibold mb-3 text-green-800">Common Mistakes to Avoid</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {commonMistakes.map((mistake, i) => (
                  <li key={i}>{mistake}</li>
                ))}
              </ul>
            </div>

            {/* PDF Export Button */}
            <div className="text-center">
              <button
                onClick={generatePDF}
                className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 font-semibold"
              >
                Export Report as PDF
              </button>
            </div>
          </div>
        );

    

        case "history":
      
        
          return (
              <div className="mx-auto max-w-4xl rounded-lg bg-white p-4 sm:p-6">
                <h2 className="flex items-center gap-2 text-2xl font-extrabold mb-6 text-green-700 sm:text-3xl">
                🧪 Test History
              </h2>
        
              {history.length === 0 ? (
                <p className="text-center text-gray-500 italic">No previous soil tests found.</p>
              ) : (
                <>
                  <ul className="relative border-l-4 border-green-600 pl-4 space-y-6">
                    {currentItems.map(({ id, date, soilType, pH, moisture }, index) => (
                      <li
                        key={id}
                        className="relative bg-green-50 p-5 rounded-lg  hover:shadow-lg transition-transform transform hover:-translate-y-1 cursor-pointer"
                      >
                        {/* Timeline Dot */}
                        <span className="absolute -left-3 top-5 w-6 h-6 bg-green-600 rounded-full border-4 border-white shadow"></span>
        
                        {/* Card Content */}
                        <p className="text-sm text-gray-500 mb-1">
                          #{startIndex + index + 1} | {date}
                        </p>
                        <p className="text-lg font-bold text-green-800">🌱 Soil Type: {soilType}</p>
        
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          <div className="bg-white p-2 rounded shadow-inner text-center">
                            <p className="text-xs text-gray-500">pH Level</p>
                            <p className="text-lg font-semibold text-blue-600">{pH}</p>
                          </div>
                          <div className="bg-white p-2 rounded shadow-inner text-center">
                            <p className="text-xs text-gray-500">Moisture</p>
                            <p className="text-lg font-semibold text-teal-600">{moisture}%</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
        
                  {/* Pagination Controls */}
                  <div className="flex justify-between mt-6">
                    <button
                      className="px-4 py-2 rounded bg-green-600 text-white disabled:bg-gray-300"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                    >
                      Previous
                    </button>
                    <span className="text-gray-700 self-center">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      className="px-4 py-2 rounded bg-green-600 text-white disabled:bg-gray-300"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
                    >
                      Next
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        
      case "faq":
        return <FAQ />;

      case "help":
        return <HelpSupport />;

      default:
        return null;
    }
  };

  return (
    <div className="h-full">
      {/* Module Header */}
      <div className="mb-4 flex flex-col gap-4 rounded-lg bg-white p-4 shadow sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18M12 3v18" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">GeoSense</h1>
            <p className="text-gray-600">GPS-linked soil testing & reports</p>
          </div>
        </div>
        <div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
            Active
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 overflow-hidden rounded-lg bg-white shadow sm:mb-6">
        <nav className="flex min-w-max space-x-2 overflow-x-auto border-b border-gray-200 px-3 sm:space-x-4 sm:px-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex shrink-0 items-center space-x-2 border-b-2 px-2 py-3 text-sm font-medium sm:px-3 sm:py-4 ${
                activeTab === tab.id
                  ? "border-green-600 text-green-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="min-h-[400px] overflow-auto rounded-lg bg-white p-3 shadow sm:p-6">{renderContent()}</div>
    </div>
  );
}
