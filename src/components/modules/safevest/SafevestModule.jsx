import React, { useState, Suspense, lazy } from 'react';
import { useAuth } from  "../../../contexts/AuthContext"


// Lazy load tabs
const SafeVestOverview = lazy(() => import('./dashboard/Dashboard'));
const FarmPitches = lazy(() => import('./farmPitches/FarmPitches'));
const InvestorDirectory = lazy(() => import('./investors/InvestorDirectory'));
const FinancialDirectory = lazy(() => import('./financial/FinancialDirectory'));
const MicroInsurance = lazy(() => import('./insurance/MicroInsurance'));
const FarmGuards = lazy(() => import('./guards/FarmGuards'));
const RiskAlerts = lazy(() => import('./alerts/RiskAlerts'));
const CrowdfundingDashboard = lazy(() => import('./crowdfunding/CrowdfundingDashboard'));
const BankSafeVestDashboard = lazy(() => import('./BankSafeVestDashboard'));

const SafeVest = () => {
  const { currentUser, updateCredits } = useAuth();
  const userCredits = currentUser?.credits ?? 0;

  // Wrapper for credit deduction with alert for insufficiency
  const useCredits = (amount) => {
    if (userCredits < amount) {
      alert('Insufficient credits!');
      return false;
    }
    updateCredits(userCredits - amount);
    return true;
  };

  const [activeTab, setActiveTab] = useState('overview');

  if (currentUser?.role === 'bank') {
    return (
      <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
        <BankSafeVestDashboard onNotice={(message) => window.alert(message)} />
      </Suspense>
    );
  }

  // Render tab content and pass userCredits & useCredits to tabs that need them
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <SafeVestOverview />;

      case 'farmpitches':
        return <FarmPitches userCredits={userCredits} useCredits={useCredits} />;

      case 'investor':
        return <InvestorDirectory userCredits={userCredits} useCredits={useCredits} />;

      case 'finance':
        return <FinancialDirectory />;

      case 'insurance':
        return <MicroInsurance />;

      case 'guards':
        return <FarmGuards />;

      case 'crowdfunding':
        return <CrowdfundingDashboard userCredits={userCredits} useCredits={useCredits} />;

      case 'risks':
        return <RiskAlerts />;

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow mb-6 p-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-orange-500 rounded-full w-10 h-10 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">SafeVest</h1>
            <p className="text-gray-600">Access finance & risk support for agricultural success</p>
          </div>
        </div>

        {/* Show user credits here */}
        <div className="text-sm font-medium text-gray-700">
          Credits: <span className="text-green-600">{userCredits}</span>
        </div>
      </div>

      {/* Tab Navigation with accessibility */}
      <div className="border-b border-gray-200" role="tablist" aria-label="SafeVest Sections">
        <nav className="-mb-px flex space-x-8 overflow-x-auto pb-1">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'farmpitches', label: 'Farm Pitches' },
            { id: 'investor', label: 'Investor Directory' },
            { id: 'finance', label: 'Financial Directory' },
            { id: 'insurance', label: 'MicroInsurance' },
            { id: 'guards', label: 'Farm Guards' },
            { id: 'crowdfunding', label: 'Crowdfunding' },
            { id: 'risks', label: 'Risk Alerts' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              role="tab"
              aria-selected={activeTab === id}
              aria-controls={`tabpanel-${id}`}
              id={`tab-${id}`}
              tabIndex={activeTab === id ? 0 : -1}
              className={`${
                activeTab === id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content with aria attributes and Suspense */}
      <div
        id={`tabpanel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        className="pb-10"
      >
        <Suspense fallback={<div className="text-center p-4">Loading...</div>}>
          {renderTabContent()}
        </Suspense>
      </div>
    </div>
  );
};

export default SafeVest;
