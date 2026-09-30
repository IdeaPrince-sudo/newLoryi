import React, { useState } from 'react';
import OverviewDashboard from './dashboards/OverviewDashboard';
import ExpenseDashboard from './dashboards/ExpenseDashboard';
import IncomeDashboard from './dashboards/IncomeDashboard';
import TaskDashboard from './dashboards/TaskDashboard';
import TreatmentDashboard from './dashboards/TreatmentDashboard';
import ActivityDashboard from './dashboards/ActivityDashboard';
import ReportDashboard from './dashboards/ReportDashboard';
import BankSupplyChainDashboard from './BankSupplyChainDashboard';
import { useAuth } from '../../../contexts/AuthContext';
import { AgriTrackProvider } from './AgriTrackContext';

const AgriTrack = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  if (currentUser?.role === 'bank') {
    return <BankSupplyChainDashboard />;
  }
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewDashboard />;
      case 'expenses':
        return <ExpenseDashboard />;
      case 'income':
        return <IncomeDashboard />;
      case 'tasks':
        return <TaskDashboard />;
      case 'treatments':
        return <TreatmentDashboard />;
      case 'activities':
        return <ActivityDashboard />;
      case 'reports':
        return <ReportDashboard />;
      default:
        return <OverviewDashboard />;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-500 rounded-full w-10 h-10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">AgriTrack</h1>
              <p className="text-gray-600">Manage Expenses, Incomes and Profit & Lost</p>
            </div>
          </div>
          <div className="flex items-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
              Active
            </span>
          </div>
        </div>
        
     
      </div>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`${
              activeTab === 'overview'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`${
              activeTab === 'expenses'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Expenses
          </button>
          <button
            onClick={() => setActiveTab('income')}
            className={`${
              activeTab === 'income'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Income
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`${
              activeTab === 'tasks'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Tasks
          </button>
          <button
            onClick={() => setActiveTab('treatments')}
            className={`${
              activeTab === 'treatments'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Treatments
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`${
              activeTab === 'activities'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Activities
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`${
              activeTab === 'reports'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Reports
          </button>
        </nav>
      </div>
      
      {/* Tab Content */}
      <div className="pb-10">
        <AgriTrackProvider>{renderTabContent()}</AgriTrackProvider>
      </div>
    </div>
  );
};

export default AgriTrack;