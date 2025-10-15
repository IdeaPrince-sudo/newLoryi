import React, { useState } from 'react';

const DNAAnalysis = () => {
  const [fileUpload, setFileUpload] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisType, setAnalysisType] = useState('gmo');

  // Mock analysis function
  const analyzeDNA = () => {
    setIsAnalyzing(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsAnalyzing(false);
      
      if (analysisType === 'gmo') {
        setAnalysisResult({
          success: true,
          sample: fileUpload?.name || 'DNA Sample #12345',
          gmoDetection: {
            detected: true,
            confidence: 0.97,
            detectedMarkers: [
              { name: 'CaMV 35S Promoter', confidence: 0.99 },
              { name: 'T-nos Terminator', confidence: 0.98 },
              { name: 'EPSPS Gene', confidence: 0.97 },
              { name: 'Cry1Ab Gene', confidence: 0.95 }
            ],
            gmoType: 'Bt/Herbicide Resistant',
            commercialEvents: ['MON810', 'NK603']
          },
          conclusion: 'GMO POSITIVE',
          recommendations: [
            'Not suitable for organic certification',
            'Subject to GMO labeling requirements',
            'Store separately from organic materials'
          ]
        });
      } else if (analysisType === 'species') {
        setAnalysisResult({
          success: true,
          sample: fileUpload?.name || 'DNA Sample #12345',
          speciesIdentification: {
            primarySpecies: 'Zea mays (Corn)',
            confidence: 0.99,
            varietalMatch: 'Hybrid Yellow Dent',
            geneticPurity: '94.8%',
            otherSpecies: [
              { name: 'Glycine max (Soybean)', percentage: 3.5 },
              { name: 'Triticum aestivum (Wheat)', percentage: 1.7 }
            ]
          },
          conclusion: 'MIXED SPECIES',
          recommendations: [
            'Sample contains multiple crop species',
            'Consider purification measures',
            'Secondary species below labeling threshold'
          ]
        });
      } else if (analysisType === 'origin') {
        setAnalysisResult({
          success: true,
          sample: fileUpload?.name || 'DNA Sample #12345',
          originAuthentication: {
            declaredOrigin: 'USA, Midwest Region',
            predictedOrigin: 'USA, Iowa',
            confidenceScore: 0.88,
            matchingMarkers: 42,
            referenceDatabase: 'Global Seed Genetics DB v4.2',
            geneticDiversity: 'Medium-Low (indicates commercial variety)'
          },
          conclusion: 'ORIGIN CONFIRMED',
          recommendations: [
            'Genetic profile consistent with declared origin',
            'No evidence of geographical mislabeling',
            'Recommend standard import protocols'
          ]
        });
      }
    }, 3000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileUpload(file);
    }
  };

  const handleAnalyzeClick = () => {
    if (fileUpload) {
      analyzeDNA();
    }
  };

  const renderAnalysisResult = () => {
    if (!analysisResult) return null;

    return (
      <div className="mt-8 p-6 rounded-lg border-2 border-purple-500 bg-purple-50">
        <div className="flex items-center mb-6">
          <div className="bg-purple-100 p-2 rounded-full">
            <svg className="h-6 w-6 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 00-3.86.517l-.318.158a6 6 01-3.86.517L6.05 15.21a2 2 00-1.806.547M8 4h8l-1 1v5.172a2 2 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 00 9 10.172V5L8 4z" />
            </svg>
          </div>
          <h3 className="ml-3 text-xl font-bold text-purple-800">DNA Analysis Results</h3>
        </div>
        
        <div className="bg-white rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-bold text-lg">
              {analysisType === 'gmo' ? 'GMO Detection' : 
               analysisType === 'species' ? 'Species Identification' : 
               'Origin Authentication'}
            </h4>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              analysisResult.conclusion.includes('POSITIVE') || 
              analysisResult.conclusion.includes('MIXED') ? 
              'bg-red-100 text-red-800' : 
              'bg-green-100 text-green-800'
            }`}>
              {analysisResult.conclusion}
            </div>
          </div>
          
          {analysisType === 'gmo' && (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <span className="font-medium">Sample:</span>
                  <span className="ml-2">{analysisResult.sample}</span>
                </div>
                
                <div className="mb-4">
                  <span className="font-medium">GMO Confidence:</span>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full" 
                      style={{ width: `${analysisResult.gmoDetection.confidence * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {(analysisResult.gmoDetection.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                
                <div className="mb-4">
                  <span className="font-medium">GMO Type:</span>
                  <span className="ml-2">{analysisResult.gmoDetection.gmoType}</span>
                </div>
                
                <div className="mb-4">
                  <span className="font-medium">Commercial Events:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {analysisResult.gmoDetection.commercialEvents.map((event, index) => (
                      <span key={index} className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-sm">
                        {event}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <h5 className="font-medium mb-3">Detected GMO Markers</h5>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Marker
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Confidence
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {analysisResult.gmoDetection.detectedMarkers.map((marker, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">{marker.name}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          <div className="flex items-center">
                            <div className="w-24 bg-gray-200 rounded-full h-1.5 mr-2">
                              <div 
                                className="bg-red-600 h-1.5 rounded-full" 
                                style={{ width: `${marker.confidence * 100}%` }}
                              ></div>
                            </div>
                            {(marker.confidence * 100).toFixed(0)}%
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                <h5 className="font-medium mt-6 mb-2">Recommendations:</h5>
                <ul className="list-disc pl-5 space-y-1 text-gray-600">
                  {analysisResult.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          {analysisType === 'species' && (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <span className="font-medium">Sample:</span>
                  <span className="ml-2">{analysisResult.sample}</span>
                </div>
                
                <div className="mb-4">
                  <span className="font-medium">Primary Species:</span>
                  <span className="ml-2">{analysisResult.speciesIdentification.primarySpecies}</span>
                </div>
                
                <div className="mb-4">
                  <span className="font-medium">Confidence:</span>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${analysisResult.speciesIdentification.confidence * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {(analysisResult.speciesIdentification.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                
                <div className="mb-4">
                  <span className="font-medium">Varietal Match:</span>
                  <span className="ml-2">{analysisResult.speciesIdentification.varietalMatch}</span>
                </div>
                
                <div className="mb-4">
                  <span className="font-medium">Genetic Purity:</span>
                  <span className="ml-2">{analysisResult.speciesIdentification.geneticPurity}</span>
                </div>
              </div>
              
              <div>
                <h5 className="font-medium mb-3">Species Composition</h5>
                <div className="relative h-64 mb-4">
                  <div className="absolute inset-0 rounded-md overflow-hidden">
                    <div className="h-full bg-green-100" style={{ width: '94.8%' }}></div>
                    <div className="absolute top-0 h-full bg-yellow-100" style={{ left: '94.8%', width: '3.5%' }}></div>
                    <div className="absolute top-0 h-full bg-blue-100" style={{ left: '98.3%', width: '1.7%' }}></div>
                  </div>
                  
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <div className="text-3xl font-bold text-green-700">94.8%</div>
                    <div className="text-sm text-green-800">Corn</div>
                  </div>
                </div>
                
                <h5 className="font-medium mb-2">Other Detected Species:</h5>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Species
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Percentage
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {analysisResult.speciesIdentification.otherSpecies.map((species, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">{species.name}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">{species.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                <h5 className="font-medium mt-4 mb-2">Recommendations:</h5>
                <ul className="list-disc pl-5 space-y-1 text-gray-600">
                  {analysisResult.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          {analysisType === 'origin' && (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <span className="font-medium">Sample:</span>
                  <span className="ml-2">{analysisResult.sample}</span>
                </div>
                
                <div className="mb-4">
                  <span className="font-medium">Declared Origin:</span>
                  <span className="ml-2">{analysisResult.originAuthentication.declaredOrigin}</span>
                </div>
                
                <div className="mb-4">
                  <span className="font-medium">Predicted Origin:</span>
                  <span className="ml-2">{analysisResult.originAuthentication.predictedOrigin}</span>
                </div>
                
                <div className="mb-4">
                  <span className="font-medium">Confidence:</span>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${analysisResult.originAuthentication.confidenceScore * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {(analysisResult.originAuthentication.confidenceScore * 100).toFixed(1)}%
                  </span>
                </div>
                
                <div className="mb-4">
                  <span className="font-medium">Matching Markers:</span>
                  <span className="ml-2">{analysisResult.originAuthentication.matchingMarkers}</span>
                </div>
                
                <div className="mb-4">
                  <span className="font-medium">Reference Database:</span>
                  <span className="ml-2">{analysisResult.originAuthentication.referenceDatabase}</span>
                </div>
                
                <div className="mb-4">
                  <span className="font-medium">Genetic Diversity:</span>
                  <span className="ml-2">{analysisResult.originAuthentication.geneticDiversity}</span>
                </div>
              </div>
              
              <div>
                <div className="bg-gray-100 rounded-md p-4 mb-6">
                  <h5 className="font-medium mb-2">Geographic Match</h5>
                  <div className="bg-gray-300 h-40 rounded-md flex items-center justify-center">
                    <p className="text-gray-600 text-center">
                      [Geographic map visualization would appear here]
                    </p>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 text-center">
                    Genetic profile matches reference samples from Iowa, USA
                  </div>
                </div>
                
                <h5 className="font-medium mb-2">Recommendations:</h5>
                <ul className="list-disc pl-5 space-y-1 text-gray-600">
                  {analysisResult.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-4">
          <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded">
            Download Full Report
          </button>
          <button className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded">
            Add to Blockchain
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">DNA Sequence Analysis</h1>
      <p className="text-gray-600 mb-8">
        Upload raw DNA sequence files for comprehensive genomic analysis. Our cloud-based 
        bioinformatics platform can detect GMO markers, identify species, and authenticate seed origin.
      </p>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-bold mb-4">Upload DNA Sequence</h2>
              <p className="text-gray-600 mb-6">
                We accept FASTA, FASTQ, and other standard genomic file formats. 
                Files are securely processed in our cloud environment.
              </p>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-purple-800 mb-2">Supported Analyses</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-purple-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <span className="font-medium">GMO Detection</span>
                      <p className="text-sm text-gray-600">Identify common genetic modifications</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-purple-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <span className="font-medium">Species Identification</span>
                      <p className="text-sm text-gray-600">Determine exact species and varieties</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-purple-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <span className="font-medium">Origin Authentication</span>
                      <p className="text-sm text-gray-600">Verify geographical source of seeds</p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                
                <h3 className="mt-4 text-lg font-medium text-gray-900">Upload DNA Sequence File</h3>
                <p className="mt-1 text-sm text-gray-500">
                  FASTA, FASTQ, VCF, or BAM formats (max 100MB)
                </p>
                
                <div className="mt-4">
                  <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                    <input
                      type="file"
                      className="sr-only"
                      accept=".fasta,.fastq,.fa,.fq,.vcf,.bam"
                      onChange={handleFileChange}
                    />
                    Select File
                  </label>
                </div>
                
                {fileUpload && (
                  <div className="mt-4 text-sm text-gray-900">
                    Selected: {fileUpload.name}
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-bold mb-4">Analysis Options</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Analysis Type</label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="gmo" 
                        name="analysisType" 
                        checked={analysisType === 'gmo'} 
                        onChange={() => setAnalysisType('gmo')}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                      />
                      <label htmlFor="gmo" className="ml-3">
                        <span className="block text-sm font-medium text-gray-700">GMO Detection</span>
                        <span className="block text-sm text-gray-500">
                          Identify transgenic elements and common GMO markers
                        </span>
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="species" 
                        name="analysisType" 
                        checked={analysisType === 'species'} 
                        onChange={() => setAnalysisType('species')}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                      />
                      <label htmlFor="species" className="ml-3">
                        <span className="block text-sm font-medium text-gray-700">Species Identification</span>
                        <span className="block text-sm text-gray-500">
                          Determine seed species and assess genetic purity
                        </span>
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="origin" 
                        name="analysisType" 
                        checked={analysisType === 'origin'} 
                        onChange={() => setAnalysisType('origin')}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                      />
                      <label htmlFor="origin" className="ml-3">
                        <span className="block text-sm font-medium text-gray-700">Origin Authentication</span>
                        <span className="block text-sm text-gray-500">
                          Verify geographical source of seed sample
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Reference Database</label>
                  <select className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="latest">Latest Database (July 2025)</option>
                    <option value="comprehensive">Comprehensive GMO Database</option>
                    <option value="crops">Major Food Crops Only</option>
                    <option value="regional">Regional Varieties</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Analysis Depth</label>
                  <div className="flex items-center">
                    <span className="text-gray-500 text-sm">Basic</span>
                    <input
                      type="range"
                      min="1"
                      max="3"
                      defaultValue="2"
                      className="mx-4 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-gray-500 text-sm">Advanced</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Advanced analysis takes longer but provides more detailed results
                  </p>
                </div>
                
                <div className="pt-4">
                  <button 
                    onClick={handleAnalyzeClick}
                    disabled={!fileUpload || isAnalyzing}
                    className={`w-full flex justify-center items-center px-6 py-3 rounded-md text-white font-medium ${
                      fileUpload && !isAnalyzing ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isAnalyzing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing DNA Sequence...
                      </>
                    ) : 'Start DNA Analysis'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Analysis Results */}
      {renderAnalysisResult()}
    </div>
  );
};

export default DNAAnalysis;