import React, { useState } from 'react';
import { useAuth } from "../../../../contexts/AuthContext";

function FarmPitches() {
  const { currentUser, updateCredits } = useAuth();

  const [activeTab, setActiveTab] = useState('myPitches');
  const [showNewPitchForm, setShowNewPitchForm] = useState(false);

  if (!currentUser) {
    return <p>Please log in to view farm pitches.</p>;
  }

  const isFarmer = currentUser.role === 'farmer';

  // Sample pitches - Replace with real data/API
  const farmPitches = [
    {
      id: 1,
      title: 'Sustainable Rice Farming Project',
      description: 'Eco-friendly rice cultivation using modern irrigation techniques',
      location: 'Eastern Province',
      fundingNeeded: '$5,000',
      expectedReturn: '15% annually',
      ownerId: '1',
      ownerName: 'John Farmer',
      views: 24,
      interestedInvestors: 3,
    },
    {
      id: 2,
      title: 'Organic Vegetable Greenhouse',
      description: 'Year-round organic vegetable production in controlled environment',
      location: 'Central Region',
      fundingNeeded: '$7,500',
      expectedReturn: '18% annually',
      ownerId: '1',
      ownerName: 'John Farmer',
      views: 18,
      interestedInvestors: 2,
    },
  ];

  // Filter pitches
  const pitchesToShow = isFarmer
    ? farmPitches.filter((pitch) => pitch.ownerId === currentUser.id)
    : farmPitches;

  // ✅ Deduct 10 credits for creating a pitch
  const handleCreatePitch = () => {
    if (!isFarmer) {
      alert('Only farmers can create pitches.');
      return;
    }

    if (currentUser.credits < 10) {
      alert('Not enough credits! You need 10 credits to create a new pitch.');
      return;
    }

    updateCredits(-10); // Deduct credits
    setShowNewPitchForm(true);
  };

  const handleSubmitPitch = (e) => {
    e.preventDefault();
    // Save pitch logic here
    setShowNewPitchForm(false);
    alert('Pitch created successfully!');
  };

  // ✅ Deduct 5 credits when an investor shows interest
  const handleShowInterest = (pitch) => {
    if (currentUser.credits < 5) {
      alert('Not enough credits! You need 5 credits to show interest in a pitch.');
      return;
    }

    updateCredits(-5); // Deduct credits
    alert(`You have shown interest in: "${pitch.title}" by ${pitch.ownerName}. The farmer will be contacted.`);
  };

  return (
    <div className="farm-pitches space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Farm Pitches</h1>
          <p className="text-gray-600">View and manage farm investment pitches</p>
        </div>

        {isFarmer && (
          <button
            onClick={handleCreatePitch}
            disabled={currentUser.credits < 10}
            className={`mt-3 md:mt-0 px-4 py-2 rounded-md text-white ${
              currentUser.credits < 10 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
            }`}
            title={currentUser.credits < 10 ? 'Not enough credits' : 'Create new pitch (cost: 10 credits)'}
          >
            + New Pitch (10 credits)
          </button>
        )}
      </div>

      {/* Low Credits Alert */}
      {isFarmer && currentUser.credits < 10 && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700 text-sm">
          <strong>Low credits:</strong> You need at least 10 credits to create a new farm pitch.
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="flex space-x-6">
          <button
            onClick={() => setActiveTab('myPitches')}
            className={`py-3 border-b-2 text-sm font-medium ${
              activeTab === 'myPitches'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {isFarmer ? 'My Pitches' : 'All Pitches'}
          </button>
          <button
            onClick={() => setActiveTab('tips')}
            className={`py-3 border-b-2 text-sm font-medium ${
              activeTab === 'tips'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pitch Tips
          </button>
        </nav>
      </div>

      {/* Pitches List */}
      {activeTab === 'myPitches' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pitchesToShow.length > 0 ? (
            pitchesToShow.map((pitch) => (
              <PitchCard
                key={pitch.id}
                pitch={pitch}
                isFarmer={isFarmer}
                onShowInterest={() => handleShowInterest(pitch)}
              />
            ))
          ) : (
            <p>{isFarmer ? "You haven't created any farm pitches yet." : 'No farm pitches available.'}</p>
          )}
        </div>
      )}

      {/* Tips Section */}
      {activeTab === 'tips' && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Tips for Creating Successful Farm Pitches</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>Be specific about your farming project, methods, and timeline.</li>
            <li>Include realistic financial projections with expected returns.</li>
            <li>Highlight your experience and expertise to build investor confidence.</li>
            <li>Add photos and videos to add credibility.</li>
            <li>Address risks and how you plan to mitigate them.</li>
          </ul>
        </div>
      )}

      {/* New Pitch Modal */}
      {isFarmer && showNewPitchForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Create New Farm Pitch</h2>
              <button onClick={() => setShowNewPitchForm(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>

            <form onSubmit={handleSubmitPitch} className="space-y-4">
              <div>
                <label className="block font-medium mb-1">Pitch Title</label>
                <input type="text" placeholder="E.g., Organic Maize Farm Expansion" required className="w-full border rounded px-3 py-2" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">Category</label>
                  <select required className="w-full border rounded px-3 py-2">
                    <option value="">Select Category</option>
                    <option value="crops">Crops</option>
                    <option value="livestock">Livestock</option>
                    <option value="poultry">Poultry</option>
                    <option value="aquaculture">Aquaculture</option>
                    <option value="greenhouse">Greenhouse</option>
                    <option value="orchard">Orchard</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1">Location</label>
                  <input type="text" placeholder="Farm location" required className="w-full border rounded px-3 py-2" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">Funding Needed ($)</label>
                  <input type="number" placeholder="5000" required className="w-full border rounded px-3 py-2" min={0} />
                </div>
                <div>
                  <label className="block font-medium mb-1">Expected Return (%)</label>
                  <input type="number" placeholder="15" required className="w-full border rounded px-3 py-2" min={0} />
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Pitch Description</label>
                <textarea placeholder="Describe your farming project..." required className="w-full border rounded px-3 py-2" rows={4} />
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setShowNewPitchForm(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Submit Pitch</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function PitchCard({ pitch, isFarmer, onShowInterest }) {
  return (
    <div className="bg-white border rounded-lg shadow-sm p-5">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-gray-800">{pitch.title}</h3>
      </div>
      <p className="text-sm text-gray-600">{pitch.location}</p>
      <p className="mt-2 text-gray-700">{pitch.description}</p>
      <div className="grid grid-cols-2 gap-4 mt-4 text-sm text-gray-500">
        <div>
          <div>Funding Needed</div>
          <div className="font-semibold">{pitch.fundingNeeded}</div>
        </div>
        <div>
          <div>Expected Return</div>
          <div className="font-semibold">{pitch.expectedReturn}</div>
        </div>
      </div>
      <p className="mt-2 italic text-gray-600">Owner: {pitch.ownerName || 'Unknown'}</p>
      <div className="mt-4 pt-4 border-t flex justify-between items-center text-gray-500 text-sm">
        <div>
          <span>{pitch.views} views</span> | <span>{pitch.interestedInvestors} interested</span>
        </div>
        {!isFarmer && (
          <button
            onClick={onShowInterest}
            className="bg-green-600 text-white text-sm px-3 py-1 rounded hover:bg-green-700"
          >
            Show Interest (5 credits)
          </button>
        )}
      </div>
    </div>
  );
}

export default FarmPitches;
