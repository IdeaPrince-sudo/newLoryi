import React, { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../lib/api';

const numberValue = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const formatNumber = (value, maximumFractionDigits = 1) => new Intl.NumberFormat(undefined, { maximumFractionDigits }).format(value);
const formatMoney = (value) => `GH₵${new Intl.NumberFormat('en-GH', { maximumFractionDigits: 0 }).format(value)}`;

function areaInAcres(value, unit = '') {
  const amount = numberValue(value);
  const normalizedUnit = String(unit).toLowerCase();
  if (normalizedUnit.includes('hectare') || normalizedUnit === 'ha') return amount * 2.47105;
  if (normalizedUnit.includes('square meter') || normalizedUnit === 'sqm' || normalizedUnit === 'm2') return amount / 4046.8564;
  if (normalizedUnit.includes('plot')) return amount * 0.125;
  return amount;
}

function farmAreaInAcres(farm) {
  const raw = String(farm.landSize || '');
  const amount = Number(raw.match(/[\d.]+/)?.[0] || 0);
  const unit = raw.replace(/[\d.\s]/g, '').toLowerCase();
  return areaInAcres(amount, unit);
}

function dateFor(record) {
  const value = record.date || record.dueDate || record.startDate || record.createdAt || record.expectedHarvestDate;
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
}

function annualProjectMetrics(projects) {
  const years = new Map();
  projects.forEach((project) => {
    const date = dateFor(project);
    if (!date) return;
    const year = String(date.getFullYear());
    const row = years.get(year) || { year, cropYield: 0, revenue: 0, expenses: 0, profit: 0 };
    row.cropYield += numberValue(project.estimatedYield ?? project.cropYield);
    row.revenue += numberValue(project.estimatedRevenue ?? project.revenue);
    row.expenses += numberValue(project.expenses);
    row.profit = row.revenue - row.expenses;
    years.set(year, row);
  });
  return [...years.values()].sort((first, second) => first.year.localeCompare(second.year));
}

function EmptyPanel({ children }) {
  return <p className="py-8 text-center text-sm text-gray-500">{children}</p>;
}

const FarmDashboardLive = () => {
  const { currentUser } = useAuth();
  const [dashboardData, setDashboardData] = useState({ projects: [], activities: [], farms: [], forecast: [], reminders: [], alerts: [] });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const canReadAlerts = currentUser?.role === 'admin' || currentUser?.modules?.includes('Predicto');

  useEffect(() => {
    let active = true;
    const loadDashboard = async () => {
      setLoading(true);
      setLoadError('');
      const [projectsResult, activitiesResult, farmsResult] = await Promise.allSettled([
        api.farmProjects(),
        api.farmActivities(),
        api.geoSenseFarms(),
      ]);
      if (!active) return;

      const projects = projectsResult.status === 'fulfilled' ? projectsResult.value : [];
      const activities = activitiesResult.status === 'fulfilled' ? activitiesResult.value : [];
      const farms = farmsResult.status === 'fulfilled' ? farmsResult.value : [];
      const firstLocatedFarm = farms.find((farm) => Number.isFinite(Number(farm.location?.lat)) && Number.isFinite(Number(farm.location?.lng)));
      const weatherLocation = firstLocatedFarm
        ? { latitude: Number(firstLocatedFarm.location.lat), longitude: Number(firstLocatedFarm.location.lng), name: firstLocatedFarm.region || firstLocatedFarm.farmName }
        : farms[0]?.region || 'Greater Accra';
      const weatherResult = await Promise.allSettled([
        api.weather(weatherLocation),
        canReadAlerts ? api.alerts() : Promise.resolve([]),
      ]);
      if (!active) return;

      const weather = weatherResult[0].status === 'fulfilled' ? weatherResult[0].value : null;
      const alerts = weatherResult[1].status === 'fulfilled' ? weatherResult[1].value : [];
      setDashboardData({
        projects: Array.isArray(projects) ? projects : [],
        activities: Array.isArray(activities) ? activities : [],
        farms: Array.isArray(farms) ? farms : [],
        forecast: weather?.forecast || [],
        reminders: weather?.reminders || [],
        alerts: Array.isArray(alerts) ? alerts : [],
      });
      const coreErrors = [projectsResult, activitiesResult, farmsResult].filter((result) => result.status === 'rejected');
      setLoadError(coreErrors.length ? 'Some FarmIQ records could not be loaded. Check your connection and refresh.' : '');
      setLastUpdated(new Date());
      setLoading(false);
    };
    loadDashboard();
    return () => { active = false; };
  }, [currentUser?.id, canReadAlerts]);

  const { projects, activities, farms, forecast, reminders, alerts } = dashboardData;
  const totalLandAcres = useMemo(() => {
    if (projects.length) return projects.reduce((total, project) => total + areaInAcres(project.landSize, project.sizeUnit), 0);
    return farms.reduce((total, farm) => total + farmAreaInAcres(farm), 0);
  }, [projects, farms]);
  const activeProjects = projects.filter((project) => String(project.status || '').toLowerCase() === 'active').length;
  const expenses = projects.reduce((total, project) => total + numberValue(project.expenses), 0);
  const expectedYield = projects.reduce((total, project) => total + numberValue(project.estimatedYield ?? project.cropYield), 0);
  const annualMetrics = useMemo(() => annualProjectMetrics(projects), [projects]);
  const upcomingActivities = activities
    .filter((activity) => String(activity.status || '').toLowerCase() !== 'completed')
    .sort((first, second) => (dateFor(first)?.getTime() || Infinity) - (dateFor(second)?.getTime() || Infinity))
    .slice(0, 4);
  const notifications = [
    ...alerts.map((alert) => ({ title: alert.title || alert.type || 'Farm alert', message: alert.message || alert.description || alert.summary || 'Farm alert from your account', time: dateFor(alert)?.toLocaleDateString() || '' })),
    ...reminders.map((reminder) => ({ title: 'Weather advisory', message: reminder.message, time: '' })),
  ].slice(0, 5);
  const metrics = [
    { title: 'Total Land Area', value: `${formatNumber(totalLandAcres)} acres`, detail: projects.length ? 'Across FarmIQ projects' : farms.length ? 'From registered farms' : 'No farm area recorded', color: 'bg-green-600', icon: 'M3 7l9-4 9 4v10l-9 4-9-4V7zm9-4v18m-9-14l9 4 9-4' },
    { title: 'Active Projects', value: formatNumber(activeProjects, 0), detail: `${projects.length} total projects`, color: 'bg-blue-600', icon: 'M4 5h16v14H4zM8 9h8m-8 4h5' },
    { title: 'Current Expenses', value: formatMoney(expenses), detail: 'Recorded across projects', color: 'bg-amber-600', icon: 'M12 8c-1.7 0-3 .9-3 2s1.3 2 3 2 3 .9 3 2-1.3 2-3 2m0-8V6m0 12v-2' },
    { title: 'Est. Annual Yield', value: `${formatNumber(expectedYield, 0)} kg`, detail: 'From project estimates', color: 'bg-emerald-700', icon: 'M4 18l6-6 4 3 6-9m-6 0h6v6' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-gray-600">Live FarmIQ data from your projects, registered farms, activities, and weather.</p>
        <p className="text-xs text-gray-500">{loading ? 'Syncing…' : lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : ''}</p>
      </div>
      {loadError && <p role="alert" className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{loadError}</p>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.title} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div><p className="text-sm text-gray-500">{metric.title}</p><p className="mt-2 text-2xl font-bold text-gray-900">{loading ? '—' : metric.value}</p><p className="mt-1 text-xs text-gray-500">{metric.detail}</p></div>
              <span className={`rounded-md p-2 text-white ${metric.color}`}><svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d={metric.icon} strokeLinecap="round" strokeLinejoin="round" /></svg></span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-lg font-medium text-gray-800">Crop Yield by Harvest Year</h2>
          {annualMetrics.some((row) => row.cropYield > 0) ? <div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={annualMetrics}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="year" /><YAxis /><Tooltip formatter={(value) => [`${formatNumber(Number(value), 0)} kg`, 'Estimated yield']} /><Bar dataKey="cropYield" fill="#22c55e" name="Estimated yield (kg)" /></BarChart></ResponsiveContainer></div> : <EmptyPanel>{loading ? 'Loading project estimates…' : 'Add project yield estimates to see annual crop yield.'}</EmptyPanel>}
        </section>
        <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-lg font-medium text-gray-800">Revenue vs. Expenses</h2>
          {annualMetrics.some((row) => row.revenue || row.expenses) ? <div className="h-72"><ResponsiveContainer width="100%" height="100%"><LineChart data={annualMetrics}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="year" /><YAxis /><Tooltip formatter={(value) => [formatMoney(Number(value)), '']} /><Legend /><Line type="monotone" dataKey="revenue" stroke="#16a34a" name="Estimated Revenue" strokeWidth={2} /><Line type="monotone" dataKey="expenses" stroke="#ef4444" name="Expenses" strokeWidth={2} /><Line type="monotone" dataKey="profit" stroke="#2563eb" name="Estimated Profit" strokeWidth={2} /></LineChart></ResponsiveContainer></div> : <EmptyPanel>{loading ? 'Loading financial records…' : 'Add project revenue and expense estimates to see financial trends.'}</EmptyPanel>}
        </section>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-lg font-medium text-gray-800">Farm Performance Overview</h2>
        {annualMetrics.length ? <div className="h-72"><ResponsiveContainer width="100%" height="100%"><AreaChart data={annualMetrics}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="year" /><YAxis /><Tooltip /><Legend /><Area type="monotone" dataKey="cropYield" stroke="#10b981" fill="#10b98130" name="Estimated Yield (kg)" /><Area type="monotone" dataKey="profit" stroke="#3b82f6" fill="#3b82f630" name="Estimated Profit (GH₵)" /></AreaChart></ResponsiveContainer></div> : <EmptyPanel>{loading ? 'Loading performance records…' : 'Performance charts will appear when projects have dates and yield or financial estimates.'}</EmptyPanel>}
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-lg font-medium text-gray-800">Weather Forecast</h2>
          {forecast.length ? <div className="space-y-2">{forecast.slice(0, 3).map((day) => <div key={`${day.date}-${day.day}`} className="flex items-center justify-between gap-3 rounded-md bg-sky-50 p-3"><div><p className="font-medium text-gray-900">{day.day === forecast[0].day ? 'Today' : day.day}</p><p className="text-sm text-gray-600">{day.condition}{day.rain > 0 ? ` · ${day.rain} mm rain` : ''}</p></div><p className="text-lg font-semibold text-gray-900">{day.temp}°C</p></div>)}</div> : <EmptyPanel>{loading ? 'Loading live forecast…' : 'Weather forecast is currently unavailable.'}</EmptyPanel>}
        </section>
        <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-lg font-medium text-gray-800">Upcoming Activities</h2>
          {upcomingActivities.length ? <div className="space-y-3">{upcomingActivities.map((activity) => <div key={activity.id} className="border-l-2 border-emerald-500 pl-3"><p className="font-medium text-gray-900">{activity.name || activity.title || activity.type}</p><p className="text-sm text-gray-600">{activity.projectName || activity.location || 'Farm activity'}</p><p className="mt-1 text-xs text-gray-500">{dateFor(activity)?.toLocaleDateString() || 'Date not set'}</p></div>)}</div> : <EmptyPanel>{loading ? 'Loading farm activities…' : 'No upcoming activities recorded.'}</EmptyPanel>}
        </section>
        <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-lg font-medium text-gray-800">Alerts & Notifications</h2>
          {notifications.length ? <div className="space-y-3">{notifications.map((notification, index) => <div key={`${notification.title}-${index}`} className="border-l-2 border-amber-500 pl-3"><p className="font-medium text-gray-900">{notification.title}</p><p className="text-sm text-gray-600">{notification.message}</p>{notification.time && <p className="mt-1 text-xs text-gray-500">{notification.time}</p>}</div>)}</div> : <EmptyPanel>{loading ? 'Loading alerts…' : 'No current alerts or weather advisories.'}</EmptyPanel>}
        </section>
      </div>
    </div>
  );
};

export default FarmDashboardLive;
