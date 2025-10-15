import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';  // Adjust import path
import CampaignList from './CampaignList';
import CampaignDetails from './CampaignDetails';
import CampaignModal from './CampaignModal';
import MyCampaigns from './MyCampaigns';
import WithdrawalModal from './WithdrawalModal';
import DonationModal from './DonationModal';
import { mockCampaigns, mockDonations, mockWithdrawals } from '../../../../data/mockCrowdfundingData';

const CrowdfundingDashboard = () => {
  const { currentUser, updateCredits } = useAuth();

  const [campaigns, setCampaigns] = useState(mockCampaigns);
  const [donations, setDonations] = useState(mockDonations);
  const [withdrawals, setWithdrawals] = useState(mockWithdrawals);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [campaignForAction, setCampaignForAction] = useState(null);
  const [activeView, setActiveView] = useState('explore'); // 'explore', 'my-campaigns', 'details'
  const [totalStats, setTotalStats] = useState({
    totalRaised: 0,
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalDonors: 0,
  });

  const currentUserId = currentUser?.id || 'user-123'; // fallback

  const creditCost = 5;

  // Calculate dashboard statistics
  useEffect(() => {
    const totalRaised = campaigns.reduce((sum, campaign) => sum + campaign.currentAmount, 0);
    const activeCampaigns = campaigns.filter(c => new Date(c.endDate) > new Date()).length;
    const uniqueDonors = new Set(donations.map(d => d.donorId)).size;

    setTotalStats({
      totalRaised,
      totalCampaigns: campaigns.length,
      activeCampaigns,
      totalDonors: uniqueDonors,
    });
  }, [campaigns, donations]);

  // Deduct credits via AuthContext
  const deductCredits = (amount) => {
    if (!currentUser || currentUser.credits < amount) {
      return false;
    }
    updateCredits(-amount); // deduct credits
    return true;
  };

  // Create new campaign with credit deduction
  const handleCreateCampaign = (campaignData) => {
    if (!currentUser) {
      alert('User not logged in.');
      return Promise.reject('User not logged in');
    }

    if (!deductCredits(creditCost)) {
      alert('Insufficient credits to create a campaign.');
      return Promise.reject('Insufficient credits');
    }

    const newCampaign = {
      id: `campaign-${Date.now()}`,
      creatorId: currentUserId,
      creatorName: currentUser.name || 'Current User',
      createdAt: new Date().toISOString(),
      endDate: new Date(Date.now() + campaignData.duration * 24 * 60 * 60 * 1000).toISOString(),
      currentAmount: 0,
      withdrawnAmount: 0,
      daysLeft: campaignData.duration,
      ...campaignData,
    };

    setCampaigns(prev => [newCampaign, ...prev]);
    return Promise.resolve();
  };

  // Update campaign data (no credits deducted)
  const handleUpdateCampaign = (campaignData) => {
    setCampaigns(prev =>
      prev.map(campaign =>
        campaign.id === campaignData.id ? { ...campaign, ...campaignData } : campaign
      )
    );

    if (selectedCampaign?.id === campaignData.id) {
      setSelectedCampaign(prev => ({ ...prev, ...campaignData }));
    }

    return Promise.resolve();
  };

  // Open donation modal for a campaign
  const handleOpenDonateModal = (campaign) => {
    setCampaignForAction(campaign);
    setIsDonateModalOpen(true);
  };

  // Open withdrawal modal for a campaign
  const handleOpenWithdrawalModal = (campaign) => {
    setCampaignForAction(campaign);
    setIsWithdrawalModalOpen(true);
  };

  // Process a donation
  const handleDonation = (donationData) => {
    const donationId = `donation-${Date.now()}`;
    const newDonation = {
      id: donationId,
      donorId: `donor-${Date.now()}`, // Replace with real donor ID if available
      ...donationData
    };

    setDonations(prev => [newDonation, ...prev]);

    setCampaigns(prev =>
      prev.map(campaign =>
        campaign.id === donationData.campaignId
          ? { ...campaign, currentAmount: campaign.currentAmount + donationData.amount }
          : campaign
      )
    );

    if (selectedCampaign?.id === donationData.campaignId) {
      setSelectedCampaign(prev => ({
        ...prev,
        currentAmount: prev.currentAmount + donationData.amount
      }));
    }

    return Promise.resolve();
  };

  // Process a withdrawal
  const handleWithdrawal = (withdrawalData) => {
    const withdrawalId = `withdrawal-${Date.now()}`;
    const newWithdrawal = {
      id: withdrawalId,
      ...withdrawalData
    };

    setWithdrawals(prev => [newWithdrawal, ...prev]);

    setCampaigns(prev =>
      prev.map(campaign =>
        campaign.id === withdrawalData.campaignId
          ? { ...campaign, withdrawnAmount: campaign.withdrawnAmount + withdrawalData.amount }
          : campaign
      )
    );

    if (selectedCampaign?.id === withdrawalData.campaignId) {
      setSelectedCampaign(prev => ({
        ...prev,
        withdrawnAmount: prev.withdrawnAmount + withdrawalData.amount
      }));
    }

    return Promise.resolve();
  };

  const isOwner = (campaign) => campaign?.creatorId === currentUserId;

  const getCampaignDonations = (campaignId) => donations.filter(d => d.campaignId === campaignId);

  const getCampaignWithdrawals = (campaignId) => withdrawals.filter(w => w.campaignId === campaignId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-800">
          {activeView === 'details' ? 'Campaign Details' : activeView === 'my-campaigns' ? 'My Campaigns' : ''}
        </h1>

        <div className="flex space-x-3 items-center">
          {activeView === 'details' && (
            <button
              onClick={() => setActiveView('explore')}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Campaigns
            </button>
          )}

          <div className="text-gray-700 font-medium mr-3">
            Credits: {currentUser?.credits ?? 0}
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className={`px-4 py-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              (currentUser?.credits ?? 0) >= creditCost
                ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
            disabled={(currentUser?.credits ?? 0) < creditCost}
            title={(currentUser?.credits ?? 0) < creditCost ? 'Insufficient credits to create a campaign' : ''}
          >
            Create Campaign ({creditCost} credits)
          </button>
        </div>
      </div>

      {/* Tabs */}
      {activeView !== 'details' && (
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeView === 'explore' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveView('explore')}
            >
              Explore Campaigns
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeView === 'my-campaigns' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveView('my-campaigns')}
            >
              My Campaigns
            </button>
          </nav>
        </div>
      )}

      {/* Views */}
      {activeView === 'explore' && (
        <CampaignList
          campaigns={campaigns}
          onSelectCampaign={setSelectedCampaign}
          onDonate={handleOpenDonateModal}
        />
      )}

      {activeView === 'my-campaigns' && (
        <MyCampaigns
          campaigns={campaigns}
          donations={donations}
          withdrawals={withdrawals}
          onUpdateCampaign={handleUpdateCampaign}
          onWithdraw={handleOpenWithdrawalModal}
        />
      )}

      {activeView === 'details' && selectedCampaign && (
        <CampaignDetails
          campaign={selectedCampaign}
          donations={getCampaignDonations(selectedCampaign.id)}
          withdrawals={getCampaignWithdrawals(selectedCampaign.id)}
          isOwner={isOwner(selectedCampaign)}
          onDonate={handleDonation}
          onWithdraw={handleWithdrawal}
        />
      )}

      {/* Modals */}
      <CampaignModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateCampaign}
      />

      <WithdrawalModal
        isOpen={isWithdrawalModalOpen}
        onClose={() => setIsWithdrawalModalOpen(false)}
        campaign={campaignForAction}
        onWithdraw={handleWithdrawal}
      />

      <DonationModal
        isOpen={isDonateModalOpen}
        onClose={() => setIsDonateModalOpen(false)}
        campaign={campaignForAction}
        onDonate={handleDonation}
      />
    </div>
  );
};

export default CrowdfundingDashboard;
