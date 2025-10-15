import React, { useState } from 'react';

function RiskAlerts() {
  const [alertPreferences, setAlertPreferences] = useState({
    weather: true,
    pests: true,
    disease: true,
    market: true,
    sms: true,
    email: false,
    app: true
  });
  
  // Sample active alerts data
  const activeAlerts = [
    {
      id: 1,
      type: "Weather",
      severity: "High",
      title: "Heavy Rainfall Warning",
      description: "Expect heavy rainfall in the Eastern region over the next 72 hours. Potential for flooding in low-lying areas.",
      date: "2025-07-25",
      time: "08:30",
      regions: ["Eastern Region", "Central Highlands"],
      icon: "🌧️"
    },
    {
      id: 2,
      type: "Pest",
      severity: "Medium",
      title: "Locust Swarm Alert",
      description: "Locust swarms spotted moving towards the Northern farming districts. Expected to arrive within 48 hours.",
      date: "2025-07-24",
      time: "14:15",
      regions: ["Northern Province", "Northwestern Areas"],
      icon: "🦗"
    },
    {
      id: 3,
      type: "Market",
      severity: "Low",
      title: "Corn Price Increase",
      description: "Market analysts predict corn prices will rise by 15% next week due to supply chain disruptions.",
      date: "2025-07-23",
      time: "10:45",
      regions: ["All Regions"],
      icon: "📈"
    },
    {
      id: 4,
      type: "Disease",
      severity: "Medium",
      title: "Wheat Rust Outbreak",
      description: "Cases of wheat rust reported in several farms in the Western region. Check crops for symptoms.",
      date: "2025-07-22",
      time: "16:20",
      regions: ["Western District", "Southern Plains"],
      icon: "🦠"
    }
  ];

  // Sample historical alerts
  const historicalAlerts = [
    {
      id: 101,
      type: "Weather",
      severity: "High",
      title: "Drought Warning",
      description: "Extended drought conditions expected over the next 30 days in the Southern region.",
      date: "2025-07-10",
      regions: ["Southern Plains", "Dry Valley"]
    },
    {
      id: 102,
      type: "Pest",
      severity: "High",
      title: "Armyworm Infestation",
      description: "Severe armyworm infestation reported in maize crops across Central region.",
      date: "2025-07-05",
      regions: ["Central Region", "Midland Plains"]
    },
    {
      id: 103,
      type: "Market",
      severity: "Low",
      title: "Rice Export Restrictions",
      description: "Government announces temporary export restrictions on rice, potentially affecting prices.",
      date: "2025-06-28",
      regions: ["All Regions"]
    }
  ];

  // Toggle alert preferences
  const toggleAlertPreference = (preference) => {
    setAlertPreferences(prev => ({
      ...prev,
      [preference]: !prev[preference]
    }));
  };

  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="risk-alerts space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Risk Alerts</h1>
        <p className="text-gray-600">Real-time alerts for climate risks, pests, diseases, and market changes</p>
      </div>

      {/* Alert summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border-l-4 border-red-500 shadow-sm">
          <p className="text-sm text-gray-500">Weather Alerts</p>
          <p className="text-xl font-semibold">1 Active</p>
        </div>
        <div className="bg-white p-4 rounded-lg border-l-4 border-orange-500 shadow-sm">
          <p className="text-sm text-gray-500">Pest Alerts</p>
          <p className="text-xl font-semibold">1 Active</p>
        </div>
        <div className="bg-white p-4 rounded-lg border-l-4 border-yellow-500 shadow-sm">
          <p className="text-sm text-gray-500">Disease Alerts</p>
          <p className="text-xl font-semibold">1 Active</p>
        </div>
        <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500 shadow-sm">
          <p className="text-sm text-gray-500">Market Alerts</p>
          <p className="text-xl font-semibold">1 Active</p>
        </div>
      </div>

      {/* Alert preferences */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Alert Preferences</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-700 mb-3">Alert Types</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="weather"
                  checked={alertPreferences.weather}
                  onChange={() => toggleAlertPreference('weather')}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="weather" className="ml-3 text-sm text-gray-700">Weather Alerts</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="pests"
                  checked={alertPreferences.pests}
                  onChange={() => toggleAlertPreference('pests')}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="pests" className="ml-3 text-sm text-gray-700">Pest Alerts</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="disease"
                  checked={alertPreferences.disease}
                  onChange={() => toggleAlertPreference('disease')}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="disease" className="ml-3 text-sm text-gray-700">Disease Alerts</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="market"
                  checked={alertPreferences.market}
                  onChange={() => toggleAlertPreference('market')}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="market" className="ml-3 text-sm text-gray-700">Market Alerts</label>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-700 mb-3">Notification Methods</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sms"
                  checked={alertPreferences.sms}
                  onChange={() => toggleAlertPreference('sms')}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="sms" className="ml-3 text-sm text-gray-700">SMS Notifications</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="email"
                  checked={alertPreferences.email}
                  onChange={() => toggleAlertPreference('email')}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="email" className="ml-3 text-sm text-gray-700">Email Notifications</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="app"
                  checked={alertPreferences.app}
                  onChange={() => toggleAlertPreference('app')}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="app" className="ml-3 text-sm text-gray-700">In-App Notifications</label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center">
            <label htmlFor="regions" className="block text-sm font-medium text-gray-700 mr-3">Your Regions</label>
            <select id="regions" className="flex-1 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm text-sm">
              <option value="eastern">Eastern Region</option>
              <option value="western">Western District</option>
              <option value="northern">Northern Province</option>
              <option value="southern">Southern Plains</option>
              <option value="central">Central Region</option>
            </select>
            <button className="ml-3 bg-green-100 text-green-700 px-3 py-2 rounded-md text-sm">
              Add Region
            </button>
          </div>
          
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-md flex items-center">
              Eastern Region
              <button className="ml-2 text-green-500 hover:text-green-700">✕</button>
            </span>
            <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-md flex items-center">
              Western District
              <button className="ml-2 text-green-500 hover:text-green-700">✕</button>
            </span>
          </div>
        </div>
        
        <div className="mt-6">
          <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md">
            Save Preferences
          </button>
        </div>
      </div>

      {/* Active alerts */}
      <div>
        <h2 className="text-lg font-medium text-gray-800 mb-3">Active Alerts</h2>
        <div className="space-y-4">
          {activeAlerts.map(alert => (
            <div key={alert.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{alert.icon}</span>
                    <div>
                      <div className="flex items-center">
                        <span className={`${getSeverityColor(alert.severity)} text-xs font-medium px-2.5 py-0.5 rounded mr-2`}>
                          {alert.severity}
                        </span>
                        <h3 className="text-lg font-medium text-gray-800">{alert.title}</h3>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {alert.date} • {alert.time} • {alert.type}
                      </p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                  </button>
                </div>
                
                <p className="mt-3 text-gray-700">{alert.description}</p>
                
                <div className="mt-3 flex flex-wrap gap-1">
                  {alert.regions.map((region, index) => (
                    <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded">
                      {region}
                    </span>
                  ))}
                </div>
                
                <div className="mt-4 flex justify-between">
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    View Details
                  </button>
                  <button className="text-sm text-green-600 hover:text-green-800">
                    Mark as Read
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historical alerts */}
      <div>
        <h2 className="text-lg font-medium text-gray-800 mb-3">Historical Alerts</h2>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Regions
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {historicalAlerts.map(alert => (
                <tr key={alert.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {alert.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {alert.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`${getSeverityColor(alert.severity)} text-xs font-medium px-2.5 py-0.5 rounded`}>
                      {alert.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {alert.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {alert.regions.join(', ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-6 py-3 flex justify-between items-center bg-gray-50">
            <span className="text-sm text-gray-700">
              Showing 3 of 24 alerts
            </span>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm">
                Previous
              </button>
              <button className="px-3 py-1 border border-gray-300 bg-blue-50 text-blue-600 rounded-md text-sm">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RiskAlerts;