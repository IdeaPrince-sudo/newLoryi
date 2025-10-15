import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
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

const cities = {
  Accra: [5.6037, -0.1870],
  Kumasi: [6.6884, -1.6244],
  Tamale: [9.4071, -0.8539],
  Takoradi: [4.8993, -1.7603],
};

const cityAliases = {
  Weija: "Accra",
  Tema: "Accra",
  // add more aliases here
};

const mockForecast = [
  { day: "Mon", date: "Jul 22", temp: 30, rain: 0, condition: "Sunny", icon: "☀️" },
  { day: "Tue", date: "Jul 23", temp: 28, rain: 5, condition: "Rain", icon: "🌧️" },
  { day: "Wed", date: "Jul 24", temp: 27, rain: 0, condition: "Cloudy", icon: "☁️" },
  { day: "Thu", date: "Jul 25", temp: 29, rain: 1, condition: "Partly Cloudy", icon: "⛅" },
  { day: "Fri", date: "Jul 26", temp: 31, rain: 0, condition: "Sunny", icon: "☀️" },
  { day: "Sat", date: "Jul 27", temp: 26, rain: 7, condition: "Rain", icon: "🌧️" },
  { day: "Sun", date: "Jul 28", temp: 25, rain: 12, condition: "Thunderstorm", icon: "🌩️" },
];

export default function WeatherForecastCard() {
  const [forecast, setForecast] = useState([]);
  const [selectedCity, setSelectedCity] = useState("Accra");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForecast(mockForecast);
    setError("");
  }, [selectedCity]);

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

  async function handleGetMyLocation() {
    setLoading(true);
    setError("");
    setForecast([]);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log("Got coords:", latitude, longitude);

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );
          if (!response.ok) throw new Error("Failed to fetch location info");
          const data = await response.json();

          console.log("Reverse geocode data:", data);

          // Extract city, town, or village
          const cityName =
            data.address.city ||
            data.address.town ||
            data.address.village ||
            data.address.county ||
            null;

          if (!cityName) {
            setError("Unable to detect city from your location.");
            setLoading(false);
            return;
          }

          console.log("Detected city:", cityName);

          // Check alias mapping
          const mappedCity = cityAliases[cityName] || cityName;

          // Verify if mapped city is in supported cities
          const cityFound = Object.keys(cities).find(
            (c) => c.toLowerCase() === mappedCity.toLowerCase()
          );

          if (cityFound) {
            setSelectedCity(cityFound);
            setError("");
          } else {
            setError(`Location detected: ${cityName}, but no forecast available.`);
          }
        } catch (err) {
          console.error("Reverse geocode error:", err);
          setError("Failed to retrieve location details.");
        }
        setLoading(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setError("Failed to get your location.");
        setLoading(false);
      }
    );
  }

  return (
    <div className="bg-white p-4 rounded shadow mt-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">📅 7-Day Weather Forecast</h2>
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 text-sm"
          disabled={loading}
        >
          {Object.keys(cities).map((city) => (
            <option key={city}>{city}</option>
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
