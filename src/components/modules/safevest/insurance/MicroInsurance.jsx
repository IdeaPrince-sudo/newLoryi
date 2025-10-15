import React, { useState } from 'react';

function MicroInsurance() {
  const [activeTab, setActiveTab] = useState('plans');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [applicationForm, setApplicationForm] = useState({
    name: '',
    farmLocation: '',
    farmSize: '',
    crops: '',
    coverage: '',
    startDate: '',
    mobile: '',
    additionalInfo: ''
  });

  // Sample insurance plans
  const insurancePlans = [
    {
      id: 1,
      name: "Crop Protection Basic",
      provider: "AgriSure Insurance",
      coverageAmount: "$1,000",
      premium: "$10/month",
      duration: "6 months",
      description: "Basic coverage for crop damage due to drought, flood, or pests.",
      covers: ["Drought", "Flood", "Pest Damage", "Fire"],
      requirements: ["Farm registration", "Crop history", "Location details"]
    },
    {
      id: 2,
      name: "Comprehensive Farm Shield",
      provider: "RuralGuard",
      coverageAmount: "$3,000",
      premium: "$25/month",
      duration: "12 months",
      description: "Complete coverage for crops, equipment, and limited livestock losses.",
      covers: ["All Basic Coverage", "Equipment Damage", "Limited Livestock", "Theft"],
      requirements: ["Farm registration", "Asset inventory", "Risk assessment"]
    },
    {
      id: 3,
      name: "Weather Index Insurance",
      provider: "ClimateSafe",
      coverageAmount: "$2,000",
      premium: "$15/month",
      duration: "Growing season",
      description: "Payout triggered by specific weather events like insufficient rainfall or extreme temperatures.",
      covers: ["Rainfall Deficit", "Excess Rainfall", "Extreme Temperatures"],
      requirements: ["Farm location", "Crop type", "Planting date"]
    }
  ];

  // Sample claims process steps
  const claimsSteps = [
    {
      number: 1,
      title: "Report the Incident",
      description: "Report the damage within 72 hours through the app or by calling our helpline."
    },
    {
      number: 2,
      title: "Document the Damage",
      description: "Take clear photos of the damage and gather any supporting documentation."
    },
    {
      number: 3,
      title: "Submit Claim Form",
      description: "Complete the claim form in the app with all required information and evidence."
    },
    {
      number: 4,
      title: "Assessment",
      description: "Our field agent will visit to assess the damage within 5 business days."
    },
    {
      number: 5,
      title: "Claim Processing",
      description: "Claims are processed within 14 days, with payment directly to your registered account."
    }
  ];

  // Handle insurance application form submission
  const handleApplicationSubmit = (e) => {
    e.preventDefault();
    alert('Your insurance application has been submitted successfully! A representative will contact you within 48 hours.');
    setSelectedPlan(null);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setApplicationForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="micro-insurance space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Micro-Insurance</h1>
        <p className="text-gray-600">Protect your farm with affordable insurance options</p>
      </div>

      {/* Information banner */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="font-semibold text-blue-800">Why Micro-Insurance?</h3>
        <p className="text-blue-700 text-sm mt-1">
          Micro-insurance provides affordable coverage to protect your farm against risks like extreme weather, 
          pests, and diseases with low premiums and simplified claims processes.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-6">
          <button 
            onClick={() => setActiveTab('plans')}
            className={`py-3 border-b-2 text-sm font-medium ${
              activeTab === 'plans' 
                ? 'border-green-600 text-green-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Insurance Plans
          </button>
          <button 
            onClick={() => setActiveTab('claims')}
            className={`py-3 border-b-2 text-sm font-medium ${
              activeTab === 'claims' 
                ? 'border-green-600 text-green-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Claims Process
          </button>
          <button 
            onClick={() => setActiveTab('faq')}
            className={`py-3 border-b-2 text-sm font-medium ${
              activeTab === 'faq' 
                ? 'border-green-600 text-green-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            FAQ
          </button>
        </nav>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'plans' && (
        <div className="insurance-plans">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {insurancePlans.map(plan => (
              <div key={plan.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-5">
                  <h3 className="font-semibold text-lg text-gray-800">{plan.name}</h3>
                  <p className="text-sm text-gray-500">{plan.provider}</p>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Coverage:</span>
                      <span className="font-medium">{plan.coverageAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Premium:</span>
                      <span className="font-medium">{plan.premium}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{plan.duration}</span>
                    </div>
                  </div>
                  
                  <p className="mt-4 text-gray-700 text-sm">{plan.description}</p>
                  
                  <div className="mt-4">
                    <h4 className="text-xs font-medium text-gray-500 uppercase">Covers</h4>
                    <ul className="mt-1 text-sm">
                      {plan.covers.map((item, index) => (
                        <li key={index} className="flex items-center text-gray-700 py-1">
                          <span className="text-green-500 mr-2">✓</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <button 
                    onClick={() => setSelectedPlan(plan)}
                    className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-2 rounded-md"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'claims' && (
        <div className="claims-process">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">How to File a Claim</h2>
            
            <div className="space-y-8">
              {claimsSteps.map(step => (
                <div key={step.number} className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-700 font-bold">
                      {step.number}
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-gray-800">{step.title}</h3>
                    <p className="text-gray-600 mt-1">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-4 bg-yellow-50 rounded-md">
              <h3 className="font-medium text-yellow-800">Important Notes:</h3>
              <ul className="mt-2 space-y-1 text-sm text-yellow-700">
                <li>• Claims must be reported within 72 hours of the incident</li>
                <li>• All supporting documentation must be submitted with your claim</li>
                <li>• False claims are subject to policy termination and legal action</li>
                <li>• For emergency assistance, contact our 24/7 helpline: 1-800-FARM-HELP</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'faq' && (
        <div className="insurance-faq">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-800">What is agricultural micro-insurance?</h3>
                <p className="text-gray-600 mt-1">
                  Agricultural micro-insurance provides small-scale farmers with affordable protection against specific risks like crop failure, 
                  extreme weather events, and livestock losses, with simplified application and claims processes.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-800">How much does micro-insurance cost?</h3>
                <p className="text-gray-600 mt-1">
                  Premiums typically range from $5 to $30 per month depending on the coverage level, farm size, and risks covered. 
                  Our plans are designed to be affordable for smallholder farmers.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-800">How quickly are claims processed?</h3>
                <p className="text-gray-600 mt-1">
                  We aim to process all claims within 14 days of receiving complete documentation and assessment. 
                  Payments are made directly to your registered mobile money account or bank account.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-800">Can I insure multiple crops or farms?</h3>
                <p className="text-gray-600 mt-1">
                  Yes, you can insure multiple crops or farms under a single policy with appropriate coverage adjustments, 
                  or you may choose separate policies for different farm operations.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-800">What documentation do I need to apply?</h3>
                <p className="text-gray-600 mt-1">
                  You'll typically need proof of farm ownership or lease agreement, identification, crop planting history, 
                  farm location details, and sometimes photos of your farm.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-800">Is there a waiting period before coverage starts?</h3>
                <p className="text-gray-600 mt-1">
                  Yes, most policies have a 14-day waiting period from the time of premium payment before coverage becomes active. 
                  This helps prevent insurance fraud during imminent risk situations.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insurance Application Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Apply for {selectedPlan.name}</h2>
                <button 
                  onClick={() => setSelectedPlan(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-6 p-4 bg-gray-50 rounded-md">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Provider:</span>
                  <span className="font-medium">{selectedPlan.provider}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Coverage:</span>
                  <span className="font-medium">{selectedPlan.coverageAmount}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Premium:</span>
                  <span className="font-medium">{selectedPlan.premium}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{selectedPlan.duration}</span>
                </div>
              </div>
              
              <form onSubmit={handleApplicationSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={applicationForm.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Farm Location</label>
                    <input 
                      type="text" 
                      name="farmLocation"
                      value={applicationForm.farmLocation}
                      onChange={handleInputChange}
                      placeholder="District, Region"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Farm Size (acres)</label>
                    <input 
                      type="number" 
                      name="farmSize"
                      value={applicationForm.farmSize}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Crops/Livestock to be Insured</label>
                  <input 
                    type="text" 
                    name="crops"
                    value={applicationForm.crops}
                    onChange={handleInputChange}
                    placeholder="E.g., Maize, Rice, Dairy Cows"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Coverage Period</label>
                    <select 
                      name="coverage"
                      value={applicationForm.coverage}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="">Select Coverage Period</option>
                      <option value="6months">6 months</option>
                      <option value="12months">12 months</option>
                      <option value="growingSeason">Growing Season</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Start Date</label>
                    <input 
                      type="date" 
                      name="startDate"
                      value={applicationForm.startDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                  <input 
                    type="tel" 
                    name="mobile"
                    value={applicationForm.mobile}
                    onChange={handleInputChange}
                    placeholder="For contact and mobile payments"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Information</label>
                  <textarea
                    name="additionalInfo"
                    value={applicationForm.additionalInfo}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Any specific risks or concerns you'd like covered"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  ></textarea>
                </div>
                
                <div className="pt-2">
                  <button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
                  >
                    Submit Application
                  </button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    An insurance representative will contact you within 48 hours to complete your application.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MicroInsurance;