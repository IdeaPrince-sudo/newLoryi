import React from 'react';
import StatsCard from './StatsCard';
import AreaChartComponent from './charts/AreaChart';
import LineChartComponent from './charts/LineChart';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { currentUser, canAccessModule } = useAuth();

  if (!currentUser) {
    return <div className="text-center p-6">Please log in to access your dashboard.</div>;
  }

  // ✅ All modules
  const allModules = [
    { name: 'GeoSense', path: '/geosense', description: 'Soil health analysis and recommendations', color: 'bg-emerald-500', icon: 'M9 20l-5.447-2.724...' },
    { name: 'FertiWise', path: '/fertiwise', description: 'Fertilizer management and optimization', color: 'bg-teal-500', icon: 'M12 4v16m8-8H4' },
    { name: 'SeedLin', path: '/seedlin', description: 'Seed selection and planting guide', color: 'bg-indigo-500', icon: 'M5 12h14M12 5l7 7-7 7' },
    { name: 'DiagnoX', path: '/diagnox', description: 'AI crop disease & pest identification', color: 'bg-orange-500', icon: 'M9 17v-2m3 2v-4...' },
    { name: 'FarmIQ', path: '/farmiq', description: 'Farm data intelligence and analytics', color: 'bg-pink-500', icon: 'M3 3h18v18H3z' },
    { name: 'Predicto', path: '/predicto', description: 'Weather forecasting & climate alerts', color: 'bg-blue-500', icon: 'M3 15a4 4 0 004 4h9...' },
    { name: 'Terra Q', path: '/terraq', description: 'Land quality & terrain monitoring', color: 'bg-yellow-500', icon: 'M5 3l7 7-7 7' },
    { name: 'SafeVest', path: '/safevest', description: 'Investments & insurance for farms', color: 'bg-red-500', icon: 'M12 6v6l4 2' },
    { name: 'AgroMart', path: '/agromart', description: 'Marketplace for tools and produce', color: 'bg-purple-500', icon: 'M3 3h2l.4 2M7 13h10...' },
    { name: 'UpdateX', path: '/updatex', description: 'Agricultural news and updates', color: 'bg-gray-500', icon: 'M5 13l4 4L19 7' },
    { name: 'AgriTrack', path: '/agritrack', description: 'Supply chain and logistics tracking', color: 'bg-lime-500', icon: 'M12 8v8m-4-4h8' },
  ];

  // ✅ Filter only modules user can access
  const userModules = allModules.filter((mod) => currentUser.modules.includes(mod.name));

  // ✅ Role-based message
  const getRoleMessage = () => {
    if (currentUser.role === 'farmer') return "Here's what's happening with your farm today.";
    if (currentUser.role === 'investor') return "Track your investments and discover new farm opportunities.";
    if (currentUser.role.includes('financial') || currentUser.role.includes('insurance') || currentUser.role.includes('security'))
      return "Monitor policies, financial products, and security operations.";
    if (currentUser.role === 'admin') return "Manage users, modules, and platform settings.";
    return "Access your available modules below.";
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-semibold text-gray-900">Welcome back, {currentUser.name}!</h1>
        <p className="mt-1 text-gray-600">{getRoleMessage()}</p>
      </div>

      {/* ✅ FARMER STATS & CHARTS */}
      {currentUser.role === 'farmer' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard title="Soil Moisture" value="68%" change={2.5} changeType="increase" changeText="from yesterday" iconBg="bg-blue-100" iconColor="text-blue-600" />
            <StatsCard title="Crop Health" value="92%" change={-1.4} changeType="decrease" changeText="from last week" iconBg="bg-green-100" iconColor="text-green-600" />
            <StatsCard title="Yield Forecast" value="4.3 tons/acre" change={5.2} changeType="increase" changeText="from last season" iconBg="bg-yellow-100" iconColor="text-yellow-600" />
            <StatsCard title="Market Price" value="$432/ton" change={12.3} changeType="increase" changeText="from last month" iconBg="bg-purple-100" iconColor="text-purple-600" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Revenue & Profit Trends</h2>
              <AreaChartComponent />
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">7-Day Weather Forecast</h2>
              <LineChartComponent />
            </div>
          </div>
        </>
      )}

      {/* ✅ INVESTOR STATS */}
      {currentUser.role === 'investor' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatsCard title="Active Investments" value="12" change={3.4} changeType="increase" changeText="this month" iconBg="bg-blue-100" iconColor="text-blue-600" />
          <StatsCard title="ROI (%)" value="18.7%" change={1.2} changeType="increase" changeText="last quarter" iconBg="bg-green-100" iconColor="text-green-600" />
          <StatsCard title="Pending Pitches" value="5" change={-0.8} changeType="decrease" changeText="since last week" iconBg="bg-yellow-100" iconColor="text-yellow-600" />
        </div>
      )}

      {/* ✅ PROVIDER STATS & CHARTS */}
      {(currentUser.role.includes('financial') || currentUser.role.includes('insurance') || currentUser.role.includes('security')) && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatsCard title="Active Policies" value="45" change={2.1} changeType="increase" changeText="this month" iconBg="bg-green-100" iconColor="text-green-600" />
            <StatsCard title="Claims Processed" value="120" change={-1.5} changeType="decrease" changeText="since last week" iconBg="bg-blue-100" iconColor="text-blue-600" />
            <StatsCard title="Security Requests" value="14" change={0.9} changeType="increase" changeText="last 7 days" iconBg="bg-red-100" iconColor="text-red-600" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Claims Trend</h2>
              <AreaChartComponent />
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Policy Distribution</h2>
              <LineChartComponent />
            </div>
          </div>
        </>
      )}

      {/* ✅ QUICK ACCESS */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {userModules.map((module) => (
            <Link
              key={module.name}
              to={canAccessModule(module.name) ? module.path : '#'}
              onClick={(e) => !canAccessModule(module.name) && e.preventDefault()}
              className={`block p-6 rounded-lg transition-all ${
                canAccessModule(module.name)
                  ? 'border border-gray-200 hover:shadow-md'
                  : 'border border-gray-200 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className={`${module.color} rounded-full w-12 h-12 flex items-center justify-center mb-4`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={module.icon} />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">{module.name}</h3>
              <p className="text-sm text-gray-600">{module.description}</p>
            </Link>
          ))}
          
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
