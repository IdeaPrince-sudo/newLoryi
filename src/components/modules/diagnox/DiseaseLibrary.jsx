import React, { useState } from 'react';

// Mock disease data
const diseasesData = [
  {
    id: 1,
    name: 'Powdery Mildew',
    scientificName: 'Erysiphe cichoracearum',
    crops: ['Cucumber', 'Squash', 'Zucchini', 'Pumpkin', 'Melon'],
    affectedParts: ['Leaves', 'Stems', 'Occasionally fruit'],
    severity: 'Moderate',
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
    imageUrl: 'https://placehold.co/300x200/png?text=Powdery+Mildew'
  },
  {
    id: 2,
    name: 'Late Blight',
    scientificName: 'Phytophthora infestans',
    crops: ['Potato', 'Tomato'],
    affectedParts: ['Leaves', 'Stems', 'Fruit', 'Tubers'],
    severity: 'Severe',
    description: 'Late blight is a devastating disease that affects potatoes and tomatoes. It was responsible for the Irish Potato Famine in the 1840s and remains a serious threat to food security worldwide.',
    symptoms: [
      'Dark, water-soaked spots on leaves',
      'White fuzzy growth on leaf undersides',
      'Rapidly spreading brown lesions',
      'Dark stem lesions',
      'Firm, brown rot on tubers/fruit'
    ],
    causes: [
      'Fungal-like pathogen',
      'Cool, wet weather (60-70°F, high humidity)',
      'Prolonged leaf wetness',
      'Spores spread by wind and rain',
      'Can overwinter in potato tubers'
    ],
    treatments: [
      'Remove and destroy all infected plants immediately',
      'Apply copper-based fungicides preventatively',
      'Use protective fungicides before infection',
      'Harvest potatoes when tops are still green to prevent tuber infection',
      'Dispose of all plant debris after harvest'
    ],
    preventionTips: [
      'Plant certified disease-free seed potatoes',
      'Use resistant varieties',
      'Practice crop rotation (3-4 years)',
      'Improve drainage and air circulation',
      'Remove volunteer plants from previous seasons',
      'Monitor weather forecasts for blight-favorable conditions'
    ],
    imageUrl: 'https://placehold.co/300x200/png?text=Late+Blight'
  },
  {
    id: 3,
    name: 'Fusarium Wilt',
    scientificName: 'Fusarium oxysporum',
    crops: ['Tomato', 'Banana', 'Cotton', 'Melon', 'Peas'],
    affectedParts: ['Vascular system', 'Roots', 'Stems'],
    severity: 'High',
    description: 'Fusarium wilt is a soilborne fungal disease that infects plants through the roots and colonizes the water-conducting vessels, causing wilting, yellowing, and eventually death.',
    symptoms: [
      'Yellowing of leaves, often starting on one side',
      'Wilting despite adequate soil moisture',
      'Stunted growth',
      'Brown discoloration in vascular tissue',
      'Downward curling of leaves',
      'Plant death'
    ],
    causes: [
      'Soilborne fungal pathogen',
      'Spreads through contaminated soil, water, tools',
      'Enters through roots, especially when damaged',
      'Can persist in soil for years',
      'Favored by warm soil temperatures'
    ],
    treatments: [
      'No effective chemical control once infected',
      'Remove and destroy infected plants',
      'Solarize soil in hot climates',
      'Adjust soil pH to 6.5-7.0 where applicable',
      'Use biocontrol agents like beneficial Trichoderma'
    ],
    preventionTips: [
      'Plant resistant varieties or grafted plants',
      'Practice crop rotation (7+ years for heavily infested soils)',
      'Use pathogen-free planting material',
      'Improve soil drainage',
      'Avoid root injury during cultivation',
      'Sterilize garden tools between uses'
    ],
    imageUrl: 'https://placehold.co/300x200/png?text=Fusarium+Wilt'
  },
  {
    id: 4,
    name: 'Bacterial Leaf Spot',
    scientificName: 'Xanthomonas spp.',
    crops: ['Pepper', 'Tomato', 'Lettuce', 'Spinach'],
    affectedParts: ['Leaves', 'Fruits', 'Stems'],
    severity: 'Moderate to High',
    description: 'Bacterial leaf spot is a common disease affecting many vegetables, especially in warm, wet conditions. It creates spots on leaves and fruits that can significantly reduce yield and quality.',
    symptoms: [
      'Small, water-soaked spots on leaves',
      'Spots enlarge and turn brown/black with yellow halos',
      'Spots may dry out and crack or fall out (shot-hole appearance)',
      'Defoliation in severe cases',
      'Scabby, raised spots on fruits'
    ],
    causes: [
      'Bacterial pathogens',
      'Spreads via water splash, tools, and handling',
      'Enters through natural openings and wounds',
      'Survives on crop debris and seeds',
      'Favored by warm, wet conditions'
    ],
    treatments: [
      'Apply copper-based bactericides preventatively',
      'Remove and destroy infected plants/plant parts',
      'Avoid working with plants when wet',
      'Prune to improve air circulation',
      'Disinfect tools regularly'
    ],
    preventionTips: [
      'Use disease-free seeds and transplants',
      'Practice crop rotation (2-3 years)',
      'Use drip irrigation instead of overhead watering',
      'Space plants properly for good air circulation',
      'Apply preventive copper sprays during high-risk periods',
      'Clean up all crop debris after harvest'
    ],
    imageUrl: 'https://placehold.co/300x200/png?text=Bacterial+Leaf+Spot'
  }
];

