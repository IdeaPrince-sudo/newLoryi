import React, { useState } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const CampaignDetails = ({ campaign, donations = [], withdrawals = [], isOwner, onDonate, onWithdraw }) => {
  if (!campaign) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">Campaign not found or still loading...</p>
      </div>
    );
  }

  const [donationAmount, setDonationAmount] = useState(10);
  const [withdrawalAmount, setWithdrawalAmount] = useState(0);
  const [copied, setCopied] = useState(false);

  const {
    id,
    title,
    description,
    currentAmount = 0,
    targetAmount = 1,
    createdAt,
    endDate,
    imageUrl,
    category = 'General',
    creatorName = 'Unknown',
    withdrawnAmount = 0
  } = campaign;

  const progressPercentage = Math.min(Math.round((currentAmount / targetAmount) * 100), 100);
  const availableBalance = currentAmount - withdrawnAmount;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const calculateDaysLeft = () => {
    if (!endDate) return 'No deadline';
    const timeLeft = new Date(endDate).getTime() - new Date().getTime();
    if (timeLeft <= 0) return 'Ended';
    return `${Math.ceil(timeLeft / (1000 * 60 * 60 * 24))} days left`;
  };

  const handleDonateSubmit = (e) => {
    e.preventDefault();
    if (onDonate) {
      onDonate({
        campaignId: id,
        amount: donationAmount,
        donorName: 'Anonymous Donor',
        timestamp: new Date().toISOString(),
        message: 'Thank you for your great work!'
      });
    }
    setDonationAmount(10);
  };

  const handleWithdrawSubmit = (e) => {
    e.preventDefault();
    if (onWithdraw) {
      onWithdraw({ campaignId: id, amount: withdrawalAmount, timestamp: new Date().toISOString() });
    }
    setWithdrawalAmount(0);
  };

  /** ✅ Share Handlers */
  const handleNativeShare = () => {
    const shareData = {
      title,
      text: `Support this campaign: ${title}`,
      url: window.location.href,
    };
    if (navigator.share) {
      navigator.share(shareData).catch(console.error);
    } else {
      alert("Sharing is not supported on this browser. Use the social links below.");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentUrl = encodeURIComponent(window.location.href);
  const shareText = encodeURIComponent(`Support this campaign: ${title}`);

  return (
    <div className="space-y-8">
      {/* ✅ Campaign Header */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="relative h-72 md:h-96">
          <img
            src={imageUrl || 'https://via.placeholder.com/800x400?text=Campaign+Image'}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <span className="inline-block bg-blue-500 text-xs font-semibold px-3 py-1 rounded-full">{category}</span>
            <h1 className="text-3xl font-bold mt-2">{title}</h1>
            <div className="flex items-center text-sm">
              <span>Created by {creatorName} on {formatDate(createdAt)}</span>
              <span className="mx-2">•</span>
              <span>{calculateDaysLeft()}</span>
            </div>
          </div>
        </div>

        {/* ✅ Progress & Share */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center mb-6 gap-6">
            <div className="w-24 h-24 md:w-32 md:h-32">
              <CircularProgressbar
                value={progressPercentage}
                text={`${progressPercentage}%`}
                styles={buildStyles({
                  pathColor: progressPercentage === 100 ? '#10B981' : '#3B82F6',
                  textColor: '#1F2937',
                  trailColor: '#E5E7EB',
                  textSize: '22px'
                })}
              />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <span className="block text-2xl font-bold">${currentAmount.toLocaleString()}</span>
                  <span className="text-sm text-gray-500">raised of ${targetAmount.toLocaleString()} goal</span>
                </div>
                {availableBalance > 0 && isOwner && (
                  <div className="text-right">
                    <span className="block text-lg font-medium">${availableBalance.toLocaleString()}</span>
                    <span className="text-sm text-gray-500">available to withdraw</span>
                  </div>
                )}
              </div>
              <div className="w-full bg-gray-200 h-3 rounded-full">
                <div className="h-full rounded-full" style={{ width: `${progressPercentage}%`, backgroundColor: progressPercentage === 100 ? '#10B981' : '#3B82F6' }}></div>
              </div>
            </div>
          </div>

          {/* ✅ Share Buttons */}
          <div className="flex flex-wrap gap-3 mb-4">
            <button onClick={handleNativeShare} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
              📤 Share Campaign
            </button>
            <button onClick={handleCopyLink} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
              📋 Copy Link
            </button>
            {copied && <span className="text-green-600 text-sm">Link copied!</span>}

            <a href={`https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-blue-700 text-white rounded-md">Facebook</a>
            <a href={`https://twitter.com/intent/tweet?text=${shareText}&url=${currentUrl}`} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-sky-500 text-white rounded-md">Twitter</a>
            <a href={`https://wa.me/?text=${shareText}%20${currentUrl}`} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-green-600 text-white rounded-md">WhatsApp</a>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${currentUrl}`} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-blue-800 text-white rounded-md">LinkedIn</a>
          </div>

          {/* ✅ Donation Form */}
          <div className="flex flex-col md:flex-row gap-4">
            {!isOwner && (
              <form onSubmit={handleDonateSubmit} className="flex-1 flex flex-col md:flex-row gap-2">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
                  <input
                    type="number"
                    min="1"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(Number(e.target.value))}
                    className="pl-8 pr-4 py-3 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Amount"
                  />
                </div>
                <button type="submit" className="py-3 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">Donate Now</button>
              </form>
            )}

            {isOwner && availableBalance > 0 && (
              <form onSubmit={handleWithdrawSubmit} className="flex-1 flex flex-col md:flex-row gap-2">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
                  <input
                    type="number"
                    min="1"
                    max={availableBalance}
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(Number(e.target.value))}
                    className="pl-8 pr-4 py-3 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Amount to withdraw"
                  />
                </div>
                <button type="submit" disabled={withdrawalAmount <= 0 || withdrawalAmount > availableBalance} className={`py-3 px-6 text-white rounded-md ${withdrawalAmount <= 0 || withdrawalAmount > availableBalance ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}>Withdraw Funds</button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ✅ About Campaign */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">About this campaign</h2>
            <p className="whitespace-pre-line">{description}</p>
          </div>
        </div>

        {/* ✅ Donations & Withdrawals */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Donations</h2>
            {donations.length > 0 ? donations.map((d) => (
              <div key={d.id} className="border-b pb-3 mb-3 last:border-b-0 last:pb-0">
                <div className="flex justify-between"><span className="font-medium">{d.donorName || 'Anonymous'}</span><span className="font-semibold">${d.amount.toLocaleString()}</span></div>
                <div className="text-sm text-gray-500">{formatDate(d.timestamp)}</div>
                {d.message && <p className="mt-2 text-sm italic">{d.message}</p>}
              </div>
            )) : <p className="text-gray-500">No donations yet. Be the first to support!</p>}
          </div>

          {isOwner && withdrawals.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Withdrawal History</h2>
              {withdrawals.map((w) => (
                <div key={w.id} className="border-b pb-3 mb-3 last:border-b-0 last:pb-0">
                  <div className="flex justify-between"><span>Withdrawal</span><span className="font-semibold">${w.amount.toLocaleString()}</span></div>
                  <div className="text-sm text-gray-500">{formatDate(w.timestamp)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;
