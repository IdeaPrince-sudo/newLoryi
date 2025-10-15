import React, { useState } from "react";
import { jsPDF } from "jspdf";
import { Bar } from "react-chartjs-2";


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

export default function Tester() {

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



  const handleManualChange = (e) => {
    const { name, value } = e.target;
    setManualInput((prev) => ({ ...prev, [name]: value }));
  };

  const submitManualData = () => {
    if (!manualInput.soilType || !manualInput.pH || !manualInput.moisture) {
      alert("Please fill all fields before submitting.");
      return;
    }
    const coords = location || { lat: 0, lng: 0 };
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
  };

 


  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Button to Get User Location */}
      <button
        onClick={() => {
          setAnalysisStage(0); // reset
          getUserLocationAndData(); 
        }}
        className="w-full bg-green-600 text-white font-semibold px-5 py-3 rounded-md hover:bg-green-700 transition shadow-md"
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
        className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6" 
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
        </div>
      )}
    </div>
  );
}
