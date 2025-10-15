import React, { useState } from 'react';

const DonationModal = ({ isOpen, onClose, campaign, onDonate }) => {
  const [formData, setFormData] = useState({
    amount: 10,
    donorName: '',
    message: '',
    isAnonymous: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  if (!isOpen || !campaign) return null;
  
  const predefinedAmounts = [5, 10, 25, 50, 100];
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    setError('');
  };
  
  const handlePredefinedAmount = (amount) => {
    setFormData({
      ...formData,
      amount
    });
    setError('');
  };
  
  const validateForm = () => {
    const { amount } = formData;
    const donationAmount = Number(amount);
    
    if (!donationAmount || isNaN(donationAmount) || donationAmount <= 0) {
      setError('Please enter a valid donation amount');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const { isAnonymous, donorName, ...restData } = formData;
      
      await onDonate({
        campaignId: campaign.id,
        ...restData,
        donorName: isAnonymous ? 'Anonymous' : donorName || 'Anonymous',
        timestamp: new Date().toISOString(),
      });
      
      onClose();
    } catch (err) {
      setError('Failed to process donation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg font-semibold leading-6 text-gray-900">Donate to Campaign</h3>
                
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Support "<span className="font-medium">{campaign.title}</span>" with your donation.
                  </p>
                </div>
                
                <div className="mt-4">
                  <form onSubmit={handleSubmit}>
                    {/* Donation Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Choose an amount
                      </label>
                      <div className="mt-2 grid grid-cols-5 gap-2">
                        {predefinedAmounts.map((amount) => (
                          <button
                            key={amount}
                            type="button"
                            onClick={() => handlePredefinedAmount(amount)}
                            className={`py-2 px-4 rounded-md text-sm font-medium ${
                              formData.amount === amount
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                          >
                            ${amount}
                          </button>
                        ))}
                      </div>
                      
                      <div className="mt-3 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          name="amount"
                          id="amount"
                          value={formData.amount}
                          onChange={handleInputChange}
                          className={`block w-full pl-7 pr-12 py-2 sm:text-sm rounded-md ${
                            error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                          }`}
                          placeholder="Custom amount"
                          min="1"
                          step="1"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">USD</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Donor Name */}
                    <div className="mt-4">
                      <label htmlFor="donorName" className="block text-sm font-medium text-gray-700">
                        Your Name (Optional)
                      </label>
                      <input
                        type="text"
                        name="donorName"
                        id="donorName"
                        value={formData.donorName}
                        onChange={handleInputChange}
                        disabled={formData.isAnonymous}
                        className={`mt-1 block w-full rounded-md ${
                          formData.isAnonymous ? 'bg-gray-100 text-gray-500' : 'border-gray-300'
                        } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
                        placeholder="Your name (will be shown with your donation)"
                      />
                    </div>
                    
                    {/* Anonymous Option */}
                    <div className="mt-2 flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="isAnonymous"
                          name="isAnonymous"
                          type="checkbox"
                          checked={formData.isAnonymous}
                          onChange={handleInputChange}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                      <div className="ml-2 text-sm">
                        <label htmlFor="isAnonymous" className="font-medium text-gray-700">
                          Make this donation anonymous
                        </label>
                      </div>
                    </div>
                    
                    {/* Message */}
                    <div className="mt-4">
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                        Leave a message (Optional)
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={3}
                        value={formData.message}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="Leave a message of support..."
                      />
                    </div>
                    
                    {error && (
                      <div className="mt-3 text-sm text-red-600">
                        {error}
                      </div>
                    )}
                    
                    <div className="mt-6 bg-gray-50 px-4 py-3 sm:px-6 -mx-6 -mb-4 flex flex-col sm:flex-row-reverse sm:space-x-reverse sm:space-x-3">
                      <button
                        type="submit"
                        disabled={isSubmitting || !formData.amount || Number(formData.amount) <= 0}
                        className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm ${
                          isSubmitting || !formData.amount || Number(formData.amount) <= 0
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                        }`}
                      >
                        {isSubmitting ? 'Processing...' : `Donate $${formData.amount}`}
                      </button>
                      <button
                        type="button"
                        onClick={onClose}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationModal;