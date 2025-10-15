import { useState } from "react";
import { estimateCarbonAndGHG } from "./useCarbonModel";

export default function SoilCarbonMonitoring() {
  const [region, setRegion] = useState("Ejisu");
  const [detectedLocation, setDetectedLocation] = useState(null); // { latitude, longitude }
  const [locationName, setLocationName] = useState(null);
  const [data, setData] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [error, setError] = useState(null);

  const handleUseMyLocation = () => {
    setError(null);
    setLoadingLocation(true);
    setLocationName(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setDetectedLocation({ latitude, longitude });
        setLoadingLocation(false);

        fetchAddressFromCoords(latitude, longitude);
      },
      () => {
        setError("Unable to retrieve your location.");
        setLoadingLocation(false);
      }
    );
  };

  const fetchAddressFromCoords = async (lat, lon) => {
    setLoadingAddress(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );
      const json = await res.json();
      if (json.address) {
        const city = json.address.city || json.address.town || json.address.village || "Unknown town";
        const state = json.address.state || json.address.region || "Unknown region";
        setLocationName({ city, state });
        setRegion(state);
      } else {
        setLocationName({ city: "Unknown town", state: "Unknown region" });
      }
    } catch {
      setLocationName({ city: "Unknown town", state: "Unknown region" });
    }
    setLoadingAddress(false);
  };

  const handleCheck = () => {
    setError(null);
    const locationToUse = region;
    const result = estimateCarbonAndGHG(locationToUse);
    setData(result);
  };

  // Color indicator helpers
  const getSoilCarbonColor = (value) => {
    if (value > 5) return "text-green-700";
    if (value >= 2) return "text-yellow-600";
    return "text-red-600";
  };

  const getGHGColor = (value) => {
    if (value < 10) return "text-green-700";
    if (value <= 20) return "text-yellow-600";
    return "text-red-600";
  };

  const getAnomalyColor = (level) => {
    switch (level.toLowerCase()) {
      case "low risk":
        return "text-green-700";
      case "moderate risk":
        return "text-yellow-600";
      case "high risk":
        return "text-red-600";
      default:
        return "text-gray-700";
    }
  };

  return (
    <div className="bg-white p-8 rounded shadow mt-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 flex items-center space-x-3 text-green-900">
        <span>🧪</span>
        <span>Soil Carbon & GHG Monitoring</span>
      </h2>

      <div className="flex flex-col sm:flex-row gap-6 mb-6">
        <div className="flex flex-col flex-1">
          <label htmlFor="region" className="mb-1 font-medium text-green-900">
            Select Region
          </label>
          <select
            id="region"
            className="border border-green-400 p-3 rounded focus:outline-none focus:ring-2 focus:ring-green-600 text-lg"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            disabled={loadingLocation}
            aria-label="Select Region"
          >
            <option value="Ejisu">Ejisu</option>
            <option value="Wa">Wa</option>
            <option value="Tamale">Tamale</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={handleUseMyLocation}
            disabled={loadingLocation}
            className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {loadingLocation ? "Getting Location..." : "Use My Location"}
          </button>
        </div>
      </div>

      {detectedLocation && (
        <div className="mb-2 text-green-800 text-lg font-semibold">
          📍 Detected Coordinates:{" "}
          <span className="text-green-600">
            Lat: {detectedLocation.latitude.toFixed(4)}, Lon: {detectedLocation.longitude.toFixed(4)}
          </span>
        </div>
      )}

      {loadingAddress && <p className="mb-2 text-green-500">Resolving address...</p>}

      {locationName && (
        <div className="mb-6 text-green-900 text-lg font-semibold">
          🏙️ Location Name: <span className="text-green-700">{locationName.city}</span>,{" "}
          <span className="text-green-700">{locationName.state}</span>
        </div>
      )}

      <button
        onClick={handleCheck}
        disabled={!region}
        className="bg-green-700 text-white px-8 py-3 rounded hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed w-full text-lg font-semibold"
      >
        Monitor Soil Carbon & GHG
      </button>

      {error && (
        <p className="mt-6 text-red-600 font-medium text-lg" role="alert">
          ⚠️ {error}
        </p>
      )}

      {data && (
        <div className="mt-8 space-y-6 text-green-900 text-lg">
          <div>
            🌿 <strong>Soil Carbon Sequestration:</strong>{" "}
            <span className={`${getSoilCarbonColor(data.soilCarbon)} font-bold`}>
              {data.soilCarbon} t/ha
            </span>
          </div>
          <div>
            💨 <strong>GHG Emissions:</strong>{" "}
            <span className={`${getGHGColor(data.ghgEmissions)} font-bold`}>
              {data.ghgEmissions} CO₂e/ha
            </span>
          </div>
          <div>
            📈 <strong>Anomaly Level:</strong>{" "}
            <span className={`${getAnomalyColor(data.anomaly)} font-bold`}>
              {data.anomaly}
            </span>
          </div>

          <div className="mt-6 bg-green-100 border border-green-300 rounded p-4 text-green-800 text-base">
            <h3 className="font-semibold mb-2">Explanation:</h3>
            <p>
              <strong>Soil Carbon Sequestration</strong> indicates how much carbon is stored in the soil, helping reduce atmospheric CO₂ and mitigate climate change. Higher values (&gt;5 t/ha) are excellent and show healthy, carbon-rich soils. Moderate values (2-5 t/ha) are average, while low values (&lt;2 t/ha) suggest poor soil carbon storage which might affect soil fertility.
            </p>
            <p className="mt-2">
              <strong>GHG Emissions</strong> represent the amount of greenhouse gases released per hectare. Lower emissions (&lt;10 CO₂e/ha) are better, indicating less environmental impact. Moderate emissions (10-20 CO₂e/ha) show some concern, while high emissions (&gt;20 CO₂e/ha) indicate significant contribution to climate change.
            </p>
            <p className="mt-2">
              <strong>Anomaly Level</strong> reflects the risk of abnormal soil conditions. "Low Risk" means conditions are stable, "Moderate Risk" indicates potential issues requiring monitoring, and "High Risk" warns of severe soil degradation or environmental concerns.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
