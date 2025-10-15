import React, { useState } from 'react';

const AIAnalysis = () => {
  const [activeTab, setActiveTab] = useState('testkit');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Mock analysis function
  const analyzeImage = (file) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    // Simulate API call
    setTimeout(() => {
      setIsAnalyzing(false);
      
      // Mock result based on the active tab
      if (activeTab === 'testkit') {
        setAnalysisResult({
          success: true,
          testType: 'Lateral Flow Strip Test',
          gmoProbability: 0.03,
          conclusion: 'NEGATIVE',
          details: 'The test shows negative result for common GMO markers. The sample is likely organic or conventional.',
          recommendations: [
            'Sample is suitable for organic certification',
            'No further testing required for GMO compliance',
            'Store results in blockchain for traceability'
          ]
        });
      } else if (activeTab === 'morphology') {
        setAnalysisResult({
          success: true,
          seedType: 'Corn (Zea mays)',
          gmoProbability: 0.94,
          conclusion: 'GMO TRAITS DETECTED',
          details: 'Visual analysis detects morphological characteristics consistent with GMO corn varieties. Identified traits match with Bt insect resistance modifications.',
          anomalies: [
            'Uniform seed size exceeding natural variation',
            'Modified embryo structure',
            'Characteristic blue marker dye detected'
          ],
          recommendations: [
            'Confirm with DNA testing',
            'Not suitable for organic production',
            'Store in GMO-specific storage'
          ]
        });
      } else if (activeTab === 'pattern') {
        setAnalysisResult({
          success: true,
          seedBatch: 'Mixed Seeds',
          authenticity: 'SUSPICIOUS',
          counterfeiting: {
            probability: 0.78,
            indicators: [
              'Inconsistent coloration patterns',
              'Package code format mismatch',
              'QR code links to unauthorized domain'
            ]
          },
          recommendations: [
            'Report to authorities',
            'Do not plant or distribute',
            'Submit sample for forensic analysis'
          ]
        });
      }
    }, 2500);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleAnalyzeClick = () => {
    if (selectedFile) {
      analyzeImage(selectedFile);
    }
  };

  const renderAnalysisResult = () => {
    if (!analysisResult) return null;

    return (
      <div className="mt-8 p-6 rounded-lg border-2 border-blue-500 bg-blue-50">
        <div className="flex items-center mb-6">
          <div className="bg-blue-100 p-2 rounded-full">
            <svg className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="ml-3 text-xl font-bold text-blue-800">Analysis Results</h3>
        </div>
        
        <div className="bg-white rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-lg">
              {activeTab === 'testkit' ? 'Test Kit Analysis' : 
               activeTab === 'morphology' ? 'Seed Morphology Analysis' : 
               'Counterfeit Pattern Detection'}
            </h4>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              analysisResult.conclusion === 'NEGATIVE' || analysisResult.authenticity === 'VERIFIED' ? 
              'bg-green-100 text-green-800' : 
              'bg-red-100 text-red-800'
            }`}>
              {analysisResult.conclusion || analysisResult.authenticity}
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              {activeTab === 'testkit' && (
                <>
                  <div className="mb-4">
                    <span className="font-medium">Test Type:</span>
                    <span className="ml-2">{analysisResult.testType}</span>
                  </div>
                  <div className="mb-4">
                    <span className="font-medium">GMO Probability:</span>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${analysisResult.gmoProbability * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500">{(analysisResult.gmoProbability * 100).toFixed(1)}%</span>
                  </div>
                  <div className="mb-4">
                    <span className="font-medium">Details:</span>
                    <p className="mt-1 text-gray-600">{analysisResult.details}</p>
                  </div>
                </>
              )}
              
              {activeTab === 'morphology' && (
                <>
                  <div className="mb-4">
                    <span className="font-medium">Seed Type:</span>
                    <span className="ml-2">{analysisResult.seedType}</span>
                  </div>
                  <div className="mb-4">
                    <span className="font-medium">GMO Probability:</span>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-600 h-2 rounded-full" 
                        style={{ width: `${analysisResult.gmoProbability * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500">{(analysisResult.gmoProbability * 100).toFixed(1)}%</span>
                  </div>
                  <div className="mb-4">
                    <span className="font-medium">Details:</span>
                    <p className="mt-1 text-gray-600">{analysisResult.details}</p>
                  </div>
                </>
              )}
              
              {activeTab === 'pattern' && (
                <>
                  <div className="mb-4">
                    <span className="font-medium">Seed Batch:</span>
                    <span className="ml-2">{analysisResult.seedBatch}</span>
                  </div>
                  <div className="mb-4">
                    <span className="font-medium">Counterfeit Probability:</span>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-600 h-2 rounded-full" 
                        style={{ width: `${analysisResult.counterfeiting.probability * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {(analysisResult.counterfeiting.probability * 100).toFixed(1)}%
                    </span>
                  </div>
                </>
              )}
            </div>
            
            <div>
              {activeTab === 'testkit' && (
                <div>
                  <h5 className="font-medium mb-2">Recommendations:</h5>
                  <ul className="list-disc pl-5 space-y-1 text-gray-600">
                    {analysisResult.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {activeTab === 'morphology' && (
                <>
                  <h5 className="font-medium mb-2">Detected Anomalies:</h5>
                  <ul className="list-disc pl-5 space-y-1 text-gray-600 mb-4">
                    {analysisResult.anomalies.map((anomaly, index) => (
                      <li key={index}>{anomaly}</li>
                    ))}
                  </ul>
                  <h5 className="font-medium mb-2">Recommendations:</h5>
                  <ul className="list-disc pl-5 space-y-1 text-gray-600">
                    {analysisResult.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </>
              )}
              
              {activeTab === 'pattern' && (
                <>
                  <h5 className="font-medium mb-2">Counterfeit Indicators:</h5>
                  <ul className="list-disc pl-5 space-y-1 text-gray-600 mb-4">
                    {analysisResult.counterfeiting.indicators.map((indicator, index) => (
                      <li key={index}>{indicator}</li>
                    ))}
                  </ul>
                  <h5 className="font-medium mb-2">Recommendations:</h5>
                  <ul className="list-disc pl-5 space-y-1 text-gray-600">
                    {analysisResult.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-4">
          <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded">
            Download Report
          </button>
          <button className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded">
            Save to Records
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">AI & Image Analysis</h1>
      <p className="text-gray-600 mb-8">
        Use artificial intelligence to analyze seeds and testing kits. Our advanced AI can 
        detect GMO traits, authenticate seeds, and identify counterfeit products.
      </p>
      
      {/* Analysis Options */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b overflow-x-auto">
          <button 
            className={`px-6 py-3 text-lg font-medium whitespace-nowrap ${activeTab === 'testkit' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('testkit')}
          >
            Test Kit Reader
          </button>
          <button 
            className={`px-6 py-3 text-lg font-medium whitespace-nowrap ${activeTab === 'morphology' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('morphology')}
          >
            Seed Morphology
          </button>
          <button 
            className={`px-6 py-3 text-lg font-medium whitespace-nowrap ${activeTab === 'pattern' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('pattern')}
          >
            Pattern Detection
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {activeTab === 'testkit' && (
            <div>
              <h2 className="text-xl font-bold mb-4">AI Test Kit Reader</h2>
              <p className="text-gray-600 mb-6">
                Take a picture of your lateral flow or strip test, and our AI will interpret the 
                results for you. We support most common GMO test kit formats.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-blue-800 mb-2">How It Works</h3>
                <ol className="list-decimal pl-5 text-gray-700 space-y-2">
                  <li>Perform your test kit according to its instructions</li>
                  <li>Wait for the test to develop completely</li>
                  <li>Take a clear, well-lit photo of the test strip</li>
                  <li>Upload the image below for AI analysis</li>
                </ol>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                
                <h3 className="mt-4 text-lg font-medium text-gray-900">Upload Test Kit Image</h3>
                <p className="mt-1 text-sm text-gray-500">
                  PNG, JPG, or HEIC up to 10MB
                </p>
                
                <div className="mt-4">
                  <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    Select Image
                  </label>
                </div>
                
                {selectedFile && (
                  <div className="mt-4 text-sm text-gray-900">
                    Selected: {selectedFile.name}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'morphology' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Seed Morphology Detection</h2>
              <p className="text-gray-600 mb-6">
                Our AI can analyze physical traits of seeds to detect signs of genetic modification.
                Upload a clear, close-up image of seeds for analysis.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-bold text-lg mb-3">What We Detect</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-blue-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Unnatural uniformity in seed size and shape
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-blue-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Modified embryo structures and positions
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-blue-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Artificial coloration patterns
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-blue-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Presence of marker dyes or coatings
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-blue-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Comparisons against database of known GMO phenotypes
                    </li>
                  </ul>
                </div>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center flex flex-col justify-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Upload Seed Image</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Clear, close-up images work best
                  </p>
                  
                  <div className="mt-4">
                    <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      <input
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      Select Image
                    </label>
                  </div>
                  
                  {selectedFile && (
                    <div className="mt-4 text-sm text-gray-900">
                      Selected: {selectedFile.name}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pattern' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Counterfeit Pattern Detection</h2>
              <p className="text-gray-600 mb-6">
                Our deep learning models can detect suspicious or counterfeit seeds by analyzing 
                patterns in seed appearance, packaging, and documentation.
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <svg className="h-6 w-6 text-yellow-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h3 className="font-bold text-yellow-800">Counterfeit Warning</h3>
                    <p className="text-yellow-700 text-sm mt-1">
                      Counterfeit seeds can pose serious risks to agriculture, including:
                    </p>
                    <ul className="list-disc pl-5 text-yellow-700 text-sm mt-2">
                      <li>Poor germination and crop failure</li>
                      <li>Introduction of unauthorized GMOs</li>
                      <li>Contamination of organic fields</li>
                      <li>Spread of pests and diseases</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center flex flex-col justify-center">
                  <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                  
                  <h3 className="mt-2 text-lg font-medium text-gray-900">Seed Image</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Upload close-up of seeds
                  </p>
                  
                  <div className="mt-3">
                    <label className="cursor-pointer inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                      <input type="file" className="sr-only" accept="image/*" />
                      Browse
                    </label>
                  </div>
                </div>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center flex flex-col justify-center">
                  <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  
                  <h3 className="mt-2 text-lg font-medium text-gray-900">Package Image</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Upload seed package photo
                  </p>
                  
                  <div className="mt-3">
                    <label className="cursor-pointer inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                      <input type="file" className="sr-only" accept="image/*" />
                      Browse
                    </label>
                  </div>
                </div>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center flex flex-col justify-center">
                  <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  
                  <h3 className="mt-2 text-lg font-medium text-gray-900">Certificate Image</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Upload certificate or QR code
                  </p>
                  
                  <div className="mt-3">
                    <label className="cursor-pointer inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                      <input type="file" className="sr-only" accept="image/*" />
                      Browse
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-8 border-t border-gray-200 pt-6 flex justify-end">
            <button 
              onClick={handleAnalyzeClick}
              disabled={!selectedFile || isAnalyzing}
              className={`px-6 py-2 rounded-md text-white font-medium flex items-center ${
                selectedFile && !isAnalyzing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </>
              ) : 'Analyze Image'}
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      {renderAnalysisResult()}
    </div>
  );
};

export default AIAnalysis;