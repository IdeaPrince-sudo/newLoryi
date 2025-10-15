import React from 'react';
import StatsCard from '../StatsCard';
import FinanceChart from '../charts/FinanceChart';
import CropPerformanceChart from '../charts/CropPerformanceChart';
import TaskList from '../TaskList';
import ActivityLogList from '../ActivityLogList';
import { farmStats } from '../../agritrack/farmData';

const OverviewDashboard = () => {
  return (
    <div className="space-y-6">
     
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {farmStats.map((stat, index) => (
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
      
      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Revenue vs Expenses</h2>
          <FinanceChart />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Crop Performance</h2>
          <CropPerformanceChart />
        </div>
      </div>
      
      {/* Upcoming Tasks */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-800">Upcoming Tasks</h2>
          <button className="text-sm font-medium text-green-600 hover:text-green-700">View All</button>
        </div>
        <TaskList limit={3} />
      </div>
      
      {/* Recent Activities */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-800">Recent Activities</h2>
          <button className="text-sm font-medium text-green-600 hover:text-green-700">View All</button>
        </div>
        <ActivityLogList limit={3} />
      </div>
    </div>
  );
};

export default OverviewDashboard;