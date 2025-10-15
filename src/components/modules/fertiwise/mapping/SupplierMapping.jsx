import React, { useState } from 'react';
import { certifiedSuppliers, counterfeitReports } from '../fertiWiseData';

const SupplierMapping = () => {
  const [activeTab, setActiveTab] = useState('suppliers');
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
  
  // Get selected supplier or report data
  const selectedSupplier = certifiedSuppliers.find(s => s.id === selectedSupplierId);
  const selectedReport = counterfeitReports.find(r => r.id === selectedReportId);
  
  // Find certification level class
  const getCertificationClass = (level) => {
    switch (level) {
      case 'Gold': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Silver': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'Bronze': return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };
  
  // Find severity class for counterfeit reports
  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'High': return 'bg-red-100 text-red-800 border-red-300';
      case 'Medium': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Low': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Toggle map/list view
  const toggleViewMode = () => {
    setViewMode(viewMode === 'map' ? 'list' : 'map');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Supplier & Counterfeit Mapping</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'suppliers'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Certified Suppliers
            </button>
            <button
              onClick={() => setActiveTab('counterfeit')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'counterfeit'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Counterfeit Reports
            </button>
          </div>
          
          <div className="flex items-center">
            <button
              onClick={toggleViewMode}
              className="flex items-center px-3 py-1 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              {viewMode === 'map' ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  List View
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Map View
                </>
              )}
            </button>
          </div>
        </div>
        
        {viewMode === 'map' ? (
          <div className="relative">
            {/* Placeholder for map - in a real application, this would be replaced with a map component */}
            <div className="bg-gray-100 h-96 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <p className="mt-2 text-gray-500">Map View</p>
                <p className="text-sm text-gray-400">
                  {activeTab === 'suppliers'
                    ? `Showing ${certifiedSuppliers.length} certified suppliers`
                    : `Showing ${counterfeitReports.length} counterfeit reports`}
                </p>
              </div>
            </div>
            
            {/* Map legend */}
            <div className="absolute top-4 right-4 bg-white p-3 rounded-md shadow-md">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Legend</h3>
              <div className="space-y-1">
                {activeTab === 'suppliers' ? (
                  <>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-xs">Gold Certified</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                      <span className="text-xs">Silver Certified</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-orange-500 mr-2"></div>
                      <span className="text-xs">Bronze Certified</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                      <span className="text-xs">High Severity</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-amber-500 mr-2"></div>
                      <span className="text-xs">Medium Severity</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
                      <span className="text-xs">Low Severity</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {activeTab === 'suppliers' ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Certification</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categories</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {certifiedSuppliers.map(supplier => (
                    <tr key={supplier.id} className={selectedSupplierId === supplier.id ? 'bg-green-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                        <div className="text-xs text-gray-500">
                          Supply Chain Score: {supplier.supplyChainScore}/100
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getCertificationClass(supplier.certificationLevel)}`}>
                          {supplier.certificationLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900 mr-2">{supplier.ratings}</span>
                          <div className="text-yellow-400">★★★★★</div>
                          <span className="ml-1 text-xs text-gray-500">({supplier.reviewCount})</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {supplier.productCategories.map((category, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-100 text-xs rounded-full">
                              {category}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button 
                          onClick={() => setSelectedSupplierId(supplier.id === selectedSupplierId ? null : supplier.id)}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          Details
                        </button>
                        <button className="text-blue-600 hover:text-blue-900">
                          Contact
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Reported</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {counterfeitReports.map(report => (
                    <tr key={report.id} className={selectedReportId === report.id ? 'bg-red-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{report.productName}</div>
                        <div className="text-xs text-gray-500">
                          Reported by: {report.reporterType}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.reportDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getSeverityClass(report.severity)}`}>
                          {report.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          report.status === 'Verified' 
                            ? 'bg-green-100 text-green-800 border border-green-300' 
                            : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                        }`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button 
                          onClick={() => setSelectedReportId(report.id === selectedReportId ? null : report.id)}
                          className="text-red-600 hover:text-red-900 mr-3"
                        >
                          Details
                        </button>
                        <button className="text-blue-600 hover:text-blue-900">
                          Report
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
      
      {/* Detail panel for selected supplier or report */}
      {(selectedSupplier || selectedReport) && (
        <div className={`bg-white p-6 rounded-lg shadow-sm border-l-4 ${
          selectedSupplier ? 'border-green-500' : 'border-red-500'
        }`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800">
              {selectedSupplier ? 'Supplier Details' : 'Counterfeit Report Details'}
            </h2>
            <button 
              onClick={() => selectedSupplier ? setSelectedSupplierId(null) : setSelectedReportId(null)}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {selectedSupplier && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Company Information</h3>
                <p className="text-sm"><span className="font-medium">Name:</span> {selectedSupplier.name}</p>
                <p className="text-sm"><span className="font-medium">Location:</span> Lat: {selectedSupplier.location.lat.toFixed(4)}, Lng: {selectedSupplier.location.lng.toFixed(4)}</p>
                <p className="text-sm"><span className="font-medium">Certification:</span> {selectedSupplier.certificationLevel}</p>
                <p className="text-sm"><span className="font-medium">Verification Status:</span> {selectedSupplier.verificationStatus}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Contact Information</h3>
                <p className="text-sm"><span className="font-medium">Phone:</span> {selectedSupplier.contactInfo.phone}</p>
                <p className="text-sm"><span className="font-medium">Email:</span> {selectedSupplier.contactInfo.email}</p>
                <p className="text-sm"><span className="font-medium">Website:</span> {selectedSupplier.contactInfo.website}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Product Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedSupplier.productCategories.map((category, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-100 text-sm rounded-full">
                      {category}
                    </span>
                  ))}
                </div>
                
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Ratings & Reviews</h3>
                  <div className="flex items-center">
                    <span className="text-lg font-bold text-gray-900 mr-2">{selectedSupplier.ratings}</span>
                    <div className="text-yellow-400 text-lg">★★★★★</div>
                    <span className="ml-1 text-sm text-gray-500">({selectedSupplier.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-3">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Supply Chain Transparency</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="mb-2">
                    <span className="font-medium">Supply Chain Score: </span>
                    <span className={`${
                      selectedSupplier.supplyChainScore >= 90 ? 'text-green-600' : 
                      selectedSupplier.supplyChainScore >= 70 ? 'text-yellow-600' : 
                      'text-red-600'
                    }`}>
                      {selectedSupplier.supplyChainScore}/100
                    </span>
                  </div>
                  
                  <div className="h-2 w-full bg-gray-200 rounded-full mb-4">
                    <div 
                      className={`h-full rounded-full ${
                        selectedSupplier.supplyChainScore >= 90 ? 'bg-green-500' : 
                        selectedSupplier.supplyChainScore >= 70 ? 'bg-yellow-500' : 
                        'bg-red-500'
                      }`}
                      style={{ width: `${selectedSupplier.supplyChainScore}%` }}
                    ></div>
                  </div>
                  
                  <p className="text-sm text-gray-600">
                    This supplier provides full traceability from manufacturing to distribution. 
                    Scan the QR code on their products to verify authenticity and track the product journey.
                  </p>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors mr-3">
                    Verify Products
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                    Contact Supplier
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {selectedReport && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Report Information</h3>
                <p className="text-sm"><span className="font-medium">Product:</span> {selectedReport.productName}</p>
                <p className="text-sm"><span className="font-medium">Reported On:</span> {selectedReport.reportDate}</p>
                <p className="text-sm"><span className="font-medium">Reported By:</span> {selectedReport.reporterType}</p>
                <p className="text-sm"><span className="font-medium">Location:</span> Lat: {selectedReport.location.lat.toFixed(4)}, Lng: {selectedReport.location.lng.toFixed(4)}</p>
                <p className="text-sm"><span className="font-medium">Severity:</span> <span className={
                  selectedReport.severity === 'High' ? 'text-red-600' : 
                  selectedReport.severity === 'Medium' ? 'text-amber-600' : 
                  'text-yellow-600'
                }>{selectedReport.severity}</span></p>
                <p className="text-sm"><span className="font-medium">Status:</span> <span className={
                  selectedReport.status === 'Verified' ? 'text-green-600' : 'text-yellow-600'
                }>{selectedReport.status}</span></p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Report Details</h3>
                <p className="text-sm mb-2"><span className="font-medium">Description:</span></p>
                <p className="text-sm bg-gray-50 p-3 rounded-md">{selectedReport.description}</p>
                
                <div className="mt-4">
                  <p className="text-sm"><span className="font-medium">Affected Area:</span> {selectedReport.affectedArea}</p>
                  <p className="text-sm"><span className="font-medium">Action Taken:</span> {selectedReport.actionTaken}</p>
                </div>
              </div>
              
              <div className="md:col-span-2 border-t border-gray-100 pt-4">
                <div className="bg-red-50 p-4 rounded-md">
                  <h3 className="font-medium text-red-800 mb-2">Warning to Farmers</h3>
                  <p className="text-sm text-gray-700">
                    This counterfeit product has been reported in your region. Please verify fertilizer authenticity before purchasing. 
                    Look for official certification marks, check the QR code, and buy only from verified suppliers.
                  </p>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors mr-3">
                    Share Alert
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                    Report Similar Case
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Supply Chain Transparency</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-800 mb-3">Verify Product Authenticity</h3>
            <div className="bg-gray-50 p-4 rounded-md flex items-center">
              <div className="flex-shrink-0 mr-4 p-2 border-2 border-dashed border-gray-300 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-700 mb-3">
                  Scan the QR code on your fertilizer packaging to verify authenticity and track its journey from manufacturer to distributor.
                </p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Scan QR Code
                </button>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-800 mb-3">Report Suspected Counterfeit</h3>
            <div className="bg-red-50 p-4 rounded-md">
              <p className="text-sm text-gray-700 mb-3">
                If you suspect you've encountered counterfeit fertilizer, please report it to help protect other farmers in your community.
              </p>
              <div className="flex space-x-2">
                <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                  Report Counterfeit
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 transition-colors">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierMapping;