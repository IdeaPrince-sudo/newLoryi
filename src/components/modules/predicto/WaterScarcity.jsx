import { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const regions = [
  { id: "north", name: "Northern Region" },
  { id: "ashanti", name: "Ashanti Region" },
  { id: "volta", name: "Volta Region" },
  { id: "greaterAccra", name: "Greater Accra" },
];

const dummyDataByRegion = {
  north: {
    currentData: {
      soilMoisture: 18,
      ndmiIndex: 0.25,
      surfaceWaterChange: "-10% from last month",
      precipitationNextWeek: "Dry with no rain expected",
      humidity: "Low (40%)",
      cloudCoverage: "Clear sky",
    },
    history: {
      dates: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"],
      soilMoistureValues: [25, 22, 20, 19, 18, 18, 18],
      ndmiValues: [0.4, 0.35, 0.3, 0.28, 0.26, 0.25, 0.25],
    },
  },
  ashanti: {
    currentData: {
      soilMoisture: 30,
      ndmiIndex: 0.45,
      surfaceWaterChange: "-2% from last month",
      precipitationNextWeek: "Light showers expected on 2 days",
      humidity: "Moderate (60%)",
      cloudCoverage: "Partly cloudy",
    },
    history: {
      dates: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"],
      soilMoistureValues: [35, 34, 32, 31, 30, 30, 30],
      ndmiValues: [0.5, 0.48, 0.46, 0.45, 0.44, 0.45, 0.45],
    },
  },
  volta: {
    currentData: {
      soilMoisture: 25,
      ndmiIndex: 0.4,
      surfaceWaterChange: "-5% from last month",
      precipitationNextWeek: "Moderate rains expected on 3 days",
      humidity: "High (75%)",
      cloudCoverage: "Mostly cloudy",
    },
    history: {
      dates: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"],
      soilMoistureValues: [30, 29, 28, 27, 26, 25, 25],
      ndmiValues: [0.45, 0.43, 0.41, 0.4, 0.39, 0.4, 0.4],
    },
  },
  greaterAccra: {
    currentData: {
      soilMoisture: 20,
      ndmiIndex: 0.33,
      surfaceWaterChange: "-8% from last month",
      precipitationNextWeek: "Light showers expected on 1 day",
      humidity: "Moderate (55%)",
      cloudCoverage: "Partly cloudy",
    },
    history: {
      dates: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"],
      soilMoistureValues: [25, 23, 22, 21, 20, 20, 20],
      ndmiValues: [0.38, 0.36, 0.34, 0.33, 0.32, 0.33, 0.33],
    },
  },
};

export default function WaterScarcity() {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState("");

  const loadRegionData = (regionId) => {
    setLoading(true);
    setLocation(null);
    setLocationName("");
    setSelectedRegion(regionId);

    setTimeout(() => {
      const regionData = dummyDataByRegion[regionId];
      if (regionData) {
        setData(regionData.currentData);
        setHistory(regionData.history);
      } else {
        setData(null);
        setHistory(null);
      }
      setLoading(false);
    }, 1000);
  };

  const fetchLocationName = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
      );
      const result = await response.json();
      const name =
        result.display_name ||
        result.address?.city ||
        result.address?.town ||
        result.address?.village ||
        "Unknown location";
      setLocationName(name);
    } catch (error) {
      setLocationName("Unknown location");
    }
  };

  const loadLocationData = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    setSelectedRegion("");
    setLocationName("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(coords);

        fetchLocationName(coords.lat, coords.lng);

        // For demo, randomly pick one region data to simulate geolocation-based fetch
        const regionIds = Object.keys(dummyDataByRegion);
        const randomRegion = regionIds[Math.floor(Math.random() * regionIds.length)];
        const regionData = dummyDataByRegion[randomRegion];

        setTimeout(() => {
          setData(regionData.currentData);
          setHistory(regionData.history);
          setLoading(false);
        }, 1000);
      },
      () => {
        alert("Failed to get your location");
        setLoading(false);
      }
    );
  };

  // Color-coded messages
  const moistureWarning =
    data && data.soilMoisture < 20
      ? "⚠️ Low soil moisture detected! Consider irrigation."
      : data && data.soilMoisture >= 20 && data.soilMoisture < 30
      ? "⚠️ Moderate soil moisture. Monitor closely."
      : null;

  const ndmiWarning =
    data && data.ndmiIndex < 0.3
      ? "⚠️ NDMI indicates drought risk. Monitor crops closely."
      : data && data.ndmiIndex >= 0.3 && data.ndmiIndex < 0.4
      ? "⚠️ Mild moisture stress detected."
      : null;

  const getColorClass = (value, type) => {
    if (type === "moisture") {
      if (value > 30) return "text-green-700";
      if (value >= 20) return "text-yellow-600";
      return "text-red-600";
    }
    if (type === "ndmi") {
      if (value > 0.4) return "text-green-700";
      if (value >= 0.3) return "text-yellow-600";
      return "text-red-600";
    }
    return "";
  };

  const chartData = {
    labels: history?.dates || [],
    datasets: [
      {
        label: "Soil Moisture (%)",
        data: history?.soilMoistureValues || [],
        borderColor: "blue",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        yAxisID: "y",
      },
      {
        label: "NDMI Index",
        data: history?.ndmiValues || [],
        borderColor: "orange",
        backgroundColor: "rgba(249, 115, 22, 0.5)",
        yAxisID: "y1",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: "index",
      intersect: false,
    },
    stacked: false,
    scales: {
      y: {
        type: "linear",
        position: "left",
        min: 0,
        max: 100,
        title: { display: true, text: "Soil Moisture (%)" },
      },
      y1: {
        type: "linear",
        position: "right",
        min: 0,
        max: 1,
        title: { display: true, text: "NDMI Index" },
        grid: { drawOnChartArea: false },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded  mt-6 mx-auto" style={{ maxWidth: "1200px", width: "100%" }}>
      <h2 className="text-2xl font-bold mb-6">💧 Water Scarcity Monitoring</h2>

      <label htmlFor="region" className="block mb-2 font-semibold text-gray-800">
        Select Region:
      </label>
      <select
        id="region"
        value={selectedRegion}
        onChange={(e) => loadRegionData(e.target.value)}
        className="border p-3 rounded mb-6 w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        <option value="">-- Select a Region --</option>
        {regions.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </select>

      <button
        onClick={loadLocationData}
        className="bg-green-600 text-white px-6 py-3 rounded mb-8 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={loading}
      >
        {loading ? "Loading..." : "Use My Location"}
      </button>

      {/* Location display */}
      {selectedRegion && (
        <p className="mb-4 text-gray-700 text-sm">
          Showing data for: <strong>{regions.find((r) => r.id === selectedRegion)?.name}</strong>
        </p>
      )}
      {location && (
        <p className="mb-4 text-gray-700 text-sm">
          Showing data for your location:{" "}
          <strong>{locationName || "Loading location name..."}</strong> (Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)})
        </p>
      )}

      {/* No data message */}
      {!data && !loading && (
        <p className="text-gray-600 text-center">Select a region or use your location to load water scarcity data.</p>
      )}

      {/* Data display */}
      {data && (
        <>
          <div className="bg-green-50 p-5 rounded shadow-inner space-y-5 text-gray-800">
            {/* Soil Moisture */}
            <div>
              <strong>Soil Moisture:</strong>{" "}
              <span className={`font-semibold ${getColorClass(data.soilMoisture, "moisture")}`}>
                {data.soilMoisture}%
              </span>
              <p className="mt-1 text-sm text-gray-700">
                Soil moisture indicates the amount of water present in the soil.{" "}
                {data.soilMoisture > 30
                  ? "Adequate moisture supports healthy plant growth."
                  : data.soilMoisture >= 20
                  ? "Moderate moisture, monitor for any drying trends."
                  : "Low moisture levels can stress crops and reduce yields; consider irrigation."}
              </p>
            </div>

            {/* NDMI Index */}
            <div>
              <strong>NDMI Index:</strong>{" "}
              <span className={`font-semibold ${getColorClass(data.ndmiIndex, "ndmi")}`}>
                {data.ndmiIndex}
              </span>{" "}
              <span className="italic text-gray-600">(lower means drier)</span>
              <p className="mt-1 text-sm text-gray-700">
                The Normalized Difference Moisture Index (NDMI) measures vegetation water content from satellite data.{" "}
                {data.ndmiIndex > 0.4
                  ? "Vegetation is sufficiently hydrated."
                  : data.ndmiIndex >= 0.3
                  ? "Some moisture stress detected; keep monitoring."
                  : "High drought risk indicated; crops may be severely stressed."}
              </p>
            </div>

            {/* Surface Water Change */}
            <div>
              <strong>Surface Water Change:</strong> <span>{data.surfaceWaterChange}</span>
              <p className="mt-1 text-sm text-gray-700">
                Change in surface water levels compared to last month indicates water availability trends. Significant declines could impact irrigation and ecosystem health.
              </p>
            </div>

            {/* Precipitation Forecast */}
            <div>
              <strong>Precipitation Forecast:</strong> <span>{data.precipitationNextWeek}</span>
              <p className="mt-1 text-sm text-gray-700">
                Expected rainfall helps anticipate soil moisture replenishment and plan agricultural activities.
              </p>
            </div>

            {/* Humidity */}
            <div>
              <strong>Humidity:</strong> <span>{data.humidity}</span>
              <p className="mt-1 text-sm text-gray-700">
                Air humidity affects evapotranspiration rates and plant water stress.
              </p>
            </div>

            {/* Cloud Coverage */}
            <div>
              <strong>Cloud Coverage:</strong> <span>{data.cloudCoverage}</span>
              <p className="mt-1 text-sm text-gray-700">
                Cloud cover influences temperature and sunlight availability, affecting crop growth.
              </p>
            </div>

            {/* Warnings */}
            {(moistureWarning || ndmiWarning) && (
              <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded text-yellow-800 font-semibold">
                {moistureWarning && <p>{moistureWarning}</p>}
                {ndmiWarning && <p>{ndmiWarning}</p>}
              </div>
            )}
          </div>

          {/* Chart */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-3">Last 7 Days Trends</h3>
            <Line data={chartData} options={chartOptions} />
          </div>
        </>
      )}
    </div>
  );
}
