import React, { useState, useEffect } from 'react';
import CampaignCard from './CampaignCard';
import CampaignModal from './CampaignModal';

const MyCampaigns = ({ campaigns, donations, withdrawals, onUpdateCampaign, onWithdraw }) => {
  const [myCampaigns, setMyCampaigns] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  
  // User ID simulation (in a real app, this would come from auth)
  const currentUserId = 'user-123';
  
  // Filter campaigns by creator
  useEffect(() => {
    const filtered = campaigns.filter(campaign => campaign.creatorId === currentUserId);
    setMyCampaigns(filtered);
  }, [campaigns]);
  
  // Get donations for a specific campaign
  const getCampaignDonations = (campaignId) => {
    return donations.filter(donation => donation.campaignId === campaignId);
  };
  
  // Get withdrawals for a specific campaign
  const getCampaignWithdrawals = (campaignId) => {
    return withdrawals.filter(withdrawal => withdrawal.campaignId === campaignId);
  };
  
  // Calculate available amount for withdrawal
  const calculateAvailableAmount = (campaign) => {
    const totalWithdrawn = getCampaignWithdrawals(campaign.id)
      .reduce((sum, withdrawal) => sum + withdrawal.amount, 0);
    return campaign.currentAmount - totalWithdrawn;
  };
  
  // Handle opening edit modal
  const handleEditCampaign = (campaign) => {
    setSelectedCampaign(campaign);
    setIsEditModalOpen(true);
  };
  
  // Handle opening withdrawal modal
  const handleWithdrawalRequest = (campaign) => {
    // We'll manage this in the parent component
    onWithdraw(campaign);
  };
  
  // Filter campaigns by status
  const filteredCampaigns = myCampaigns.filter(campaign => {
    const isActive = new Date(campaign.endDate) > new Date();
    return (activeTab === 'active' && isActive) || (activeTab === 'ended' && !isActive);
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">My Campaigns</h2>
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
              activeTab === 'active'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            Active
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ended')}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
              activeTab === 'ended'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 border-l-0'
            }`}
          >
            Ended
          </button>
        </div>
      </div>

      {filteredCampaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map(campaign => {
            const campaignDonations = getCampaignDonations(campaign.id);
            const availableAmount = calculateAvailableAmount(campaign);
            
            return (
              <div key={campaign.id} className="flex flex-col">
                <CampaignCard campaign={campaign} />
                <div className="mt-3 flex flex-col space-y-2">
                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
                    <span className="font-medium">{campaignDonations.length}</span> donations received
                    <span className="mx-2">•</span>
                    <span className="font-medium">${availableAmount.toLocaleString()}</span> available for withdrawal
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditCampaign(campaign)}
                      className="flex-1 px-3 py-1.5 text-xs font-medium rounded border border-gray-300 hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleWithdrawalRequest(campaign)}
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={availableAmount <= 0}
                    >
                      Withdraw Funds
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No {activeTab} campaigns</h3>
          <p className="mt-1 text-sm text-gray-500">
            {activeTab === 'active' ? "You don't have any active campaigns." : "You don't have any ended campaigns."}
          </p>
        </div>
      )}

      {/* Edit Campaign Modal */}
      <CampaignModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={onUpdateCampaign}
        campaign={selectedCampaign}
      />
    </div>
  );
};

export default MyCampaigns;