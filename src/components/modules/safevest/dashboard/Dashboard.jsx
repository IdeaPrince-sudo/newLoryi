import React from 'react';
import { useAuth } from  "../../../../contexts/AuthContext"

function SafeVestOverview() {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <div className="text-center p-6">Please log in to access SafeVest.</div>;
  }

  // Helper: Check if user can access a module
  const canAccess = (module) => currentUser.modules.includes(module);

  // Define role-based stats with access checks (show stats only for accessible modules)
  const roleStatsMap = {
    farmer: [
      { label: 'Available Credits', value: currentUser.credits, icon: '💎' },
      canAccess('SafeVest') && { label: 'Insurance Policies', value: '2', icon: '🛡️' },
      canAccess('SafeVest') && { label: 'Active Guards', value: '1', icon: '👮‍♂️' },
      { label: 'Pending Claims', value: '1', icon: '📄' },
    ],
    investor: [
      { label: 'Available Credits', value: currentUser.credits, icon: '💰' },
      canAccess('FarmIQ') && { label: 'Farm Pitches', value: '3', icon: '🌱' },
      canAccess('AgroMart') && { label: 'Investments', value: '24', icon: '💼' },
      { label: 'ROI (%)', value: '18.7%', icon: '📈' },
    ],
    'financial, insurance, security': [
      { label: 'Active Policies', value: '45', icon: '🛡️' },
      { label: 'Claims Pending', value: '8', icon: '📄' },
      { label: 'Policies Expiring Soon', value: '5', icon: '⏳' },
      { label: 'Available Credits', value: currentUser.credits, icon: '💎' },
    ],
    buyer: [
      { label: 'Available Credits', value: currentUser.credits, icon: '💎' },
      { label: 'Requests Posted', value: '12', icon: '🛒' },
      { label: 'Active Orders', value: '4', icon: '📦' },
      { label: 'Pending Payments', value: '2', icon: '💳' },
    ],
    store: [
      { label: 'Available Credits', value: currentUser.credits, icon: '💎' },
      { label: 'Products Listed', value: '150', icon: '📦' },
      { label: 'Sales This Month', value: '$12,300', icon: '💰' },
      { label: 'Pending Shipments', value: '5', icon: '🚚' },
    ],
    admin: [
      { label: 'Total Users', value: '2500', icon: '👥' },
      { label: 'Active Modules', value: currentUser.modules.length, icon: '🧩' },
      { label: 'Available Credits', value: currentUser.credits, icon: '💎' },
      { label: 'System Alerts', value: '3', icon: '⚠️' },
    ],
  };

  const stats = roleStatsMap[currentUser.role] || [
    { label: 'Available Credits', value: currentUser.credits, icon: '💎' },
  ];

  // Filter out any false/null (from conditional entries)
  const filteredStats = stats.filter(Boolean);

  // Define role-based quick access buttons, filtered by accessible modules if needed
  const roleQuickAccessMap = {
    farmer: [
      { label: 'Request Insurance', icon: '🛡️', module: 'SafeVest' },
      { label: 'Request Farm Guard', icon: '👮‍♀️', module: 'SafeVest' },
      { label: 'Manage Wallet', icon: '💰' },
      { label: 'View Risk Alerts', icon: '⚠️' },
    ],
    investor: [
      { label: 'Create Farm Pitch', icon: '📝', module: 'FarmIQ' },
      { label: 'Find Investors', icon: '🔎', module: 'AgroMart' },
      { label: 'Manage Wallet', icon: '💰' },
      { label: 'View Risk Alerts', icon: '⚠️' },
    ],
    'financial, insurance, security': [
      { label: 'Manage Policies', icon: '📑' },
      { label: 'Review Claims', icon: '📄' },
      { label: 'Add Insurance Product', icon: '➕' },
      { label: 'View Risk Alerts', icon: '⚠️' },
    ],
    buyer: [
      { label: 'Post Request', icon: '🛒' },
      { label: 'View Offers', icon: '📄' },
      { label: 'Manage Wallet', icon: '💰' },
    ],
    store: [
      { label: 'Add Product', icon: '➕' },
      { label: 'Manage Inventory', icon: '📦' },
      { label: 'View Sales', icon: '💰' },
    ],
    admin: [
      { label: 'Manage Users', icon: '👥' },
      { label: 'Manage Modules', icon: '🧩' },
      { label: 'System Settings', icon: '⚙️' },
      { label: 'View Logs', icon: '📜' },
    ],
  };

  // Filter quick access based on accessible modules (if module key defined)
  const quickAccessRaw = roleQuickAccessMap[currentUser.role] || [];
  const quickAccess = quickAccessRaw.filter(
    (action) => !action.module || canAccess(action.module)
  );

  // Common recent alerts (can be made role-specific later)
  const recentAlerts = [
    { id: 1, type: 'Weather', message: 'Heavy rainfall predicted in Northern region', date: '2025-07-24' },
    { id: 2, type: 'Pest', message: 'Locust swarm warning in Eastern districts', date: '2025-07-23' },
    { id: 3, type: 'Market', message: 'Corn prices expected to rise next week', date: '2025-07-22' },
  ];

  return (
    <div className="dashboard space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredStats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-semibold text-gray-800 mt-1">{stat.value}</p>
              </div>
              <div className="text-2xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Access */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Access</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {quickAccess.map((action, i) => (
            <QuickAccessButton key={i} label={action.label} icon={action.icon} />
          ))}
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Alerts</h2>
        <div className="space-y-4">
          {recentAlerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start p-3 border-l-4 border-yellow-400 bg-yellow-50 rounded-r-md"
            >
              <div className="mr-3 text-yellow-500 font-bold">{alert.type}</div>
              <div>
                <p className="text-gray-700">{alert.message}</p>
                <p className="text-xs text-gray-500 mt-1">{alert.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuickAccessButton({ label, icon }) {
  return (
    <button className="flex flex-col items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
      <span className="text-2xl mb-2">{icon}</span>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </button>
  );
}

export default SafeVestOverview;
