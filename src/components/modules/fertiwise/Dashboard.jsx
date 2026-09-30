import React, { useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../lib/api';
import StatsCard from './StatsCard';

const chartColors = ['#16803c', '#e0a426', '#3478a8', '#c7663d', '#6a8d4f', '#9168a1', '#328c88'];
const amountKg = (record) => Number(record.amountKg ?? String(record.amount || '').replace(/[^\d.-]/g, '')) || 0;
const costGhs = (record) => Number(record.costGhs ?? record.cost) || 0;
const recordDate = (record) => new Date(`${String(record.date || record.createdAt || '').slice(0, 10)}T00:00:00`);
const formatCedis = (value) => new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', maximumFractionDigits: 0 }).format(Number(value) || 0);
const formatPercentChange = (current, previous) => {
  if (!previous) return current ? 'New this month' : 'No change';
  const change = ((current - previous) / previous) * 100;
  return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
};
const getTrend = (current, previous) => current === previous ? 'neutral' : current > previous ? 'up' : 'down';

const monthStart = (date, offset = 0) => new Date(date.getFullYear(), date.getMonth() + offset, 1);
const isInMonth = (record, start) => {
  const date = recordDate(record);
  return !Number.isNaN(date.getTime()) && date >= start && date < monthStart(start, 1);
};

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [farms, setFarms] = useState([]);
  const [applications, setApplications] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [weatherMessage, setWeatherMessage] = useState('');

  useEffect(() => {
    let active = true;
    const loadDashboard = async () => {
      setLoading(true);
      setError('');
      const [farmResult, applicationResult] = await Promise.allSettled([api.geoSenseFarms(), api.fertilizerApplications()]);
      if (!active) return;

      if (farmResult.status === 'fulfilled') {
        const ownedFarms = farmResult.value.filter((farm) => farm.ownerId === currentUser?.id || farm.farmerId === currentUser?.id);
        setFarms(ownedFarms);
        const weatherFarm = ownedFarms.find((farm) => Number.isFinite(Number(farm.location?.lat)) && Number.isFinite(Number(farm.location?.lng)));
        if (weatherFarm) {
          try {
            const liveWeather = await api.weather({ latitude: Number(weatherFarm.location.lat), longitude: Number(weatherFarm.location.lng), name: weatherFarm.farmName });
            if (active) setForecast(liveWeather.forecast || []);
          } catch {
            if (active) setWeatherMessage('Live farm forecast is unavailable for your account.');
          }
        } else {
          setWeatherMessage('Add a farm location to see its live forecast.');
        }
      } else {
        setError(farmResult.reason?.message || 'Your farm profiles could not be loaded.');
      }

      if (applicationResult.status === 'fulfilled') {
        setApplications(applicationResult.value.filter((record) => record.ownerId === currentUser?.id));
      } else {
        setError((previous) => [previous, applicationResult.reason?.message || 'Application history could not be loaded.'].filter(Boolean).join(' '));
      }
      if (active) setLoading(false);
    };
    loadDashboard();
    return () => { active = false; };
  }, [currentUser?.id]);

  const dashboardData = useMemo(() => {
    const now = new Date();
    const thisMonthStart = monthStart(now);
    const lastMonthStart = monthStart(now, -1);
    const thisMonth = applications.filter((record) => isInMonth(record, thisMonthStart));
    const lastMonth = applications.filter((record) => isInMonth(record, lastMonthStart));
    const sum = (records, getValue) => records.reduce((total, record) => total + getValue(record), 0);

    const usageByType = new Map();
    const monthlyUsage = Array.from({ length: 6 }, (_, index) => {
      const date = monthStart(now, index - 5);
      return { month: date.toLocaleDateString('en', { month: 'short' }), usage: 0, key: `${date.getFullYear()}-${date.getMonth()}` };
    });
    const actualPriceByType = new Map();
    applications.forEach((record) => {
      const type = record.fertilizerType || 'Other';
      usageByType.set(type, (usageByType.get(type) || 0) + amountKg(record));
      const date = recordDate(record);
      const monthEntry = monthlyUsage.find((entry) => entry.key === `${date.getFullYear()}-${date.getMonth()}`);
      if (monthEntry) monthEntry.usage += amountKg(record);
      const amount = amountKg(record);
      if (amount > 0) {
        const aggregate = actualPriceByType.get(type) || { spend: 0, kilograms: 0 };
        aggregate.spend += costGhs(record);
        aggregate.kilograms += amount;
        actualPriceByType.set(type, aggregate);
      }
    });

    return {
      usageThisMonth: sum(thisMonth, amountKg),
      usageLastMonth: sum(lastMonth, amountKg),
      spendThisMonth: sum(thisMonth, costGhs),
      spendLastMonth: sum(lastMonth, costGhs),
      totalUsage: sum(applications, amountKg),
      usageByType: [...usageByType].map(([name, value]) => ({ name, value })).sort((first, second) => second.value - first.value),
      monthlyUsage: monthlyUsage.map(({ key, ...month }) => month),
      actualPriceByType: [...actualPriceByType].map(([name, value]) => ({ name, price: value.spend / value.kilograms * 1000 })).sort((first, second) => second.price - first.price),
    };
  }, [applications]);

  const stats = [
    {
      title: 'Fertilizer Used This Month',
      value: `${dashboardData.usageThisMonth.toFixed(2)} kg`,
      change: formatPercentChange(dashboardData.usageThisMonth, dashboardData.usageLastMonth),
      trend: getTrend(dashboardData.usageThisMonth, dashboardData.usageLastMonth),
      comparisonLabel: 'vs previous month',
      icon: { path: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4', bgColor: 'bg-green-700' },
    },
    {
      title: 'Fertilizer Spending This Month',
      value: formatCedis(dashboardData.spendThisMonth),
      change: formatPercentChange(dashboardData.spendThisMonth, dashboardData.spendLastMonth),
      trend: getTrend(dashboardData.spendThisMonth, dashboardData.spendLastMonth),
      comparisonLabel: 'vs previous month',
      icon: { path: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', bgColor: 'bg-blue-700' },
    },
    {
      title: 'My Registered Farms',
      value: farms.length.toString(),
      change: `${farms.length} linked to your account`,
      trend: 'neutral',
      comparisonLabel: '',
      icon: { path: 'M3 21h18M5 21V7l8-4v18m-8-11h8m-8 4h8m4-7h2m-2 4h2m-2 4h2', bgColor: 'bg-emerald-800' },
    },
    {
      title: 'Counterfeit Alerts',
      value: 'Unavailable',
      change: 'No live alert feed connected',
      trend: 'neutral',
      comparisonLabel: '',
      icon: { path: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 1.732 0 3', bgColor: 'bg-gray-600' },
    },
  ];

  const weatherAdvice = (day) => {
    if (day.rain >= 5) return 'Rain expected. Avoid applying fertilizer before heavy rainfall.';
    if (day.temp >= 32) return 'High heat expected. Apply during cooler hours and monitor soil moisture.';
    return 'No heavy rain or extreme heat expected. Follow your farm soil-test recommendations.';
  };

  return (
    <div className="space-y-6">
      {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
      {loading && <p role="status" className="text-sm text-gray-500">Loading your farm fertilizer statistics…</p>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => <StatsCard key={stat.title} {...stat} />)}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-base font-semibold text-gray-900">Fertilizer Usage by Type</h2>
          {dashboardData.usageByType.length ? <div className="mt-3 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dashboardData.usageByType} cx="50%" cy="48%" outerRadius={90} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {dashboardData.usageByType.map((entry, index) => <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />)}
                </Pie>
                <Tooltip formatter={(value) => [`${Number(value).toFixed(2)} kg`, 'Used']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div> : <EmptyChart loading={loading} text="No fertilizer applications recorded for your farms yet." />}
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-base font-semibold text-gray-900">Monthly Fertilizer Usage</h2>
          <div className="mt-3 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.monthlyUsage} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`${Number(value).toFixed(2)} kg`, 'Usage']} />
                <Legend />
                <Bar dataKey="usage" name="Usage (kg)" fill="#16803c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-base font-semibold text-gray-900">Average Paid Fertilizer Price</h2>
          <p className="mt-1 text-xs text-gray-500">Calculated from your recorded cost and quantity (GH₵/ton).</p>
          {dashboardData.actualPriceByType.length ? <div className="mt-3 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.actualPriceByType} margin={{ top: 8, right: 12, left: 8, bottom: 6 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={125} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => [formatCedis(value), 'Average paid per ton']} />
                <Bar dataKey="price" name="GH₵ per ton" fill="#3478a8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div> : <EmptyChart loading={loading} text="Record an application with its cost to see your paid fertilizer prices." />}
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-base font-semibold text-gray-900">Farm Weather Forecast</h2>
            {farms[0]?.farmName && <span className="text-xs text-gray-500">{farms[0].farmName}</span>}
          </div>
          {forecast.length ? <div className="mt-3 space-y-3">
            {forecast.slice(0, 5).map((day) => (
              <article key={day.date} className="border-l-2 border-blue-500 pl-3 py-1">
                <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
                  <h3 className="text-sm font-semibold text-gray-900">{day.day}, {day.date} · {day.condition}</h3>
                  <span className="text-sm text-gray-700">{day.temp}°C · {day.rain} mm rain</span>
                </div>
                <p className="mt-1 text-xs text-gray-600">{weatherAdvice(day)}</p>
              </article>
            ))}
          </div> : <p className="mt-4 rounded-md bg-gray-50 p-4 text-sm text-gray-600">{weatherMessage || (loading ? 'Loading farm forecast…' : 'Live forecast unavailable.')}</p>}
        </section>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="text-base font-semibold text-gray-900">Counterfeit Alert Map</h2>
        <p className="mt-2 text-sm text-gray-600">A live counterfeit-alert data source is not connected, so this overview does not show a sample alert count. Check verified notices from your regional agricultural authority or supplier regulator.</p>
      </section>
    </div>
  );
};

const EmptyChart = ({ loading, text }) => (
  <div className="mt-3 flex h-[300px] items-center justify-center rounded-md bg-gray-50 px-5 text-center text-sm text-gray-500" role="status">
    {loading ? 'Loading live data…' : text}
  </div>
);

export default Dashboard;