const DiseaseLibrary = () => {
  const [searchParams, setSearchParams] = useState({
    searchText: '',
    cropType: '',
    severityLevel: 'all'
  });
  const [selectedDisease, setSelectedDisease] = useState(null);

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams({
      ...searchParams,
      [name]: value
    });
  };

  // Filter diseases based on search parameters
  const filteredDiseases = diseasesData.filter(disease => {
    const matchesSearchText = searchParams.searchText === '' || 
      disease.name.toLowerCase().includes(searchParams.searchText.toLowerCase()) ||
      disease.scientificName.toLowerCase().includes(searchParams.searchText.toLowerCase());
      
    const matchesCropType = searchParams.cropType === '' || 
      disease.crops.some(crop => crop.toLowerCase().includes(searchParams.cropType.toLowerCase()));
      
    const matchesSeverity = searchParams.severityLevel === 'all' || 
      disease.severity.toLowerCase() === searchParams.severityLevel.toLowerCase();
      
    return matchesSearchText && matchesCropType && matchesSeverity;
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-2">Disease Library</h2>
        <p className="text-gray-600">
          Comprehensive database of crop diseases with detailed information on symptoms, causes, treatments, and prevention.
        </p>
      </div>
      
      {/* Search and Filter */}
      <div className="bg-white border border-gray-200 rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="searchText" className="block text-sm font-medium text-gray-700 mb-1">
              Search Disease
            </label>
            <input
              type="text"
              id="searchText"
              name="searchText"
              placeholder="Search by disease name or scientific name"
              value={searchParams.searchText}
              onChange={handleSearchChange}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div>
            <label htmlFor="cropType" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Crop
            </label>
            <select
              id="cropType"
              name="cropType"
              value={searchParams.cropType}
              onChange={handleSearchChange}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">All Crops</option>
              <option value="tomato">Tomato</option>
              <option value="potato">Potato</option>
              <option value="cucumber">Cucumber</option>
              <option value="squash">Squash</option>
              <option value="pepper">Pepper</option>
              <option value="banana">Banana</option>
              <option value="melon">Melon</option>
            </select>
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
        </div>
      </div>
      
      {/* Disease List and Detail View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Disease List */}
        <div className="md:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-md font-medium text-gray-900">Disease List</h3>
              <span className="text-sm text-gray-600">{filteredDiseases.length} results</span>
            </div>
            <div className="overflow-y-auto max-h-[600px]">
              {filteredDiseases.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {filteredDiseases.map(disease => (
                    <li key={disease.id}>
                      <button
                        onClick={() => setSelectedDisease(disease)}
                        className={`w-full text-left p-4 hover:bg-gray-50 transition duration-150 ease-in-out ${selectedDisease?.id === disease.id ? 'bg-orange-50 border-l-4 border-orange-500' : ''}`}
                      >
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-gray-100">
                            <img src={disease.imageUrl} alt={disease.name} className="h-full w-full object-cover" />
                          </div>
                          <div className="ml-4">
                            <h4 className="text-sm font-medium text-gray-900">{disease.name}</h4>
                            <p className="text-xs text-gray-500">{disease.scientificName}</p>
                          </div>
                          <div className="ml-auto">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              disease.severity === 'Low' ? 'bg-green-100 text-green-800' :
                              disease.severity === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                              disease.severity === 'High' ? 'bg-orange-100 text-orange-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {disease.severity}
                            </span>
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-6 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No diseases found</h3>
                  <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Disease Detail */}
        <div className="md:col-span-2">
          {selectedDisease ? (
            <div className="bg-white border border-gray-200 rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">{selectedDisease.name}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedDisease.severity === 'Low' ? 'bg-green-100 text-green-800' :
                    selectedDisease.severity === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                    selectedDisease.severity === 'High' ? 'bg-orange-100 text-orange-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedDisease.severity} Severity
                  </span>
                </div>
                <p className="text-sm text-gray-500 italic mt-1">{selectedDisease.scientificName}</p>
              </div>
              
              <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <img 
                    src={selectedDisease.imageUrl} 
                    alt={selectedDisease.name} 
                    className="w-full h-auto rounded-lg mb-4"
                  />
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Affected Crops</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedDisease.crops.map((crop, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            {crop}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Affected Plant Parts</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedDisease.affectedParts.map((part, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {part}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <button className="w-full px-4 py-2 bg-orange-600 text-white rounded-md shadow-sm hover:bg-orange-700 transition duration-150 ease-in-out flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Generate PDF
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-sm text-gray-600">{selectedDisease.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Symptoms</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-600">
                      {selectedDisease.symptoms.map((symptom, index) => (
                        <li key={index} className="mb-1">{symptom}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Causes</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-600">
                      {selectedDisease.causes.map((cause, index) => (
                        <li key={index} className="mb-1">{cause}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Treatments</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-600">
                      {selectedDisease.treatments.map((treatment, index) => (
                        <li key={index} className="mb-1">{treatment}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Prevention Tips</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-600">
                      {selectedDisease.preventionTips.map((tip, index) => (
                        <li key={index} className="mb-1">{tip}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Treatment Videos</h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="border border-gray-200 rounded-lg p-3">
                        <div className="bg-gray-100 rounded aspect-w-16 aspect-h-9 flex items-center justify-center mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h5 className="text-sm font-medium">How to Treat {selectedDisease.name}</h5>
                        <p className="text-xs text-gray-500">University Extension Service</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg shadow p-6 text-center flex flex-col items-center justify-center min-h-[400px]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Select a Disease</h3>
              <p className="mt-1 text-gray-500 max-w-sm">
                Select a disease from the list to view detailed information about symptoms, causes, and treatments.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiseaseLibrary;