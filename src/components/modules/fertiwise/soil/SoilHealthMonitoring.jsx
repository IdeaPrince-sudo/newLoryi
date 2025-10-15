import React, { useState } from 'react';
import { soilHealthData } from '../fertiWiseData';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

const SoilHealthMonitoring = () => {
  const [selectedFarmerId, setSelectedFarmerId] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [soilTestFile, setSoilTestFile] = useState(null);
  const [newSoilData, setNewSoilData] = useState({
    pH: '',
    organicMatter: '',
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    zinc: '',
    iron: '',
    manganese: '',
    copper: ''
  });

  // Get unique farmer IDs
  const farmerIds = [...new Set(soilHealthData.map(data => data.farmerId))];

  // Get selected farmer data
  const selectedFarmerData = soilHealthData.find(data => data.farmerId === selectedFarmerId);

  // pH level chart data
  const phLevelData = [
    { name: 'Acidic', value: selectedFarmerData?.pH < 6.5 ? 1 : 0, color: '#EF4444' },
    { name: 'Neutral', value: selectedFarmerData?.pH >= 6.5 && selectedFarmerData?.pH <= 7.5 ? 1 : 0, color: '#10B981' },
    { name: 'Alkaline', value: selectedFarmerData?.pH > 7.5 ? 1 : 0, color: '#3B82F6' }
  ].filter(item => item.value > 0);

  // Nutrient radar chart data
  const nutrientData = selectedFarmerData ? [
    { subject: 'N', A: selectedFarmerData.nitrogen / 100 * 10, fullMark: 10 },
    { subject: 'P', A: selectedFarmerData.phosphorus / 50 * 10, fullMark: 10 },
    { subject: 'K', A: selectedFarmerData.potassium / 300 * 10, fullMark: 10 },
    { subject: 'OM', A: selectedFarmerData.organicMatter / 5 * 10, fullMark: 10 },
    { subject: 'Zn', A: selectedFarmerData?.micronutrients?.zinc * 10, fullMark: 10 },
    { subject: 'Fe', A: selectedFarmerData?.micronutrients?.iron / 10 * 10, fullMark: 10 }
  ] : [];

  const getPHClass = (ph) => {
    if (!ph) return '';
    if (ph < 5.5) return 'text-red-600';
    if (ph >= 5.5 && ph < 6.5) return 'text-yellow-600';
    if (ph >= 6.5 && ph <= 7.5) return 'text-green-600';
    if (ph > 7.5 && ph <= 8.5) return 'text-blue-600';
    return 'text-purple-600';
  };

  const handleFileChange = (e) => {
    setSoilTestFile(e.target.files[0]);
  };

  const handleNewDataChange = (field, value) => {
    setNewSoilData({
      ...newSoilData,
      [field]: value
    });
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    
    // In a real app, we would send the file to the server for processing
    // For this demo, we'll just simulate success
    
    alert('Soil test results uploaded successfully! The data will be processed and added to your records.');
    setShowUploadForm(false);
    setSoilTestFile(null);
  };

  const handleManualDataSubmit = (e) => {
    e.preventDefault();
    
    // In a real app, we would save this data to the database
    // For this demo, we'll just simulate success
    
    alert('Soil data added successfully!');
    setShowUploadForm(false);
    setNewSoilData({
      pH: '',
      organicMatter: '',
      nitrogen: '',
      phosphorus: '',
      potassium: '',
      zinc: '',
      iron: '',
      manganese: '',
      copper: ''
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Soil Health Monitoring</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-800">Soil Test Results</h2>
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            {showUploadForm ? 'Cancel Upload' : 'Upload New Results'}
          </button>
        </div>
        
        {showUploadForm ? (
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <h3 className="font-medium text-gray-800 mb-3">Upload Soil Test Results</h3>
            
            <div className="mb-4">
              <div className="flex space-x-2 mb-4">
                <button 
                  className={`px-4 py-2 rounded-md ${!soilTestFile ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                  onClick={() => setSoilTestFile(null)}
                >
                  Upload File
                </button>
                <button 
                  className={`px-4 py-2 rounded-md ${soilTestFile ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                  onClick={() => setSoilTestFile('manual')}
                >
                  Enter Manually
                </button>
              </div>
              
              {!soilTestFile ? (
                <form onSubmit={handleUploadSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Farm ID</label>
                    <select 
                      className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                      required
                    >
                      <option value="">Select Farm ID</option>
                      {farmerIds.map(id => (
                        <option key={id} value={id}>{id}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Upload Soil Test PDF or Image</label>
                    <input 
                      type="file" 
                      accept=".pdf,.jpg,.jpeg,.png" 
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-green-50 file:text-green-700
                        hover:file:bg-green-100"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">Supported formats: PDF, JPEG, PNG</p>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Upload Results
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleManualDataSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Farm ID</label>
                    <select 
                      className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                      required
                    >
                      <option value="">Select Farm ID</option>
                      {farmerIds.map(id => (
                        <option key={id} value={id}>{id}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Soil pH</label>
                      <input
                        type="number"
                        min="0"
                        max="14"
                        step="0.1"
                        value={newSoilData.pH}
                        onChange={(e) => handleNewDataChange('pH', e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Organic Matter (%)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={newSoilData.organicMatter}
                        onChange={(e) => handleNewDataChange('organicMatter', e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nitrogen (mg/kg)</label>
                      <input
                        type="number"
                        min="0"
                        value={newSoilData.nitrogen}
                        onChange={(e) => handleNewDataChange('nitrogen', e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phosphorus (mg/kg)</label>
                      <input
                        type="number"
                        min="0"
                        value={newSoilData.phosphorus}
                        onChange={(e) => handleNewDataChange('phosphorus', e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Potassium (mg/kg)</label>
                      <input
                        type="number"
                        min="0"
                        value={newSoilData.potassium}
                        onChange={(e) => handleNewDataChange('potassium', e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Zinc (mg/kg)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={newSoilData.zinc}
                        onChange={(e) => handleNewDataChange('zinc', e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Iron (mg/kg)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={newSoilData.iron}
                        onChange={(e) => handleNewDataChange('iron', e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Manganese (mg/kg)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={newSoilData.manganese}
                        onChange={(e) => handleNewDataChange('manganese', e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-4">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Save Data
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Farmer ID</label>
              <select
                value={selectedFarmerId}
                onChange={(e) => setSelectedFarmerId(e.target.value)}
                className="w-full md:w-1/3 border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
              >
                <option value="">Select a farmer</option>
                {farmerIds.map(id => (
                  <option key={id} value={id}>{id}</option>
                ))}
              </select>
            </div>
            
            {selectedFarmerData ? (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium text-gray-800 mb-2">Basic Info</h3>
                    <p className="text-sm"><span className="font-medium">Farmer ID:</span> {selectedFarmerData.farmerId}</p>
                    <p className="text-sm"><span className="font-medium">Last Tested:</span> {selectedFarmerData.lastTestedDate}</p>
                    <p className="text-sm"><span className="font-medium">Location:</span> Lat: {selectedFarmerData.location.lat.toFixed(4)}, Lng: {selectedFarmerData.location.lng.toFixed(4)}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium text-gray-800 mb-2">pH Level</h3>
                    <div className="flex items-center">
                      <div className="text-2xl font-bold mr-3 mt-1">
                        <span className={getPHClass(selectedFarmerData.pH)}>
                          {selectedFarmerData.pH}
                        </span>
                      </div>
                      <div className="h-28 w-28">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={phLevelData}
                              cx="50%"
                              cy="50%"
                              innerRadius={25}
                              outerRadius={40}
                              fill="#8884d8"
                              dataKey="value"
                              labelLine={false}
                            >
                              {phLevelData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium text-gray-800 mb-2">Organic Matter</h3>
                    <div className="flex items-center">
                      <div className="text-2xl font-bold mr-3">
                        {selectedFarmerData.organicMatter}%
                      </div>
                      <div className="flex-1">
                        <div className="h-4 w-full bg-gray-200 rounded-full">
                          <div 
                            className="h-full bg-green-500 rounded-full" 
                            style={{ width: `${Math.min(selectedFarmerData.organicMatter / 10 * 100, 100)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Low</span>
                          <span>Medium</span>
                          <span>High</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {selectedFarmerData.organicMatter < 2 
                        ? 'Low organic matter. Consider adding compost or cover crops.'
                        : selectedFarmerData.organicMatter < 5
                          ? 'Medium organic matter. Maintain with regular organic inputs.'
                          : 'High organic matter. Excellent for soil health.'}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium text-gray-800 mb-2">Nutrient Levels</h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={nutrientData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" />
                          <PolarRadiusAxis angle={30} domain={[0, 10]} />
                          <Radar
                            name="Nutrients"
                            dataKey="A"
                            stroke="#10B981"
                            fill="#10B981"
                            fillOpacity={0.6}
                          />
                          <Legend />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium text-gray-800 mb-2">Macro Nutrients</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Nitrogen (N)</span>
                          <span className="text-sm text-gray-500">{selectedFarmerData.nitrogen} mg/kg</span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded-full">
                          <div 
                            className={`h-full rounded-full ${selectedFarmerData.nitrogen < 30 ? 'bg-red-500' : selectedFarmerData.nitrogen < 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                            style={{ width: `${Math.min(selectedFarmerData.nitrogen / 100 * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Phosphorus (P)</span>
                          <span className="text-sm text-gray-500">{selectedFarmerData.phosphorus} mg/kg</span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded-full">
                          <div 
                            className={`h-full rounded-full ${selectedFarmerData.phosphorus < 15 ? 'bg-red-500' : selectedFarmerData.phosphorus < 30 ? 'bg-yellow-500' : 'bg-green-500'}`}
                            style={{ width: `${Math.min(selectedFarmerData.phosphorus / 50 * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Potassium (K)</span>
                          <span className="text-sm text-gray-500">{selectedFarmerData.potassium} mg/kg</span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded-full">
                          <div 
                            className={`h-full rounded-full ${selectedFarmerData.potassium < 100 ? 'bg-red-500' : selectedFarmerData.potassium < 200 ? 'bg-yellow-500' : 'bg-green-500'}`}
                            style={{ width: `${Math.min(selectedFarmerData.potassium / 300 * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="font-medium text-gray-800 mt-6 mb-2">Micro Nutrients</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium">Zinc: </span>
                        <span className={`${selectedFarmerData.micronutrients.zinc < 0.5 ? 'text-red-600' : selectedFarmerData.micronutrients.zinc < 1 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {selectedFarmerData.micronutrients.zinc} mg/kg
                        </span>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium">Iron: </span>
                        <span className={`${selectedFarmerData.micronutrients.iron < 2 ? 'text-red-600' : selectedFarmerData.micronutrients.iron < 4 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {selectedFarmerData.micronutrients.iron} mg/kg
                        </span>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium">Manganese: </span>
                        <span className={`${selectedFarmerData.micronutrients.manganese < 0.6 ? 'text-red-600' : selectedFarmerData.micronutrients.manganese < 1 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {selectedFarmerData.micronutrients.manganese} mg/kg
                        </span>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium">Copper: </span>
                        <span className={`${selectedFarmerData.micronutrients.copper < 0.2 ? 'text-red-600' : selectedFarmerData.micronutrients.copper < 0.4 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {selectedFarmerData.micronutrients.copper} mg/kg
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
                  <h3 className="font-medium text-gray-800 mb-2">Recommended Actions</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedFarmerData.recommendedActions.map((action, index) => (
                      <li key={index} className="text-gray-700">{action}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                    Generate Fertilizer Plan
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-6 text-center rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No soil data selected</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Select a farmer ID to view soil health data or upload new test results.
                </p>
              </div>
            )}
          </>
        )}
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Soil Health Tips</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-4 rounded-md">
            <h3 className="font-medium text-blue-800 mb-2">Soil Testing Frequency</h3>
            <p className="text-sm text-gray-700">
              For optimal results, test your soil every 2-3 years. More frequent testing may be needed for intensive cropping systems or when addressing specific nutrient deficiencies.
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-md">
            <h3 className="font-medium text-green-800 mb-2">Improving Organic Matter</h3>
            <p className="text-sm text-gray-700">
              Increase organic matter by incorporating crop residues, applying compost, using cover crops, and practicing crop rotation. Each 1% increase can improve water holding capacity by up to 25,000 gallons per acre.
            </p>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-md">
            <h3 className="font-medium text-yellow-800 mb-2">pH Management</h3>
            <p className="text-sm text-gray-700">
              Most crops perform best in soil with pH between 6.0 and 7.0. Use lime to raise pH in acidic soils and sulfur to lower pH in alkaline soils. Apply amendments 3-6 months before planting for best results.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoilHealthMonitoring;