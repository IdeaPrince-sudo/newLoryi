import React, { useState } from 'react';
import { subsidyPrograms } from '../fertiWiseData';
import Guide from './Guide';

const SubsidyPrograms = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    idNumber: '',
    phoneNumber: '',
    email: '',
    farmName: '',
    farmSize: '',
    primaryCrops: '',
    locationDistrict: '',
    farmAddress: '',
    fertilizerType: '',
    quantityRequired: '',
    subsidyBenefit: '',
    proofOfLand: null,
    idDocument: null,
    registrationCertificate: null,
    declarationAccepted: false,
  });

  // Extract unique regions and types for filters
  const regions = [...new Set(subsidyPrograms.map(program => program.region))];
  const types = [...new Set(subsidyPrograms.map(program => program.type))];

  // Apply filters to programs
  const filteredPrograms = subsidyPrograms.filter(program => {
    const matchesSearch =
      program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = filterRegion === '' || program.region === filterRegion;
    const matchesType = filterType === '' || program.type === filterType;

    return matchesSearch && matchesRegion && matchesType;
  });

  // Format date for display
  const formatDate = dateString => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle program application
  const handleApplyForProgram = program => {
    setSelectedProgram(program);
    setShowApplicationForm(true);
    // Reset form data when opening form
    setFormData({
      fullName: '',
      idNumber: '',
      phoneNumber: '',
      email: '',
      farmName: '',
      farmSize: '',
      primaryCrops: '',
      locationDistrict: '',
      farmAddress: '',
      fertilizerType: '',
      quantityRequired: '',
      subsidyBenefit: '',
      proofOfLand: null,
      idDocument: null,
      registrationCertificate: null,
      declarationAccepted: false,
    });
  };

  // Handle form input changes
  const handleInputChange = e => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle application submission
  const handleSubmitApplication = e => {
    e.preventDefault();

    // Simple validation example: check declaration accepted
    if (!formData.declarationAccepted) {
      alert('Please accept the declaration before submitting.');
      return;
    }

    // In real app, send formData + selectedProgram info to backend API here.
    // For demo, just alert success with basic info.

    alert(`Your application for ${selectedProgram.name} has been submitted successfully!
You will receive a confirmation email shortly.`);

    setShowApplicationForm(false);
    setSelectedProgram(null);
  };

  // Calculate application status
  const getApplicationStatus = deadline => {
    const today = new Date();
    const deadlineDate = new Date(deadline);

    if (deadlineDate < today) {
      return 'Closed';
    }

    const daysRemaining = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));

    if (daysRemaining <= 7) {
      return 'Closing Soon';
    }

    return 'Open';
  };

  // Get status class for styling
  const getStatusClass = status => {
    switch (status) {
      case 'Open':
        return 'bg-green-100 text-green-800';
      case 'Closing Soon':
        return 'bg-yellow-100 text-yellow-800';
      case 'Closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Fertilizer Subsidy Programs</h1>

      {showApplicationForm ? (
        <div className="bg-white p-6 rounded-lg shadow-sm max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800">Apply for {selectedProgram.name}</h2>
            <button
              onClick={() => setShowApplicationForm(false)}
              className="text-gray-400 hover:text-gray-500"
              aria-label="Close application form"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <h3 className="font-medium text-gray-800 mb-2">Program Details</h3>
            <p className="text-sm text-gray-600 mb-2">{selectedProgram.description}</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">Region:</span> {selectedProgram.region}
              </div>
              <div>
                <span className="font-medium">Type:</span> {selectedProgram.type}
              </div>
              <div>
                <span className="font-medium">Benefit Amount:</span> {selectedProgram.benefitAmount}
              </div>
              <div>
                <span className="font-medium">Application Deadline:</span> {formatDate(selectedProgram.applicationDeadline)}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmitApplication} className="space-y-6">
            {/* 1. Personal Information */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-base font-medium text-gray-800 mb-4">1. Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    ID Number
                  </label>
                  <input
                    type="text"
                    id="idNumber"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleInputChange}
                    required
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    required
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* 2. Farm Information */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-base font-medium text-gray-800 mb-4">2. Farm Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="farmName" className="block text-sm font-medium text-gray-700 mb-1">
                    Farm Name
                  </label>
                  <input
                    type="text"
                    id="farmName"
                    name="farmName"
                    value={formData.farmName}
                    onChange={handleInputChange}
                    required
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label htmlFor="farmSize" className="block text-sm font-medium text-gray-700 mb-1">
                    Farm Size (hectares)
                  </label>
                  <input
                    type="number"
                    id="farmSize"
                    name="farmSize"
                    value={formData.farmSize}
                    onChange={handleInputChange}
                    min="0.1"
                    step="0.1"
                    required
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label htmlFor="primaryCrops" className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Crops
                  </label>
                  <input
                    type="text"
                    id="primaryCrops"
                    name="primaryCrops"
                    value={formData.primaryCrops}
                    onChange={handleInputChange}
                    required
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label htmlFor="locationDistrict" className="block text-sm font-medium text-gray-700 mb-1">
                    Location/District
                  </label>
                  <input
                    type="text"
                    id="locationDistrict"
                    name="locationDistrict"
                    value={formData.locationDistrict}
                    onChange={handleInputChange}
                    required
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="farmAddress" className="block text-sm font-medium text-gray-700 mb-1">
                    Farm Address
                  </label>
                  <textarea
                    id="farmAddress"
                    name="farmAddress"
                    value={formData.farmAddress}
                    onChange={handleInputChange}
                    rows={2}
                    required
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* 3. Subsidy Request */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-base font-medium text-gray-800 mb-4">3. Subsidy Request</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fertilizerType" className="block text-sm font-medium text-gray-700 mb-1">
                    Fertilizer Type Needed
                  </label>
                  <select
                    id="fertilizerType"
                    name="fertilizerType"
                    value={formData.fertilizerType}
                    onChange={handleInputChange}
                    required
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                  >
                    <option value="">Select Fertilizer Type</option>
                    <option value="NPK">NPK</option>
                    <option value="Urea">Urea</option>
                    <option value="DAP">DAP</option>
                    <option value="MOP">MOP (Potash)</option>
                    <option value="TSP">TSP (Triple Super Phosphate)</option>
                    <option value="Multiple">Multiple Types</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="quantityRequired" className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity Required (kg)
                  </label>
                  <input
                    type="number"
                    id="quantityRequired"
                    name="quantityRequired"
                    value={formData.quantityRequired}
                    onChange={handleInputChange}
                    min="1"
                    required
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="subsidyBenefit" className="block text-sm font-medium text-gray-700 mb-1">
                    How will this subsidy benefit your farm?
                  </label>
                  <textarea
                    id="subsidyBenefit"
                    name="subsidyBenefit"
                    value={formData.subsidyBenefit}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Please briefly explain how this subsidy will help improve your agricultural productivity..."
                    required
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* 4. Required Documents */}
            <div>
              <h3 className="text-base font-medium text-gray-800 mb-4">4. Required Documents</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="proofOfLand" className="block text-sm font-medium text-gray-700 mb-1">
                    Proof of Land Ownership/Lease
                  </label>
                  <input
                    type="file"
                    id="proofOfLand"
                    name="proofOfLand"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleInputChange}
                    required
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-green-50 file:text-green-700
                      hover:file:bg-green-100"
                  />
                </div>
                <div>
                  <label htmlFor="idDocument" className="block text-sm font-medium text-gray-700 mb-1">
                    Identification Document
                  </label>
                  <input
                    type="file"
                    id="idDocument"
                    name="idDocument"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleInputChange}
                    required
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-green-50 file:text-green-700
                      hover:file:bg-green-100"
                  />
                </div>
                <div>
                  <label htmlFor="registrationCertificate" className="block text-sm font-medium text-gray-700 mb-1">
                    Farmer Registration Certificate (if applicable)
                  </label>
                  <input
                    type="file"
                    id="registrationCertificate"
                    name="registrationCertificate"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleInputChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-green-50 file:text-green-700
                      hover:file:bg-green-100"
                  />
                </div>
              </div>
            </div>

            {/* Declaration */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  id="declarationAccepted"
                  name="declarationAccepted"
                  checked={formData.declarationAccepted}
                  onChange={handleInputChange}
                  required
                  className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="declarationAccepted" className="font-medium text-gray-700 cursor-pointer">
                  Declaration
                </label>
                <p className="text-gray-500">
                  I hereby declare that the information provided is true and accurate. I understand that providing false information may result in disqualification from the program and potential legal action.
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Submit Application
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-6">
              <div className="flex-1 max-w-lg">
                <label htmlFor="search" className="sr-only">
                  Search Programs
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    id="search"
                    name="search"
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search subsidy programs..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                <select
                  value={filterRegion}
                  onChange={e => setFilterRegion(e.target.value)}
                  className="border rounded-md px-2 py-2"
                >
                  <option value="">All Regions</option>
                  {(regions || []).map((r, i) => (
                    <option key={r || i} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  className="border rounded-md px-2 py-2"
                >
                  <option value="">All Types</option>
                  {(types || []).map((t, i) => (
                    <option key={t || i} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {filteredPrograms.length > 0 ? (
                filteredPrograms.map(program => {
                  const status = getApplicationStatus(program.applicationDeadline);
                  const statusClass = getStatusClass(status);

                  return (
                    <div key={program.id} className="border border-gray-200 rounded-md p-4">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                        <div>
                          <h3 className="text-lg font-medium text-gray-800">{program.name}</h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {program.region}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {program.type}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
                              {status}
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 md:mt-0">
                          <button
                            onClick={() => handleApplyForProgram(program)}
                            disabled={status === 'Closed'}
                            className={`px-4 py-2 rounded-md text-white ${
                              status === 'Closed' ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                            }`}
                          >
                            {status === 'Closed' ? 'Applications Closed' : 'Apply Now'}
                          </button>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mt-3">{program.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Benefit Amount:</span>
                          <span className="text-gray-600 ml-1">{program.benefitAmount}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Eligibility:</span>
                          <span className="text-gray-600 ml-1">{program.eligibilitySummary}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Deadline:</span>
                          <span className="text-gray-600 ml-1">{formatDate(program.applicationDeadline)}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Required Documents:</h4>
                        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                          {program.requiredDocuments?.length > 0 ? (
                            program.requiredDocuments.map((doc, index) => <li key={index}>{doc}</li>)
                          ) : (
                            <li>No documents listed</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-gray-50 p-6 text-center rounded-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mx-auto text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No subsidy programs found</h3>
                  <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
                </div>
              )}
            </div>
          </div>

          <Guide />
        </>
      )}
    </div>
  );
};

export default SubsidyPrograms;
