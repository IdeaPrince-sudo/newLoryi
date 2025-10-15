import React from 'react';
import { PieChart, BarChart, AreaChart, LineChart, ResponsiveContainer, Pie, Cell, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, Line } from 'recharts';
import StatsCard from './StatsCard';
import { fertilizerPrices, weatherForecast, counterfeitReports, fertilizerHistory } from './fertiWiseData';

// Calculate totals from fertilizer history
const totalFertilizerUsed = fertilizerHistory.reduce((acc, record) => {
  const amountNum = parseFloat(record.amount.replace(/[^\d.-]/g, ''));
  return acc + amountNum;
}, 0);

const totalCost = fertilizerHistory.reduce((acc, record) => acc + record.cost, 0);

const uniqueFarmers = [...new Set(fertilizerHistory.map(record => record.farmerId))].length;

// Stats for dashboard
const dashboardStats = [
  {
    title: 'Total Fertilizer Used',
    value: `${totalFertilizerUsed} kg`,
    change: '+5.2%',
    trend: 'up',
    icon: {
      path: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4',
      bgColor: 'bg-green-500'
    }
  },
  {
    title: 'Fertilizer Spending',
    value: `$${totalCost}`,
    change: '-2.1%',
    trend: 'down',
    icon: {
      path: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      bgColor: 'bg-blue-500'
    }
  },
  {
    title: 'Active Farmers',
    value: uniqueFarmers.toString(),
    change: '+12.5%',
    trend: 'up',
    icon: {
      path: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      bgColor: 'bg-purple-500'
    }
  },
  {
    title: 'Counterfeit Alerts',
    value: counterfeitReports.length.toString(),
    change: '-8.3%',
    trend: 'down',
    icon: {
      path: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      bgColor: 'bg-red-500'
    }
  }
];

// Process data for charts
const fertilizerTypeData = fertilizerHistory.reduce((acc, record) => {
  const existingTypeIndex = acc.findIndex(item => item.name === record.fertilizerType);
  if (existingTypeIndex >= 0) {
    acc[existingTypeIndex].value += 1;
  } else {
    acc.push({ name: record.fertilizerType, value: 1 });
  }
  return acc;
}, []);

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Monthly fertilizer usage data
const monthlyUsageData = [
  { month: 'Jan', usage: 120 },
  { month: 'Feb', usage: 150 },
  { month: 'Mar', usage: 200 },
  { month: 'Apr', usage: 180 },
  { month: 'May', usage: 220 },
  { month: 'Jun', usage: 250 }
];

// Price trend data
const priceTrendData = fertilizerPrices.map(item => ({
  name: item.name,
  price: item.price,
  trend: item.trend === 'increasing' ? 1 : item.trend === 'decreasing' ? -1 : 0
}));

const Dashboard = () => {
  return (
    <div className="space-y-6">
   
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <StatsCard 
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            trend={stat.trend}
            icon={stat.icon}
          />
        ))}
      </div>
      
      {/* Charts - First Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Fertilizer Usage by Type</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={fertilizerTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {fertilizerTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Monthly Fertilizer Usage</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={monthlyUsageData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="usage" name="Usage (kg)" fill="#00C49F" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Charts - Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Fertilizer Price Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={priceTrendData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" />
              <Tooltip formatter={(value) => [`$${value} per ton`]} />
              <Bar dataKey="price" name="Price (USD/ton)" fill="#8884d8">
                {priceTrendData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.trend > 0 ? '#EF4444' : entry.trend < 0 ? '#10B981' : '#6B7280'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Seasonal Weather Forecast</h2>
          <div className="space-y-4">
            {weatherForecast.map((forecast, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                <h3 className="font-medium">{forecast.month}</h3>
                <div className="text-sm text-gray-600 mt-1">
                  <div className="flex justify-between">
                    <span>Temp: {forecast.avgTemperature}°C</span>
                    <span>Rainfall: {forecast.rainfall}</span>
                    <span>Humidity: {forecast.humidity}%</span>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">Recommendation:</p>
                    <p className="font-medium">{forecast.recommendedFertilizerAdjustments}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Counterfeit Alert Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Counterfeit Alert Map</h2>
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-center text-gray-700 mb-2">
            There are currently <span className="font-bold text-red-600">{counterfeitReports.length}</span> active counterfeit alerts in your region.
          </p>
          <p className="text-center text-sm text-gray-600">
            View detailed reports and locations in the Supplier Mapping section.
          </p>
          <div className="mt-3 text-center">
            <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
              View Alerts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;