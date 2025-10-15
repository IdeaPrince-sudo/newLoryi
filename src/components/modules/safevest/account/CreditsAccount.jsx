import React, { useState } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';

function CreditsAccount() {
  const { currentUser, updateCredits } = useAuth();
  const [activeTab, setActiveTab] = useState('credits');
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || 'John Farmer',
    email: currentUser?.email || 'john.farmer@example.com',
    phone: '+123-456-7890',
    farmName: 'Green Valley Farm',
    location: 'Eastern Region',
    farmSize: '15',
    farmType: 'Mixed Crops & Livestock',
    profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
  });
  const [redemptionCode, setRedemptionCode] = useState('');
  const [redemptionMessage, setRedemptionMessage] = useState('');

  const creditsHistory = [
    { id: 1, action: 'Purchased Credits', amount: 50, date: '2025-07-20', balance: 50 },
    { id: 2, action: 'Investor Profile View', amount: -5, date: '2025-07-18', balance: 0 },
    { id: 3, action: 'Free Sign-up Bonus', amount: 10, date: '2025-07-15', balance: 5 },
    { id: 4, action: 'Investor Contact', amount: -10, date: '2025-07-12', balance: 5 },
    { id: 5, action: 'Monthly Reward', amount: 15, date: '2025-07-01', balance: 15 },
  ];

  const creditPackages = [
    { id: 1, amount: 50, price: 5, popular: false },
    { id: 2, amount: 100, price: 9, popular: true },
    { id: 3, amount: 200, price: 16, popular: false },
    { id: 4, amount: 500, price: 35, popular: false },
  ];

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    alert('Profile updated successfully!');
  };

  const handleBuyCredits = (amount, price) => {
    alert(`You've purchased ${amount} credits for $${price}`);
    if (updateCredits) {
      updateCredits(amount);
    }
  };

  const handleRedemptionChange = (e) => {
    setRedemptionCode(e.target.value);
  };

  const handleRedeemCredits = () => {
    if (redemptionCode.trim().toUpperCase() === 'LORYIAI100') {
      updateCredits(100);
      setRedemptionMessage('Success! 100 credits have been added to your account.');
      setRedemptionCode('');
    } else {
      setRedemptionMessage('Invalid redemption code. Please try again or contact support.');
    }
  };

  return (
    <div className="credits-account space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Account</h1>
        <p className="text-gray-600">Manage your profile and credits</p>
      </div>

      {/* Credits summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Available Credits</p>
            <p className="text-3xl font-bold text-gray-800">{currentUser?.credits ?? 0}</p>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={() => setActiveTab('credits')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
              Buy Credits
            </button>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-700">
            Credits are used to access premium features like contacting investors or accessing financial institution details.
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-6">
          {['credits', 'profile', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 border-b-2 text-sm font-medium ${
                activeTab === tab
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Credits Tab */}
      {activeTab === 'credits' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Credits History */}
          <div className="md:col-span-2">
            <h2 className="text-lg font-medium text-gray-800 mb-3">Credits History</h2>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Date', 'Action', 'Amount', 'Balance'].map((head) => (
                      <th
                        key={head}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {creditsHistory.map((record) => (
                    <tr key={record.id}>
                      <td className="px-6 py-4 text-sm text-gray-500">{record.date}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{record.action}</td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <span className={record.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                          {record.amount > 0 ? '+' : ''}
                          {record.amount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{record.balance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-6 py-3 bg-gray-50 text-right text-sm">
                <button className="text-blue-600 hover:text-blue-800">View All History</button>
              </div>
            </div>

            {/* Credit Redemption */}
            <div className="mt-8 bg-yellow-50 p-6 rounded-lg border border-yellow-300">
              <h3 className="text-xl font-semibold text-yellow-800 mb-4">Credit Redemption</h3>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Enter code..."
                  value={redemptionCode}
                  onChange={handleRedemptionChange}
                  className="w-full px-4 py-2 border border-yellow-400 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <button
                onClick={handleRedeemCredits}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-5 py-2 rounded-md mb-4"
              >
                Redeem
              </button>
              {redemptionMessage && (
                <p className="text-sm font-medium text-yellow-900 mb-4">{redemptionMessage}</p>
              )}

              <p className="text-sm text-yellow-700 mb-2">
                The redeemed Credit is valid only within your plan usage period and will be cleared upon expiration
              </p>

              <h4 className="font-semibold text-yellow-800 mb-2">Join our activities and win more Credits</h4>

              <p className="mb-3 text-yellow-700">
                Show us your ✨ creativity with Loryi AI and win a valuable prize package 🎁 worth $70. We can't wait to see what you create with Loryi AI.
              </p>

              <h5 className="font-semibold text-yellow-800 mb-1">How to Participate:</h5>
              <ol className="list-decimal list-inside space-y-1 text-yellow-700">
                <li>Create an impressive creation using Loryi AI and share to App World</li>
                <li>Quote our official tweet with a screenshot of your creation and the app link</li>
                <li>Send the link to your quote tweet to our official email: <a href="mailto:service@loryiapp.ai" className="underline">service@loryiapp.ai</a></li>
                <li>We pick the top 10 winners every Monday — each will receive a $70 prize package</li>
              </ol>
            </div>
          </div>

          {/* Buy Credits */}
          <div>
            <h2 className="text-lg font-medium text-gray-800 mb-3">Buy Credits</h2>
            <div className="space-y-3">
              {creditPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`bg-white border ${
                    pkg.popular ? 'border-green-300 ring-1 ring-green-500' : 'border-gray-200'
                  } rounded-lg p-4 relative`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      Best Value
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-800">{pkg.amount} Credits</p>
                      <p className="text-sm text-gray-600">${pkg.price}</p>
                    </div>
                    <button
                      onClick={() => handleBuyCredits(pkg.amount, pkg.price)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm"
                    >
                      Buy
                    </button>
                  </div>
                </div>
              ))}

              {/* Payment Methods */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-800 mb-2">Payment Methods</h3>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  {['Credit/Debit Card', 'Mobile Payment'].map((method, i) => (
                    <div key={method} className="flex items-center mt-2 first:mt-0">
                      <input
                        type="radio"
                        name="payment"
                        defaultChecked={i === 0}
                        className="h-4 w-4 text-green-600"
                      />
                      <label className="ml-2 text-sm text-gray-700">{method}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        // ... Profile tab code unchanged
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          {/* ... */}
          {/* (same as before, omitted here for brevity) */}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        // ... Settings tab code unchanged
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
          {/* ... */}
          {/* (same as before, omitted here for brevity) */}
        </div>
      )}
    </div>
  );
}

export default CreditsAccount;
