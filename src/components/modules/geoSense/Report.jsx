import React, { useState } from "react";
import { jsPDF } from "jspdf";
import { Bar } from "react-chartjs-2";
import SoilMap from "./MapProfiles";
import FAQ from "./FAQ";
import HelpSupport from "./HelpSupport";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Tester from "./Tester";

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


export default function Report() {
  const [activeTab, setActiveTab] = useState("mapProfiles");
  const [location, setLocation] = useState(null);
  const [soilData, setSoilData] = useState(null);
 
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState(0);
  const [manualInput, setManualInput] = useState({
    soilType: "",
    pH: "",
    moisture: "",
  });
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
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(coords);
        const data = getFakeSoilData(coords);
        setSoilData(data);
        saveToHistory({
          id: Date.now(),
          date: new Date().toLocaleDateString(),
          coords,
          soilType: data.soilType,
          pH: data.pH,
          moisture: data.moisture,
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
          return <Tester/>
        
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
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-3xl font-extrabold text-green-700 mb-6 text-center">
              🌱 Soil Health Report
            </h2>

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
            <div className="grid md:grid-cols-3 gap-6">
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
            <div className="grid md:grid-cols-2 gap-6">
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
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Test History</h2>
            {history.length === 0 ? (
              <p>No previous soil tests found.</p>
            ) : (
              <ul className="space-y-3">
                {history.map(({ id, date, soilType, pH, moisture }) => (
                  <li
                    key={id}
                    className="border p-4 rounded shadow hover:bg-green-50 transition cursor-pointer"
                  >
                    <p>
                      <strong>Date:</strong> {date}
                    </p>
                    <p>
                      <strong>Soil Type:</strong> {soilType}
                    </p>
                    <p>
                      <strong>pH:</strong> {pH}
                    </p>
                    <p>
                      <strong>Moisture:</strong> {moisture}%
                    </p>
                  </li>
                ))}
              </ul>
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
      <div className="bg-white rounded-lg shadow mb-6 p-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-green-600 rounded-full w-10 h-10 flex items-center justify-center">
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
      <div className="bg-white rounded-lg shadow mb-6">
        <nav className="flex space-x-4 px-6 border-b border-gray-200" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-4 text-sm font-medium border-b-2 flex items-center space-x-2 ${
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
      <div className="bg-white rounded-lg shadow p-6 min-h-[400px] overflow-auto">{renderContent()}</div>
    </div>
  );
}
