import React, { useState } from 'react';
import FarmDashboard from './FarmDashboard';
import NewProject from './NewProject';
import ProjectList from './ProjectList';
import SoilAnalysis from './SoilAnalysis';
import ResourceManagement from './ResourceManagement';
import FarmHistory from './FarmHistory';
import ROICalculator from './ROICalculator';


const FarmIQ = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <FarmDashboard />;
      case 'new-project':
        return <NewProject />;
      case 'crop-management':
        return <ProjectList />;
      case 'soil-data':
        return <SoilAnalysis />;
      case 'resources':
        return <ResourceManagement />;
      case 'history':
        return <FarmHistory />;
      case 'roi-calculator':
        return <ROICalculator />;
      default:
        return <FarmDashboard />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">FarmIQ</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your farm operations and monitor performance
          </p>
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            Export Data
          </button>
          <button className="px-4 py-2 bg-green-600 rounded-md text-sm font-medium text-white hover:bg-green-700">
            Generate Report
          </button>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow-sm rounded-lg">
        <div className="overflow-x-auto">
          <nav className="flex">
            <button
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'dashboard' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('dashboard')}
            >
              Overview
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'new-project' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('new-project')}
            >
              New Project
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'crop-management' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('crop-management')}
            >
              My Projects
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'roi-calculator' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('roi-calculator')}
            >
              ROI Calculator
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'soil-data' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('soil-data')}
            >
              
              Soil Analysis
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'resources' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('resources')}
            >
              Resources
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'history' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('history')}
            >
              History
            </button>
           
          </nav>
        </div>
      </div>

      <div className="p-1">
        {renderContent()}
      </div>
    </div>
  );
};

export default FarmIQ;