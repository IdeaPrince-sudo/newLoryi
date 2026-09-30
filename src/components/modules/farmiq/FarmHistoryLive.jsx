import React, { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api } from '../../../lib/api';

const COLORS = ['#15803d', '#ca8a04', '#2563eb', '#dc2626', '#0891b2', '#7c3aed', '#475569'];
const numberOrNull = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

function recordDate(record) {
  const value = record.harvestDate || record.expectedHarvestDate || record.date || record.startDate || record.createdAt;
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
}

function cropLabel(project) {
  const label = project.cropName || project.crop || project.cropType || project.name || 'Unspecified crop';
  return String(label).replace(/[-_]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function areaValue(project) {
  const amount = numberOrNull(project.landSize) || 0;
  const unit = String(project.sizeUnit || '').toLowerCase();
  if (unit.includes('hectare') || unit === 'ha') return amount * 2.47105;
  if (unit.includes('sqm') || unit.includes('square meter')) return amount / 4046.8564;
  return amount;
}

function makeFinancialHistory(projects) {
  const years = new Map();
  projects.forEach((project) => {
    const date = recordDate(project);
    if (!date) return;
    const revenue = numberOrNull(project.actualRevenue ?? project.revenue ?? project.estimatedRevenue);
    const expenses = numberOrNull(project.actualExpenses ?? project.expenses);
    if (revenue === null && expenses === null) return;
    const year = String(date.getFullYear());
    const row = years.get(year) || { year, revenue: 0, expenses: 0, profit: 0, hasRevenue: false, hasExpenses: false };
    if (revenue !== null) { row.revenue += revenue; row.hasRevenue = true; }
    if (expenses !== null) { row.expenses += expenses; row.hasExpenses = true; }
    row.profit = row.revenue - row.expenses;
    years.set(year, row);
  });
  return [...years.values()].sort((first, second) => first.year.localeCompare(second.year));
}

function EmptyPanel({ children }) {
  return <p className="flex min-h-40 items-center justify-center px-5 text-center text-sm text-gray-500">{children}</p>;
}

const FarmHistoryLive = () => {
  const [farms, setFarms] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activities, setActivities] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [weatherHistory, setWeatherHistory] = useState([]);
  const [weatherSource, setWeatherSource] = useState('');
  const [loading, setLoading] = useState(true);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [weatherError, setWeatherError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([api.geoSenseFarms(), api.farmProjects(), api.farmActivities()])
      .then(([farmRecords, projectRecords, activityRecords]) => {
        if (!active) return;
        const ownFarms = Array.isArray(farmRecords) ? farmRecords : [];
        setFarms(ownFarms);
        setProjects(Array.isArray(projectRecords) ? projectRecords : []);
        setActivities(Array.isArray(activityRecords) ? activityRecords : []);
        setSelectedFarmId((current) => current || String(ownFarms[0]?.id || ''));
        setLoadError('');
      })
      .catch((error) => { if (active) setLoadError(error.message || 'Your farm history could not be loaded.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!selectedFarmId) {
      setWeatherHistory([]);
      setWeatherSource('');
      setWeatherError('');
      return undefined;
    }
    let active = true;
    setWeatherLoading(true);
    setWeatherError('');
    api.farmWeatherHistory(selectedFarmId)
      .then((result) => {
        if (!active) return;
        setWeatherHistory(result.history || []);
        setWeatherSource(result.source || '');
      })
      .catch((error) => {
        if (!active) return;
        setWeatherHistory([]);
        setWeatherError(error.message || 'Archived weather data could not be loaded for this farm.');
      })
      .finally(() => { if (active) setWeatherLoading(false); });
    return () => { active = false; };
  }, [selectedFarmId]);

  const selectedFarm = farms.find((farm) => String(farm.id) === selectedFarmId);
  const financialHistory = useMemo(() => makeFinancialHistory(projects), [projects]);
  const cropDistribution = useMemo(() => {
    const areas = new Map();
    projects.forEach((project) => {
      const crop = cropLabel(project);
      areas.set(crop, (areas.get(crop) || 0) + areaValue(project));
    });
    const totalArea = [...areas.values()].reduce((total, area) => total + area, 0);
    return [...areas.entries()].map(([name, area], index) => ({
      name,
      area: Number(area.toFixed(2)),
      share: totalArea ? Number((area / totalArea * 100).toFixed(1)) : 0,
      color: COLORS[index % COLORS.length],
    })).sort((first, second) => second.area - first.area);
  }, [projects]);
  const cropPerformance = useMemo(() => {
    const grouped = new Map();
    projects.forEach((project) => {
      const actualYield = numberOrNull(project.actualYield ?? project.harvestedYield);
      if (actualYield === null) return;
      const crop = cropLabel(project);
      const row = grouped.get(crop) || { crop, actualYield: 0, expectedYield: 0, hasExpected: false, projects: 0 };
      row.actualYield += actualYield;
      const expected = numberOrNull(project.estimatedYield ?? project.expectedYield);
      if (expected !== null && expected > 0) { row.expectedYield += expected; row.hasExpected = true; }
      row.projects += 1;
      grouped.set(crop, row);
    });
    return [...grouped.values()].map((row) => ({
      ...row,
      efficiency: row.hasExpected ? Math.round(row.actualYield / row.expectedYield * 100) : null,
    }));
  }, [projects]);
  const observations = useMemo(() => [
    ...projects.flatMap((project) => [project.observations, project.notes, project.historyNote]
      .filter((note) => typeof note === 'string' && note.trim())
      .map((note) => ({ text: note.trim(), date: recordDate(project), source: project.name || 'Farm project' }))),
    ...activities.flatMap((activity) => [activity.observations, activity.notes, activity.description]
      .filter((note) => typeof note === 'string' && note.trim())
      .map((note) => ({ text: note.trim(), date: recordDate(activity), source: activity.name || activity.type || 'Farm activity' }))),
  ].sort((first, second) => (second.date?.getTime() || 0) - (first.date?.getTime() || 0)), [projects, activities]);

  const formatCurrency = (value) => `GH₵${Number(value).toLocaleString('en-GH', { maximumFractionDigits: 0 })}`;

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Historical Farm Data</h2>
            <p className="mt-1 text-sm text-gray-600">History and summaries from your projects, activities, registered farms, and archived weather.</p>
          </div>
          <label className="min-w-56 text-sm font-medium text-gray-700">
            Registered farm
            <select value={selectedFarmId} onChange={(event) => setSelectedFarmId(event.target.value)} className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2">
              <option value="">Select a farm</option>
              {farms.map((farm) => <option key={farm.id} value={farm.id}>{farm.farmName}</option>)}
            </select>
          </label>
        </div>
        {loading && <p className="mt-4 text-sm text-gray-500">Loading your farm records…</p>}
        {loadError && <p role="alert" className="mt-4 text-sm text-red-700">{loadError}</p>}
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <h3 className="mb-3 text-base font-medium text-gray-800">Yearly Revenue & Expenses</h3>
            {financialHistory.length ? <div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={financialHistory}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="year" /><YAxis /><Tooltip formatter={(value) => [formatCurrency(value), '']} /><Legend /><Bar dataKey="revenue" name="Recorded / estimated revenue" fill="#22c55e" /><Bar dataKey="expenses" name="Recorded expenses" fill="#ef4444" /></BarChart></ResponsiveContainer></div> : <EmptyPanel>{loading ? 'Loading project finances…' : 'No dated project revenue or expense records are available yet.'}</EmptyPanel>}
          </div>
          <div>
            <h3 className="mb-3 text-base font-medium text-gray-800">Profit Trend</h3>
            {financialHistory.length ? <div className="h-72"><ResponsiveContainer width="100%" height="100%"><LineChart data={financialHistory}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="year" /><YAxis /><Tooltip formatter={(value) => [formatCurrency(value), 'Profit']} /><Line type="monotone" dataKey="profit" name="Revenue less expenses" stroke="#2563eb" strokeWidth={2} activeDot={{ r: 5 }} /></LineChart></ResponsiveContainer></div> : <EmptyPanel>{loading ? 'Loading project finances…' : 'Profit trend appears after project financials are recorded.'}</EmptyPanel>}
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-500">Financial values are grouped by project harvest date, falling back to start date or record date. Project estimates are not actuals.</p>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div><h3 className="text-base font-medium text-gray-800">Historical Weather Impact</h3><p className="mt-1 text-xs text-gray-500">Archived daily observations for {selectedFarm?.farmName || 'the selected farm'}{weatherSource ? ` · ${weatherSource}` : ''}</p></div>
          {weatherLoading && <span className="text-sm text-gray-500">Loading archive…</span>}
        </div>
        {weatherError && <p role="alert" className="mb-3 text-sm text-amber-800">{weatherError}</p>}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-700">Annual Rainfall</h4>
            {weatherHistory.length ? <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={weatherHistory}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="year" /><YAxis /><Tooltip formatter={(value) => [`${value} mm`, 'Rainfall']} /><Bar dataKey="rainfall" name="Rainfall (mm)" fill="#3b82f6" /></BarChart></ResponsiveContainer></div> : <EmptyPanel>{weatherLoading ? 'Loading archived rainfall…' : 'No archived rainfall is available. Select a registered farm with saved coordinates.'}</EmptyPanel>}
          </div>
          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-700">Average Temperature</h4>
            {weatherHistory.some((item) => item.temperature !== null) ? <div className="h-64"><ResponsiveContainer width="100%" height="100%"><LineChart data={weatherHistory}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="year" /><YAxis /><Tooltip formatter={(value) => [`${value}°C`, 'Annual daily mean']} /><Line type="monotone" dataKey="temperature" name="Average temperature (°C)" stroke="#ef4444" strokeWidth={2} /></LineChart></ResponsiveContainer></div> : <EmptyPanel>{weatherLoading ? 'Loading archived temperature…' : 'No archived temperature observations are available for this farm.'}</EmptyPanel>}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-base font-medium text-gray-800">Crop Distribution by Projected Area</h3>
        {cropDistribution.length ? <div className="grid grid-cols-1 gap-4 md:grid-cols-2"><div className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={cropDistribution} dataKey="area" nameKey="name" cx="50%" cy="50%" outerRadius={82} label={false}>{cropDistribution.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip formatter={(value, _name, item) => [`${value} area units (${item.payload.share}%)`, item.payload.name]} /></PieChart></ResponsiveContainer></div><ul className="space-y-2 self-center">{cropDistribution.map((crop) => <li key={crop.name} className="flex items-center gap-2 text-sm"><span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: crop.color }} /><span className="flex-1">{crop.name}</span><span className="text-gray-600">{crop.area} area units · {crop.share}%</span></li>)}</ul></div> : <EmptyPanel>{loading ? 'Loading crop projects…' : 'No crop type or project area has been recorded yet.'}</EmptyPanel>}
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-base font-medium text-gray-800">Crop Performance Summary</h3>
        {cropPerformance.length ? <div className="space-y-4">{cropPerformance.map((crop) => <div key={crop.crop}><div className="flex flex-wrap items-baseline justify-between gap-2"><h4 className="text-sm font-medium text-gray-800">{crop.crop}</h4><span className="text-sm text-gray-600">Actual yield {crop.actualYield.toLocaleString()} kg{crop.efficiency !== null ? ` · ${crop.efficiency}% of estimate` : ''}</span></div>{crop.efficiency !== null && <div className="mt-2 h-2 overflow-hidden rounded bg-gray-100"><div className="h-full rounded bg-emerald-600" style={{ width: `${Math.min(crop.efficiency, 100)}%` }} /></div>}</div>)}</div> : <EmptyPanel>{loading ? 'Loading harvest records…' : 'No actual harvest/yield records exist yet. Record actualYield on a project to see crop performance.'}</EmptyPanel>}
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-base font-medium text-gray-800">Historical Notes & Observations</h3>
        {observations.length ? <div className="space-y-4">{observations.map((entry, index) => <article key={`${entry.source}-${entry.date?.toISOString() || index}`} className="border-l-2 border-emerald-600 pl-4"><p className="text-sm text-gray-700">{entry.text}</p><p className="mt-1 text-xs text-gray-500">{entry.source}{entry.date ? ` · ${entry.date.toLocaleDateString()}` : ''}</p></article>)}</div> : <EmptyPanel>{loading ? 'Loading notes…' : 'No historical notes have been recorded on your projects or activities.'}</EmptyPanel>}
      </section>
    </div>
  );
};

export default FarmHistoryLive;
