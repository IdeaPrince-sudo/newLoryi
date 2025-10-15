import React, { useState } from 'react';

function FarmGuards() {
  const [activeTab, setActiveTab] = useState('request');
  const [formData, setFormData] = useState({
    farmLocation: '',
    farmSize: '',
    protectionType: '',
    providerPreference: '',
    startDate: '',
    duration: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    additionalNotes: ''
  });
  
  // Sample farm guard providers
  const providers = [
    {
      id: 1,
      name: "SafeField Security",
      rating: 4.8,
      specialties: ["Crop Protection", "Boundary Patrol", "Anti-Theft"],
      priceRange: "$200-$500 per month",
      regions: ["Eastern Region", "Central Region"]
    },
    {
      id: 2,
      name: "Rural Guard Force",
      rating: 4.5,
      specialties: ["Livestock Protection", "24/7 Monitoring", "Emergency Response"],
      priceRange: "$180-$450 per month",
      regions: ["Western District", "Northern Province", "Central Region"]
    },
    {
      id: 3,
      name: "AgriSentinel",
      rating: 4.7,
      specialties: ["Remote Monitoring", "Drone Surveillance", "Tech Security"],
      priceRange: "$250-$600 per month",
      regions: ["All Regions"]
    }
  ];
  
  // Sample protection types
  const protectionTypes = [
    { id: 'physical', name: 'Physical Guards', description: 'Guards physically patrol and protect your farm' },
    { id: 'tech', name: 'Technology Solutions', description: 'Camera systems, sensors, and remote monitoring' },
    { id: 'combined', name: 'Combined Protection', description: 'Both physical guards and technology solutions' },
    { id: 'livestock', name: 'Livestock Security', description: 'Specialized in protecting livestock from theft and predators' }
  ];

  // Sample active requests
  const activeRequests = [
    {
      id: 101,
      location: "Northern Farm, Eastern Region",
      type: "Physical Guards",
      provider: "SafeField Security",
      status: "Pending",
      requestDate: "2025-07-20",
      startDate: "2025-08-01"
    },
    {
      id: 102,
      location: "Riverside Plantation, Western District",
      type: "Combined Protection",
      provider: "Rural Guard Force",
      status: "Approved",
      requestDate: "2025-07-15",
      startDate: "2025-07-25"
    }
  ];

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Request submitted:", formData);
    alert("Your farm guard request has been submitted successfully. A provider will contact you within 24 hours.");
    // Reset form
    setFormData({
      farmLocation: '',
      farmSize: '',
      protectionType: '',
      providerPreference: '',
      startDate: '',
      duration: '',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      additionalNotes: ''
    });
  };

  return (
    <div className="farm-guards space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Farm Guards</h1>
        <p className="text-gray-600">Request protection services for your farm</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-6">
          <button 
            onClick={() => setActiveTab('request')}
            className={`py-3 border-b-2 text-sm font-medium ${
              activeTab === 'request' 
                ? 'border-green-600 text-green-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Request Guards
          </button>
          <button 
            onClick={() => setActiveTab('active')}
            className={`py-3 border-b-2 text-sm font-medium ${
              activeTab === 'active' 
                ? 'border-green-600 text-green-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Active Requests
          </button>
          <button 
            onClick={() => setActiveTab('providers')}
            className={`py-3 border-b-2 text-sm font-medium ${
              activeTab === 'providers' 
                ? 'border-green-600 text-green-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Providers
          </button>
        </nav>
      </div>

      {/* Request form */}
      {activeTab === 'request' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Request Farm Guards</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-800 mb-3">Farm Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Farm Location</label>
                    <input 
                      type="text" 
                      name="farmLocation"
                      value={formData.farmLocation}
                      onChange={handleInputChange}
                      placeholder="E.g., Northern District, Plot 123"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Farm Size (acres)</label>
                    <input 
                      type="number" 
                      name="farmSize"
                      value={formData.farmSize}
                      onChange={handleInputChange}
                      placeholder="E.g., 5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Protection Type</label>
                    <select 
                      name="protectionType"
                      value={formData.protectionType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="">Select Protection Type</option>
                      {protectionTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                    
                    {formData.protectionType && (
                      <p className="text-sm text-gray-600 mt-1">
                        {protectionTypes.find(t => t.id === formData.protectionType)?.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-800 mb-3">Service Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Provider (Optional)</label>
                    <select 
                      name="providerPreference"
                      value={formData.providerPreference}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">No Preference</option>
                      {providers.map(provider => (
                        <option key={provider.id} value={provider.id}>{provider.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input 
                      type="date" 
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                    <select 
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="">Select Duration</option>
                      <option value="1month">1 Month</option>
                      <option value="3months">3 Months</option>
                      <option value="6months">6 Months</option>
                      <option value="ongoing">Ongoing (Monthly Renewal)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-800 mb-3">Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                  <input 
                    type="text" 
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input 
                    type="tel" 
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
              <textarea 
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleInputChange}
                rows="3"
                placeholder="Any specific security concerns or requirements..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              ></textarea>
            </div>
            
            <div className="pt-4">
              <button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
              >
                Submit Request
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                A representative will contact you within 24 hours to discuss your security needs and provide a quote.
              </p>
            </div>
          </form>
        </div>
      )}

      {/* Active requests */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {activeRequests.length > 0 ? (
            activeRequests.map(request => (
              <div key={request.id} className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">{request.location}</h3>
                    <p className="text-sm text-gray-500">Request #{request.id} • {request.requestDate}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    request.status === 'Approved' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {request.status}
                  </span>
                </div>
                
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Protection Type:</span>
                    <p className="font-medium">{request.type}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Provider:</span>
                    <p className="font-medium">{request.provider}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Start Date:</span>
                    <p className="font-medium">{request.startDate}</p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View Details
                  </button>
                  <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                    Cancel Request
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 bg-white border border-gray-200 rounded-lg">
              <p className="text-gray-500">You don't have any active guard requests.</p>
              <button 
                onClick={() => setActiveTab('request')}
                className="mt-2 text-green-600 hover:text-green-700 font-medium"
              >
                Make a Request
              </button>
            </div>
          )}
        </div>
      )}

      {/* Providers */}
      {activeTab === 'providers' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {providers.map(provider => (
              <div key={provider.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg text-gray-800">{provider.name}</h3>
                    <div className="flex items-center bg-green-50 px-2 py-1 rounded-md">
                      <span className="text-yellow-500 mr-1">★</span>
                      <span className="text-green-700 font-medium text-sm">{provider.rating}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-xs font-medium text-gray-500 mb-2">SPECIALTIES</h4>
                    <div className="flex flex-wrap gap-2">
                      {provider.specialties.map((specialty, index) => (
                        <span 
                          key={index} 
                          className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-md"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Price Range:</span>
                      <p className="font-medium">{provider.priceRange}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Regions Served:</span>
                      <p className="font-medium">{provider.regions.join(", ")}</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setActiveTab('request');
                      setFormData(prev => ({
                        ...prev,
                        providerPreference: provider.id.toString()
                      }));
                    }}
                    className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-2 rounded-md"
                  >
                    Request This Provider
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FarmGuards;