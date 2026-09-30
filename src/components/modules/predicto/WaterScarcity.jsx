import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { api } from '../../../lib/api';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const regions = [
  'Ahafo', 'Ashanti', 'Bono', 'Bono East', 'Central', 'Eastern', 'Greater Accra', 'North East',
  'Northern', 'Oti', 'Savannah', 'Upper East', 'Upper West', 'Volta', 'Western', 'Western North',
];

export default function WaterScarcity({ selectedLocation, onLocationChange }) {
  const [monitoring, setMonitoring] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(selectedLocation?.name || 'Greater Accra');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const data = monitoring?.selected;
  const isCurrentLocation = Number.isFinite(selectedLocation?.latitude) && Number.isFinite(selectedLocation?.longitude);

  useEffect(() => {
    if (isCurrentLocation) setSelectedRegion('My Location');
    else if (regions.includes(selectedLocation?.name)) setSelectedRegion(selectedLocation.name);
  }, [isCurrentLocation, selectedLocation]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.monitoring(isCurrentLocation ? selectedLocation : selectedRegion)
      .then((result) => { if (active) { setMonitoring(result); setError(''); } })
      .catch((requestError) => { if (active) setError(requestError.message || 'Unable to load live monitoring data.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [isCurrentLocation, selectedLocation, selectedRegion]);

  const chartData = {
    labels: data?.rainfall.map((_, index) => `Day ${index + 1}`) || [],
    datasets: [
      { label: 'Rainfall (mm)', data: data?.rainfall || [], borderColor: '#0284c7', backgroundColor: 'rgba(2, 132, 199, 0.2)', tension: 0.3 },
      { label: 'Soil moisture (%)', data: data ? data.rainfall.map(() => data.current.soilMoisture) : [], borderColor: '#16a34a', backgroundColor: 'rgba(22, 163, 74, 0.15)', tension: 0.3 },
    ],
  };

  return (
    <section className="bg-white p-6 rounded mt-6 mx-auto" style={{ maxWidth: "1200px", width: "100%" }}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div><h2 className="text-2xl font-bold">Water Scarcity Monitoring</h2><p className="text-sm text-gray-500">Live weather-derived water indicators for all Ghana regions.</p>{isCurrentLocation && <p className="mt-1 text-sm text-green-700"><strong>{selectedLocation.placeName || 'Current location'}</strong> · {selectedLocation.address || 'Address unavailable'}</p>}</div>
        <select value={selectedRegion} onChange={(event) => { const region = event.target.value; setSelectedRegion(region); onLocationChange?.({ name: region }); }} disabled={loading} className="border p-3 rounded w-full max-w-sm">
          {isCurrentLocation && <option value="My Location">My Location</option>}
          {regions.map((region) => <option key={region}>{region}</option>)}
        </select>
      </div>
      {loading && <p className="text-gray-600">Refreshing live monitoring data...</p>}
      {error && <p className="rounded border border-red-200 bg-red-50 p-3 text-red-800">{error}</p>}
      {data && <>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Metric label="Soil moisture" value={`${data.current.soilMoisture}%`} />
          <Metric label="NDMI" value={data.ndmi} />
          <Metric label="7-day rainfall" value={`${data.rainfall7d} mm/day`} />
          <Metric label="Humidity" value={`${data.current.humidity}%`} />
        </div>
        <div className="mt-6"><Line data={chartData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} /></div>
        <p className="mt-4 text-xs text-gray-500">Source: Open-Meteo, updated {monitoring.updatedAt ? new Date(monitoring.updatedAt).toLocaleString() : 'now'}.</p>
      </>}
    </section>
  );
}

function Metric({ label, value }) {
  return <div className="rounded border border-slate-200 bg-slate-50 p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-xl font-semibold text-slate-900">{value}</p></div>;
}
