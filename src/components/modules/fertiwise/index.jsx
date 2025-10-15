import React, { useState } from 'react';
import Dashboard from './Dashboard';
import FertilizerRecommendations from './fertilizer/FertilizerRecommendations';
import SoilHealthMonitoring from './soil/SoilHealthMonitoring';
import SupplierMapping from './mapping/SupplierMapping';
import CostBenefitCalculator from './calculator/CostBenefitCalculator';
import FertilizerTracker from './tracker/FertilizerTracker';
import FarmerFeedback from './feedback/FarmerFeedback';
import SubsidyPrograms from './subsidies/SubsidyPrograms';
import { useAuth } from '../../../contexts/AuthContext';
import ExpertConsultation from './expert/ExpertConsultation';

const FertiWise = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', name: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M13 5v6h6m-6 0v6h6' },
    { id: 'recommendations', name: 'Recommendations', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'soil-health', name: 'Soil', icon: 'M12 8c-1.1 0-2 .9-2 2v4h4v-4c0-1.1-.9-2-2-2z' },
    { id: 'supplier-mapping', name: 'Suppliers', icon: 'M3 7l9 4 9-4-9-4-9 4zm0 6l9 4 9-4' },
    { id: 'calculator', name: 'Calculator', icon: 'M7 7h10M7 11h10M7 15h10M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { id: 'tracker', name: 'Tracker', icon: 'M9 17v-2m3 2v-4m3 4v-6M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z' },
    { id: 'feedback', name: 'Feedback', icon: 'M7 8h10M7 12h6m-6 4h4m6 0h2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12l4-4h10a2 2 0 012 2z' },
    { id: 'subsidies', name: 'Programs', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
    { id: 'expert', name: 'Experts', icon: 'M12 12c2.28 0 4-1.72 4-4s-1.72-4-4-4-4 1.72-4 4 1.72 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' },
  ];

  return (
    <div className="h-full">
      {/* Module Header */}
      <div className="bg-white rounded-lg shadow mb-4 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
          <div className="flex items-center space-x-3 mb-2 sm:mb-0">
            <div className="bg-green-600 rounded-full w-10 h-10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">FertiWise</h1>
              <p className="text-gray-600 text-sm sm:text-base">Smart fertilizer management & decision support</p>
            </div>
          </div>
          <span className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
            Active
          </span>
        </div>

        {/* User Role Badge */}
        <div className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 rounded text-xs sm:text-sm font-medium bg-blue-50 text-blue-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {currentUser?.role ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1) : 'Guest'}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow mb-4 sticky top-0 z-10">
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="flex space-x-4 px-4 sm:px-6 min-w-max" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 px-3 py-3 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap
                  ${activeTab === tab.id ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'recommendations' && <FertilizerRecommendations />}
        {activeTab === 'soil-health' && <SoilHealthMonitoring />}
        {activeTab === 'supplier-mapping' && <SupplierMapping />}
        {activeTab === 'calculator' && <CostBenefitCalculator />}
        {activeTab === 'tracker' && <FertilizerTracker />}
        {activeTab === 'feedback' && <FarmerFeedback />}
        {activeTab === 'subsidies' && <SubsidyPrograms />}
        {activeTab === 'expert' && <ExpertConsultation/> }
      </div>
    </div>
  );
};

export default FertiWise;
