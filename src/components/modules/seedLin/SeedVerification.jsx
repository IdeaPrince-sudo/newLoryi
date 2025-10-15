import React, { useState } from 'react';

const SeedVerification = () => {
  const [activeTab, setActiveTab] = useState('qrScanner');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [qrInput, setQrInput] = useState('');
  const [batchInput, setBatchInput] = useState('');

  // Mock verification function
  const verifySeed = (method, input) => {
    setIsVerifying(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsVerifying(false);
      
      // Mock result
      if (input && input.length > 3) {
        setVerificationResult({
          verified: true,
          seedType: 'Organic Corn',
          supplier: 'EcoSeed Organics',
          batchNumber: input,
          certifications: ['USDA Organic', 'Non-GMO Project Verified'],
          plantingRegions: ['North America', 'Europe'],
          lastVerifiedDate: '2025-07-20',
          blockchainId: '0x3a8d7b5e9f6c2d1e0b7a4f3c2d1e0b7a4f3c2d1e'
        });
      } else {
        setVerificationResult({
          verified: false,
          message: 'Seed verification failed. The provided code or batch number is not recognized in our system.'
        });
      }
    }, 1500);
  };

  const handleQrSubmit = (e) => {
    e.preventDefault();
    verifySeed('qr', qrInput);
  };

  const handleBatchSubmit = (e) => {
    e.preventDefault();
    verifySeed('batch', batchInput);
  };

  const renderVerificationResult = () => {
    if (!verificationResult) return null;

    return (
      <div className={`mt-8 p-6 rounded-lg border-2 ${verificationResult.verified ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
        {verificationResult.verified ? (
          <>
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-2 rounded-full">
                <svg className="h-6 w-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="ml-3 text-xl font-bold text-green-800">Verification Successful</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-lg mb-2">Seed Information</h4>
                <ul className="space-y-2">
                  <li className="flex">
                    <span className="font-medium w-32">Seed Type:</span>
                    <span>{verificationResult.seedType}</span>
                  </li>
                  <li className="flex">
                    <span className="font-medium w-32">Supplier:</span>
                    <span>{verificationResult.supplier}</span>
                  </li>
                  <li className="flex">
                    <span className="font-medium w-32">Batch Number:</span>
                    <span>{verificationResult.batchNumber}</span>
                  </li>
                  <li className="flex">
                    <span className="font-medium w-32">Last Verified:</span>
                    <span>{verificationResult.lastVerifiedDate}</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold text-lg mb-2">Certifications</h4>
                <div className="flex flex-wrap gap-2">
                  {verificationResult.certifications.map((cert, index) => (
                    <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      {cert}
                    </span>
                  ))}
                </div>
                
                <h4 className="font-bold text-lg mt-4 mb-2">Planting Regions</h4>
                <div className="flex flex-wrap gap-2">
                  {verificationResult.plantingRegions.map((region, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {region}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-green-200">
              <h4 className="font-bold text-lg mb-2">Blockchain Verification</h4>
              <div className="bg-gray-100 p-3 rounded font-mono text-sm break-all">
                {verificationResult.blockchainId}
              </div>
              <a href="#" className="text-blue-600 hover:underline mt-2 inline-block">
                View blockchain details
              </a>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded">
                Download Verification Report
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-2 rounded-full">
                <svg className="h-6 w-6 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="ml-3 text-xl font-bold text-red-800">Verification Failed</h3>
            </div>
            <p className="text-red-700">{verificationResult.message}</p>
            <div className="mt-6 flex justify-end space-x-4">
              <button 
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
                onClick={() => setVerificationResult(null)}
              >
                Try Again
              </button>
              <button className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded">
                Report Issue
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Seed Verification</h1>
      <p className="text-gray-600 mb-8">
        Verify the authenticity and origin of your seeds using QR codes, barcodes, 
        or batch numbers. Our multi-source verification system ensures seed integrity.
      </p>

      {/* Verification Options */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b">
          <button 
            className={`px-6 py-3 text-lg font-medium ${activeTab === 'qrScanner' ? 'bg-green-50 text-green-700 border-b-2 border-green-700' : 'text-gray-600 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('qrScanner')}
          >
            QR/Barcode Scanner
          </button>
          <button 
            className={`px-6 py-3 text-lg font-medium ${activeTab === 'batchNumber' ? 'bg-green-50 text-green-700 border-b-2 border-green-700' : 'text-gray-600 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('batchNumber')}
          >
            Batch Number
          </button>
          <button 
            className={`px-6 py-3 text-lg font-medium ${activeTab === 'blockchain' ? 'bg-green-50 text-green-700 border-b-2 border-green-700' : 'text-gray-600 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('blockchain')}
          >
            Blockchain Lookup
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'qrScanner' && (
            <div>
              <h2 className="text-xl font-bold mb-4">QR/Barcode Scanner</h2>
              <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6 flex flex-col items-center justify-center">
                <svg className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-gray-500 mb-4">Use camera to scan QR code or barcode</p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                  Activate Camera
                </button>
              </div>
              
              <p className="text-gray-600 mb-4">Or enter the QR/barcode manually:</p>
              
              <form onSubmit={handleQrSubmit}>
                <div className="flex">
                  <input
                    type="text"
                    value={qrInput}
                    onChange={(e) => setQrInput(e.target.value)}
                    placeholder="Enter QR/barcode value"
                    className="flex-1 border border-gray-300 rounded-l px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button 
                    type="submit"
                    disabled={isVerifying}
                    className="bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-r flex items-center justify-center"
                  >
                    {isVerifying ? (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : 'Verify'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'batchNumber' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Batch Number Verification</h2>
              <p className="text-gray-600 mb-6">
                Enter the batch number printed on the seed package to verify its authenticity.
              </p>

              <form onSubmit={handleBatchSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="batchNumber" className="block text-gray-700 mb-2">Batch Number</label>
                    <input
                      id="batchNumber"
                      type="text"
                      value={batchInput}
                      onChange={(e) => setBatchInput(e.target.value)}
                      placeholder="e.g. ECO-2025-07-A12"
                      className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="seedType" className="block text-gray-700 mb-2">Seed Type (Optional)</label>
                    <select
                      id="seedType"
                      className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select seed type</option>
                      <option value="corn">Corn</option>
                      <option value="soybean">Soybean</option>
                      <option value="wheat">Wheat</option>
                      <option value="rice">Rice</option>
                      <option value="cotton">Cotton</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="pt-4">
                    <button 
                      type="submit"
                      disabled={isVerifying}
                      className="w-full bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded flex items-center justify-center"
                    >
                      {isVerifying ? (
                        <svg className="animate-spin h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : null}
                      {isVerifying ? 'Verifying...' : 'Verify Batch Number'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'blockchain' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Blockchain Verification</h2>
              <p className="text-gray-600 mb-6">
                Verify seed authenticity using the immutable blockchain record. Enter the blockchain ID 
                or hash to trace the complete history of the seed.
              </p>
              
              <form>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="blockchainId" className="block text-gray-700 mb-2">Blockchain ID / Hash</label>
                    <input
                      id="blockchainId"
                      type="text"
                      placeholder="e.g. 0x3a8d7b5e9f6c2d1e..."
                      className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div className="pt-4">
                    <button 
                      type="submit"
                      className="w-full bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded"
                    >
                      Verify Blockchain Record
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Verification Results */}
      {renderVerificationResult()}
    </div>
  );
};

export default SeedVerification;