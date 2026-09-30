import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { api } from '../../../lib/api';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

const regions = [
  'Ahafo', 'Ashanti', 'Bono', 'Bono East', 'Central', 'Eastern', 'Greater Accra', 'North East',
  'Northern', 'Oti', 'Savannah', 'Upper East', 'Upper West', 'Volta', 'Western', 'Western North',
];

const cityAliases = {
  Weija: 'Greater Accra', Tema: 'Greater Accra', Accra: 'Greater Accra', Kumasi: 'Ashanti', Tamale: 'Northern',
};

export default function WeatherForecastCard({ selectedLocation, onLocationChange }) {
  const [forecast, setForecast] = useState([]);
  const [localLocation, setLocalLocation] = useState({ name: 'Greater Accra' });
  const location = selectedLocation || localLocation;
  const selectedCity = location.name;
  const currentPlaceName = location.placeName || location.name;
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.weather(location)
      .then((weather) => {
        if (active) {
          setForecast(weather.forecast);
          setError("");
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || "Unable to load live weather.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [location]);

  useEffect(() => {
    if (!location.latitude || !location.longitude || location.placeName && location.placeName !== 'Current location') return undefined;
    let active = true;
    fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${location.latitude}&lon=${location.longitude}`)
      .then((response) => response.json())
      .then((data) => {
        if (!active) return;
        const placeName = data.address?.city || data.address?.town || data.address?.village || data.address?.municipality || data.address?.suburb || data.name || data.address?.county || data.address?.state || 'Current location';
        onLocationChange?.({ ...location, placeName, address: data.display_name || location.address || 'Address unavailable' });
      })
      .catch(() => {});
    return () => { active = false; };
  }, [location.latitude, location.longitude, location.placeName, location.address, onLocationChange]);

  const tempChartData = {
    labels: forecast.map((d) => d.day),
    datasets: [
      {
        label: `Temperature (°C) in ${selectedCity}`,
        data: forecast.map((d) => d.temp),
        backgroundColor: "rgba(59, 130, 246, 0.4)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 4,
        fill: true,
      },
    ],
  };

  const rainChartData = {
    labels: forecast.map((d) => d.day),
    datasets: [
      {
        label: `Rainfall (mm) in ${selectedCity}`,
        data: forecast.map((d) => d.rain),
        backgroundColor: "rgba(14, 165, 233, 0.4)",
        borderColor: "rgba(14, 165, 233, 1)",
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 4,
        fill: true,
      },
    ],
  };

  const [showTempChart, setShowTempChart] = useState(false);
  const [showRainChart, setShowRainChart] = useState(false);

  const applyLocation = ({ name, placeName, address, latitude, longitude, detectedFrom }) => {
    const nextLocation = { name, placeName, address, latitude, longitude, detectedFrom };
    if (onLocationChange) onLocationChange(nextLocation);
    else setLocalLocation(nextLocation);
  };

  async function handleGetMyLocation() {
    setLoading(true);
    setError("");
    setForecast([]);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser. Showing Greater Accra instead.");
      applyLocation({ name: 'Greater Accra' });
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          const cityName =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.municipality ||
            data.address?.suburb ||
            data.address?.county ||
            data.name ||
            data.address?.state ||
            null;

          const mappedRegion = cityAliases[cityName] || cityName || 'Greater Accra';
          applyLocation({ name: 'My Location', placeName: cityName || data.address?.county || 'Current location', address: data.display_name || 'Address unavailable', latitude, longitude, detectedFrom: mappedRegion });
          setError("");
        } catch (err) {
          console.warn('Reverse geocode unavailable, using coordinates directly:', err);
          applyLocation({ name: 'My Location', placeName: 'Current location', address: `Coordinates: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`, latitude, longitude, detectedFrom: 'My Location' });
          setError("");
        }
        setLoading(false);
      },
      (error) => {
        console.warn('Geolocation denied or unavailable:', error);
        setError("Location access unavailable. Showing Greater Accra forecast instead.");
        applyLocation({ name: 'Greater Accra' });
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  }

  return (
    <div className="bg-white p-4 rounded shadow mt-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">📅 7-Day Weather Forecast</h2>
        <select
          value={selectedCity}
          onChange={(e) => (onLocationChange ? onLocationChange({ name: e.target.value }) : setLocalLocation({ name: e.target.value }))}
          className="border border-gray-300 rounded px-2 py-1 text-sm"
          disabled={loading}
        >
          {location.latitude && <option value="My Location">My Location</option>}
          {regions.map((region) => (
            <option key={region}>{region}</option>
          ))}
        </select>
      </div>

      <button
        onClick={handleGetMyLocation}
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Detecting Location..." : "Get My Location"}
      </button>

      {location.latitude && (
        <div className="mb-4 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-900">
          <p><strong>Current location:</strong> {currentPlaceName}</p>
          <p><strong>Address:</strong> {location.address || "Resolving address..."}</p>
        </div>
      )}

      {error && <p className="mb-4 text-red-600 font-semibold">{error}</p>}

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        {forecast.map((d, i) => (
          <div
            key={i}
            className="bg-blue-50 p-3 rounded text-center border border-blue-100 shadow-sm hover:bg-blue-100 transition"
          >
            <p className="font-semibold text-sm text-blue-800">{d.day}</p>
            <p className="text-xs text-gray-600">{d.date}</p>
            <div className="text-2xl my-1">{d.icon}</div>
            <p className="text-lg font-bold text-gray-800">{d.temp}°C</p>
            <p className="text-xs text-gray-700">{d.condition}</p>
            <p className="text-xs text-gray-700 mt-1">🌧️ {d.rain} mm</p>
          </div>
        ))}
      </div>

      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setShowTempChart((prev) => !prev)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          disabled={!forecast.length}
        >
          {showTempChart ? "Hide" : "Show"} Temperature Chart
        </button>

        <button
          onClick={() => setShowRainChart((prev) => !prev)}
          className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition"
          disabled={!forecast.length}
        >
          {showRainChart ? "Hide" : "Show"} Rainfall Chart
        </button>
      </div>

      {showTempChart && (
        <div className="mb-6">
          <Line data={tempChartData} options={{ responsive: true }} />
        </div>
      )}

      {showRainChart && (
        <div className="mb-6">
          <Line data={rainChartData} options={{ responsive: true }} />
        </div>
      )}
    </div>
  );
}
