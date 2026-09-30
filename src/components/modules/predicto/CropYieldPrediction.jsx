import { useState } from "react";

export default function CropYieldPrediction({ selectedLocation, onLocationChange }) {
  const [crop, setCrop] = useState("maize");
  const [location, setLocation] = useState(null); // {lat, lng}
  const [yieldEstimate, setYieldEstimate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const hasSharedLocation = Number.isFinite(selectedLocation?.latitude) && Number.isFinite(selectedLocation?.longitude);

  // For detailed breakdown
  const [details, setDetails] = useState(null);

  const handleGetLocationAndPredict = () => {
    setError(null);
    setNotice(null);
    setYieldEstimate(null);
    setDetails(null);

    if (!crop) {
      setError("Please select a crop.");
      return;
    }

    if (hasSharedLocation) {
      predictAtLocation(selectedLocation.latitude, selectedLocation.longitude);
      return;
    }

    if (!navigator.geolocation) {
      setNotice("Using Greater Accra because browser location access is unavailable.");
      predictAtLocation(5.75, -0.2);
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition((pos) => predictAtLocation(pos.coords.latitude, pos.coords.longitude),
      () => {
        setNotice("Using Greater Accra because browser location access was unavailable.");
        predictAtLocation(5.75, -0.2);
      }
    );
  };

  const predictAtLocation = (latitude, longitude) => {
    const coords = { lat: latitude, lng: longitude };
    setLocation({ lat: latitude.toFixed(6), lng: longitude.toFixed(6) });
    onLocationChange?.({ ...selectedLocation, name: 'My Location', latitude, longitude });
    setTimeout(() => {
      try {
        const result = predictYieldWithDetails(crop, coords);
        setYieldEstimate(result.predictedYield.toFixed(2));
        setDetails(result);
      } catch {
        setError("Failed to predict yield. Please try again.");
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  const handleReset = () => {
    setCrop("maize");
    setLocation(null);
    setYieldEstimate(null);
    setError(null);
    setNotice(null);
    setDetails(null);
  };

  return (
<div className="bg-white p-6 rounded-lg shadow-md mt-6 max-w-full px-10 mx-auto">

      <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
        <span>🌾</span>
        <span>Crop Yield Prediction</span>
      </h2>

      <div className="space-y-4">
        {/* Crop selector */}
        <div>
          <label htmlFor="crop" className="block text-sm font-medium text-gray-700 mb-1">
            Select Crop
          </label>
          <select
            id="crop"
            className="block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
          >
            <option value="">-- Choose a crop --</option>
            <option value="maize">Maize</option>
            <option value="rice">Rice</option>
            <option value="tomato">Tomato</option>
            <option value="cassava">Cassava</option>
            <option value="yam">Yam</option>
            <option value="plantain">Plantain</option>
            <option value="cocoa">Cocoa</option>
            <option value="millet">Millet</option>
            <option value="sorghum">Sorghum</option>
            <option value="groundnut">Groundnut</option>
            <option value="soybean">Soybean</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleGetLocationAndPredict}
            disabled={loading || !crop}
            className={`flex-1 bg-green-600 text-white font-semibold py-2 rounded hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 disabled:opacity-50 disabled:cursor-not-allowed justify-center ${
              loading ? "cursor-wait" : ""
            }`}
          >
            {loading ? "Predicting..." : "Get Location & Predict Yield"}
          </button>

          <button
            onClick={handleReset}
            disabled={loading && !yieldEstimate}
            className="flex-1 bg-gray-300 text-gray-800 font-semibold py-2 rounded hover:bg-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset
          </button>
        </div>

        {/* Error */}
        {notice && (
          <p className="text-amber-700 text-sm font-medium mt-2" role="status">
            {notice}
          </p>
        )}

        {error && (
          <p className="text-red-600 text-sm font-medium mt-2" role="alert">
            ⚠️ {error}
          </p>
        )}

        {/* Result with details */}
        {yieldEstimate && !loading && location && details && (
          <div
            className="mt-6 p-4 bg-green-50 border border-green-300 rounded text-green-800 font-semibold text-center transition-opacity duration-500 ease-in"
            role="status"
            aria-live="polite"
          >
            <p>
              📊 Estimated yield for <strong>{crop}</strong> at your location (Lat:{" "}
              {location.lat}, Lng: {location.lng}):
              <span className="ml-2 text-lg">{yieldEstimate} tonnes/hectare</span>
            </p>

            <div className="mt-4 text-left text-green-900 text-sm bg-green-100 rounded p-3 shadow-inner">
              <h3 className="font-semibold mb-2 underline">Prediction Breakdown:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong>Base yield for {crop}:</strong> {details.baseYield} tonnes/hectare
                </li>
                <li>
                  <strong>Latitude factor:</strong> {details.latFactor.toFixed(3)} (Based on
                  distance from equator)
                </li>
                <li>
                  <strong>Longitude factor:</strong> {details.lngFactor.toFixed(3)} (Based on
                  position relative to prime meridian)
                </li>
                <li>
                  <strong>Random environmental factor:</strong> {details.noise.toFixed(3)} (To
                  simulate variation)
                </li>
              </ul>

              <h3 className="font-semibold mt-4 mb-1 underline">Explanation:</h3>
              <p className="text-xs leading-tight">
                The predicted yield depends on the base yield for the selected crop, adjusted by
                location-specific factors:
              </p>
              <ul className="text-xs list-disc list-inside mt-1">
                <li>
                  <strong>Latitude factor:</strong> Yield potential decreases as you move farther
                  from the equator, due to changes in sunlight and climate.
                </li>
                <li>
                  <strong>Longitude factor:</strong> Accounts for climatic zones and terrain
                  effects relative to the prime meridian.
                </li>
                <li>
                  <strong>Random environmental factor:</strong> Represents unpredictable
                  influences such as weather variation, soil condition, pests, and farming
                  practices.
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Enhanced predictYield function returning detailed info:
export function predictYieldWithDetails(crop, location) {
  const lat = parseFloat(location.lat);
  const lng = parseFloat(location.lng);

  const baseYields = {
    maize: 3.5,
    rice: 4.0,
    tomato: 6.0,
    cassava: 12.0,
    yam: 10.0,
    plantain: 9.0,
    cocoa: 0.8,
    millet: 2.0,
    sorghum: 2.5,
    groundnut: 2.2,
    soybean: 2.4,
  };

  const baseYield = baseYields[crop] ?? 3.0;

  // Factors between 0 and 1
  const latFactor = 1 - Math.abs(lat) / 90;
  const lngFactor = 1 - Math.abs((lng % 180) / 180);

  // Noise simulates natural variation (0.9 - 1.1)
  const noise = 0.9 + Math.random() * 0.2;

  const predictedYield = baseYield * ((latFactor + lngFactor) / 2) * noise;

  return {
    predictedYield,
    baseYield,
    latFactor,
    lngFactor,
    noise,
  };
}
