import React, { useState } from 'react';

const ScanDiagnose = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [searchParams, setSearchParams] = useState({
    cropType: '',
    diseaseName: '',
    severityLevel: 'all'
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleScan = () => {
    if (!file) return;
    
    setScanning(true);
    
    // Simulate API scan process
    setTimeout(() => {
      const mockResults = {
        diseaseName: 'Powdery Mildew',
        scientificName: 'Erysiphe cichoracearum',
        confidence: 92.4,
        severity: 'Moderate',
        affectedCrops: ['Cucumber', 'Squash', 'Zucchini', 'Pumpkin'],
        description: 'Powdery mildew is a fungal disease that appears as a white powdery substance on the leaves, stems, and sometimes fruit of infected plants.',
        symptoms: [
          'White powdery spots on leaves and stems',
          'Yellowing of leaves',
          'Leaf curling and distortion',
          'Premature leaf drop',
          'Stunted growth',
          'Reduced yield'
        ],
        causes: [
          'Fungal spores spread by wind',
          'Warm days and cool nights',
          'High humidity but dry leaf surfaces',
          'Poor air circulation',
          'Overcrowded plants'
        ],
        treatments: [
          'Remove and destroy infected plant parts',
          'Apply fungicides containing sulfur or potassium bicarbonate',
          'Use neem oil or other organic fungicides',
          'Improve air circulation around plants',
          'Water at the base of plants, avoiding wetting the foliage'
        ],
        preventionTips: [
          'Plant resistant varieties',
          'Ensure proper spacing between plants',
          'Avoid overhead watering',
          'Rotate crops annually',
          'Clean garden tools between uses'
        ],
        date: new Date().toISOString(),
        imageUrl: preview
      };
      
      setScanResults(mockResults);
      setScanning(false);
    }, 2000);
  };

  const handleClearScan = () => {
    setFile(null);
    setPreview(null);
    setScanResults(null);
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams({
      ...searchParams,
      [name]: value
    });
  };

  const handleGeneratePDF = () => {
    alert('PDF report generation functionality will be implemented here');
  };

  return (
    <div>
      {!scanResults ? (
        <div>
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Scan & Diagnose Crop Disease</h2>
            <p className="text-gray-600">
              Upload an image of your affected crop for AI-powered disease identification and treatment recommendations.
            </p>
          </div>
          
          {/* Upload Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="flex flex-col">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                {preview ? (
                  <div className="mb-4 w-full">
                    <img src={preview} alt="Preview" className="max-h-56 mx-auto object-cover rounded" />
                  </div>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-gray-400 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                )}
                
                <label className="flex flex-col items-center justify-center w-full cursor-pointer">
                  <span className="text-sm font-medium text-orange-600 mb-2">
                    {preview ? 'Change image' : 'Upload an image'}
                  </span>
                  <span className="text-xs text-gray-500">PNG, JPG up to 5MB</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={handleScan}
                  disabled={!file || scanning}
                  className={`px-4 py-2 rounded-md shadow-sm flex-1 flex items-center justify-center ${
                    !file || scanning ? 'bg-gray-300 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700 text-white'
                  }`}
                >
                  {scanning ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Scanning...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Scan Now
                    </>
                  )}
                </button>
                <button
                  onClick={handleClearScan}
                  disabled={!file || scanning}
                  className={`px-4 py-2 rounded-md shadow-sm ${
                    !file || scanning ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Clear
                </button>
              </div>
            </div>
            
            {/* Search Options */}
            <div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-md font-medium text-gray-900 mb-4">Search Disease Database</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="cropType" className="block text-sm font-medium text-gray-700 mb-1">
                      Search by Crop
                    </label>
                    <select
                      id="cropType"
                      name="cropType"
                      value={searchParams.cropType}
                      onChange={handleSearchChange}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="">Select crop type</option>
                      <option value="tomato">Tomato</option>
                      <option value="potato">Potato</option>
                      <option value="corn">Corn</option>
                      <option value="wheat">Wheat</option>
                      <option value="rice">Rice</option>
                      <option value="cucumber">Cucumber</option>
                      <option value="pepper">Pepper</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="diseaseName" className="block text-sm font-medium text-gray-700 mb-1">
                      Search by Disease Name
                    </label>
                    <input
                      type="text"
                      id="diseaseName"
                      name="diseaseName"
                      placeholder="E.g., Powdery Mildew, Rust, Blight"
                      value={searchParams.diseaseName}
                      onChange={handleSearchChange}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="severityLevel" className="block text-sm font-medium text-gray-700 mb-1">
                      Filter by Severity
                    </label>
                    <select
                      id="severityLevel"
                      name="severityLevel"
                      value={searchParams.severityLevel}
                      onChange={handleSearchChange}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="all">All Severities</option>
                      <option value="low">Low</option>
                      <option value="moderate">Moderate</option>
                      <option value="high">High</option>
                      <option value="severe">Severe</option>
                    </select>
                  </div>
                  
                  <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md shadow-sm flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search Database
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Tip</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    For best results, take close-up photos in good lighting. Make sure the affected area is clearly visible and centered in the frame.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Diagnosis Results</h2>
              <p className="text-gray-600">Scan completed on {new Date().toLocaleDateString()}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleGeneratePDF}
                className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 transition duration-150 ease-in-out flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Generate PDF
              </button>
              <button
                onClick={handleClearScan}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md shadow-sm hover:bg-gray-200 transition duration-150 ease-in-out"
              >
                New Scan
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-md font-medium text-gray-900">Uploaded Image</h3>
                </div>
                <div className="p-4">
                  <img src={scanResults.imageUrl} alt="Scanned Plant" className="w-full h-auto rounded-lg" />
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow mt-6">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-md font-medium text-gray-900">Scan Summary</h3>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Disease:</span>
                    <span className="text-sm font-medium">{scanResults.diseaseName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Scientific Name:</span>
                    <span className="text-sm font-italic">{scanResults.scientificName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Confidence:</span>
                    <span className="text-sm font-medium">{scanResults.confidence}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Severity:</span>
                    <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                      scanResults.severity === 'Low' ? 'bg-green-100 text-green-800' :
                      scanResults.severity === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                      scanResults.severity === 'High' ? 'bg-orange-100 text-orange-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {scanResults.severity}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">Affected Crops:</span>
                    <div className="flex flex-wrap gap-1">
                      {scanResults.affectedCrops.map((crop, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {crop}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-md font-medium text-gray-900">Disease Information</h3>
                </div>
                <div className="p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-sm text-gray-600 mb-4">{scanResults.description}</p>
                  
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Symptoms</h4>
                  <ul className="list-disc pl-5 text-sm text-gray-600 mb-4">
                    {scanResults.symptoms.map((symptom, index) => (
                      <li key={index} className="mb-1">{symptom}</li>
                    ))}
                  </ul>
                  
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Causes</h4>
                  <ul className="list-disc pl-5 text-sm text-gray-600 mb-4">
                    {scanResults.causes.map((cause, index) => (
                      <li key={index} className="mb-1">{cause}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow mt-6">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-md font-medium text-gray-900">Recommended Treatments</h3>
                </div>
                <div className="p-4">
                  <ul className="list-disc pl-5 text-sm text-gray-600 mb-4">
                    {scanResults.treatments.map((treatment, index) => (
                      <li key={index} className="mb-1">{treatment}</li>
                    ))}
                  </ul>
                  
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Prevention Tips</h4>
                  <ul className="list-disc pl-5 text-sm text-gray-600">
                    {scanResults.preventionTips.map((tip, index) => (
                      <li key={index} className="mb-1">{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow mt-6">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-md font-medium text-gray-900">Treatment Videos</h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-gray-200 rounded-lg p-3">
                      <div className="bg-gray-100 rounded aspect-w-16 aspect-h-9 flex items-center justify-center mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h5 className="text-sm font-medium">How to Treat Powdery Mildew Organically</h5>
                      <p className="text-xs text-gray-500">5:24 • University Extension</p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-3">
                      <div className="bg-gray-100 rounded aspect-w-16 aspect-h-9 flex items-center justify-center mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h5 className="text-sm font-medium">Prevention Strategies for Cucurbit Diseases</h5>
                      <p className="text-xs text-gray-500">7:12 • AgTech Academy</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScanDiagnose;