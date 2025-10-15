import React, { useState } from 'react';
import { expertAdvice } from '../fertiWiseData';

const ExpertConsultation = () => {
  const [activeTab, setActiveTab] = useState('book');
  const [consultationType, setConsultationType] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [farmDetails, setFarmDetails] = useState('');
  const [specificConcerns, setSpecificConcerns] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Group experts by specialization
  const expertsBySpecialization = expertAdvice.reduce((acc, advice) => {
    if (!acc[advice.expertise]) {
      acc[advice.expertise] = [];
    }
    
    // Only add unique experts
    if (!acc[advice.expertise].some(expert => expert.name === advice.expert)) {
      acc[advice.expertise].push({
        name: advice.expert,
        expertise: advice.expertise,
        available: Math.random() > 0.3 // Randomly set availability for demo
      });
    }
    
    return acc;
  }, {});
  
  // Get all unique specializations
  const specializations = Object.keys(expertsBySpecialization);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Handle consultation booking
  const handleBookConsultation = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
        setConsultationType('');
        setPreferredDate('');
        setPreferredTime('');
        setFarmDetails('');
        setSpecificConcerns('');
      }, 3000);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Expert Consultation</h1>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('book')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'book'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Book Consultation
            </button>
            <button
              onClick={() => setActiveTab('experts')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'experts'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Our Experts
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Consultation History
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'book' && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-800 mb-2">Book an Expert Consultation</h2>
                <p className="text-sm text-gray-600">
                  Get personalized advice from agricultural experts specializing in fertilizer management, soil health, and crop nutrition.
                </p>
              </div>
              
              {showSuccess ? (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
                  <div className="flex">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <p className="font-medium text-green-800">Consultation Booked Successfully!</p>
                      <p className="text-sm text-green-700 mt-1">
                        You will receive a confirmation email with the details of your consultation.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleBookConsultation}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Type</label>
                      <select
                        required
                        value={consultationType}
                        onChange={(e) => setConsultationType(e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                      >
                        <option value="">Select Consultation Type</option>
                        {specializations.map(specialization => (
                          <option key={specialization} value={specialization}>{specialization}</option>
                        ))}
                        <option value="General">General Consultation</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Method</label>
                      <div className="flex gap-4">
                        <label className="flex items-center">
                          <input type="radio" name="method" value="video" className="text-green-600 focus:ring-green-500 h-4 w-4" />
                          <span className="ml-2 text-sm text-gray-700">Video Call</span>
                        </label>
                        <label className="flex items-center">
                          <input type="radio" name="method" value="audio" className="text-green-600 focus:ring-green-500 h-4 w-4" />
                          <span className="ml-2 text-sm text-gray-700">Audio Call</span>
                        </label>
                        <label className="flex items-center">
                          <input type="radio" name="method" value="inperson" className="text-green-600 focus:ring-green-500 h-4 w-4" />
                          <span className="ml-2 text-sm text-gray-700">In Person</span>
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
                      <select
                        required
                        value={preferredTime}
                        onChange={(e) => setPreferredTime(e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                      >
                        <option value="">Select Time Slot</option>
                        <option value="09:00">09:00 AM - 10:00 AM</option>
                        <option value="10:00">10:00 AM - 11:00 AM</option>
                        <option value="11:00">11:00 AM - 12:00 PM</option>
                        <option value="13:00">01:00 PM - 02:00 PM</option>
                        <option value="14:00">02:00 PM - 03:00 PM</option>
                        <option value="15:00">03:00 PM - 04:00 PM</option>
                        <option value="16:00">04:00 PM - 05:00 PM</option>
                      </select>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Farm Details</label>
                      <textarea
                        required
                        value={farmDetails}
                        onChange={(e) => setFarmDetails(e.target.value)}
                        rows={2}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                        placeholder="Describe your farm - crop types, size, location, etc."
                      ></textarea>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Specific Concerns or Questions</label>
                      <textarea
                        required
                        value={specificConcerns}
                        onChange={(e) => setSpecificConcerns(e.target.value)}
                        rows={3}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                        placeholder="What specific fertilizer or soil issues would you like the expert to address?"
                      ></textarea>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Consultation Fee</p>
                      <p className="text-sm text-gray-500">30 minutes: $25</p>
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`px-4 py-2 ${
                        isSubmitting 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-green-600 hover:bg-green-700'
                      } text-white rounded-md transition-colors`}
                    >
                      {isSubmitting ? 'Booking...' : 'Book Consultation'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
          
          {activeTab === 'experts' && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-800 mb-2">Our Expert Network</h2>
                <p className="text-sm text-gray-600">
                  Meet our network of agricultural experts specializing in various aspects of fertilizer management and soil health.
                </p>
              </div>
              
              {specializations.map(specialization => (
                <div key={specialization} className="mb-6">
                  <h3 className="font-medium text-gray-800 border-b border-gray-200 pb-2 mb-4">{specialization} Specialists</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {expertsBySpecialization[specialization].map((expert, index) => (
                      <div key={index} className="border border-gray-200 rounded-md overflow-hidden">
                        <div className="bg-gray-50 p-4 flex items-center">
                          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-800 font-bold text-lg mr-3">
                            {expert.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">{expert.name}</h4>
                            <p className="text-xs text-gray-500">{expert.expertise}</p>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center mb-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              expert.available 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {expert.available ? 'Available' : 'Currently Busy'}
                            </span>
                          </div>
                          
                          <button 
                            className={`w-full px-4 py-2 border text-sm rounded-md ${
                              expert.available
                                ? 'border-green-500 text-green-600 hover:bg-green-50'
                                : 'border-gray-300 text-gray-400 cursor-not-allowed'
                            }`}
                            disabled={!expert.available}
                            onClick={() => {
                              if (expert.available) {
                                setActiveTab('book');
                                setConsultationType(expert.expertise);
                              }
                            }}
                          >
                            Schedule Consultation
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {activeTab === 'history' && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-800 mb-2">Your Consultation History</h2>
                <p className="text-sm text-gray-600">
                  Access records of your previous consultations and follow-up recommendations.
                </p>
              </div>
              
              {/* Mock consultation history */}
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-md overflow-hidden">
                  <div className="bg-gray-50 p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-800">Soil Nutrient Management</h3>
                      <p className="text-xs text-gray-500">Dr. Emma Thompson • 2025-07-15</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Completed
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Key Recommendations:</h4>
                      <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                        <li>Increase phosphorus application by 15% based on soil test results</li>
                        <li>Apply calcium nitrate instead of urea during flowering stage</li>
                        <li>Consider adding organic matter to improve soil structure</li>
                      </ul>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200">
                        Download Report
                      </button>
                      <button className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700">
                        Follow-up
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-md overflow-hidden">
                  <div className="bg-gray-50 p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-800">Crop-Specific Fertilizer Plan</h3>
                      <p className="text-xs text-gray-500">Dr. Michael Lee • 2025-06-03</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Completed
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Key Recommendations:</h4>
                      <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                        <li>Custom fertilizer blend 17-8-22 for your maize fields</li>
                        <li>Split nitrogen application into 3 phases</li>
                        <li>Foliar application of micronutrients at V6 stage</li>
                      </ul>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200">
                        Download Report
                      </button>
                      <button className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700">
                        Follow-up
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-md overflow-hidden">
                  <div className="bg-gray-50 p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-800">Fertilizer Cost Optimization</h3>
                      <p className="text-xs text-gray-500">Dr. Sarah Johnson • 2025-05-12</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Follow-up Scheduled
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Key Recommendations:</h4>
                      <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                        <li>Switch to bulk purchasing from Supplier XYZ</li>
                        <li>Implement precision application to reduce waste by 22%</li>
                        <li>Consider biofertilizer supplements to reduce chemical inputs</li>
                      </ul>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200">
                        Download Report
                      </button>
                      <button className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700">
                        View Follow-up
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-center">
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                  View All Consultations
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-medium text-gray-800 mb-3">Benefits of Expert Consultation</h2>
            <ul className="space-y-2">
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700">
                  <strong className="text-gray-800">Personalized Recommendations:</strong> Get advice tailored to your specific soil type, crop, and farming conditions
                </span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700">
                  <strong className="text-gray-800">Problem Diagnosis:</strong> Identify nutrient deficiencies and soil issues with expert analysis
                </span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700">
                  <strong className="text-gray-800">Cost Optimization:</strong> Learn strategies to reduce fertilizer costs while maintaining or improving yields
                </span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700">
                  <strong className="text-gray-800">Long-term Planning:</strong> Develop sustainable fertilizer management plans for multiple seasons
                </span>
              </li>
            </ul>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-lg font-medium text-gray-800 mb-3">How It Works</h2>
            <ol className="space-y-3">
              <li className="flex">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-200 text-green-800 flex items-center justify-center font-bold text-sm mr-3">
                  1
                </div>
                <p className="text-sm text-gray-700">
                  <span className="font-medium text-gray-800">Book a consultation</span> - Select your preferred expert, date and time
                </p>
              </li>
              <li className="flex">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-200 text-green-800 flex items-center justify-center font-bold text-sm mr-3">
                  2
                </div>
                <p className="text-sm text-gray-700">
                  <span className="font-medium text-gray-800">Prepare your information</span> - Upload soil test results and photos if available
                </p>
              </li>
              <li className="flex">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-200 text-green-800 flex items-center justify-center font-bold text-sm mr-3">
                  3
                </div>
                <p className="text-sm text-gray-700">
                  <span className="font-medium text-gray-800">Attend the consultation</span> - Connect via video call, audio call or in-person
                </p>
              </li>
              <li className="flex">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-200 text-green-800 flex items-center justify-center font-bold text-sm mr-3">
                  4
                </div>
                <p className="text-sm text-gray-700">
                  <span className="font-medium text-gray-800">Receive recommendations</span> - Get detailed advice and a written report
                </p>
              </li>
              <li className="flex">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-200 text-green-800 flex items-center justify-center font-bold text-sm mr-3">
                  5
                </div>
                <p className="text-sm text-gray-700">
                  <span className="font-medium text-gray-800">Follow-up support</span> - Access ongoing assistance and monitoring
                </p>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertConsultation;