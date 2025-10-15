import React, { useState } from 'react';
import { 
  fertilizerRecommendations, 
  soilTypes, 
  weatherForecast 
} from '../fertiWiseData'

const FertilizerRecommendations = () => {
  const [selectedSoilType, setSelectedSoilType] = useState('');
  const [selectedCropType, setSelectedCropType] = useState('');
  const [landSize, setLandSize] = useState(1);
  const [soilPH, setSoilPH] = useState(6.5);
  const [organicMatter, setOrganicMatter] = useState(3.0);
  const [previousYield, setPreviousYield] = useState('');
  const [weatherCondition, setWeatherCondition] = useState('');
  const [recommendations, setRecommendations] = useState(null);

  // Extract unique crop types from recommendations
  const cropTypes = [...new Set(fertilizerRecommendations.map(rec => rec.cropType))];
  
  // Get current season from the weather forecast
  const currentSeason = weatherForecast[0].month;

  const handleGenerateRecommendations = () => {
    if (!selectedSoilType || !selectedCropType) {
      alert('Please select both soil type and crop type');
      return;
    }

    // Find base recommendation
    const baseRecommendation = fertilizerRecommendations.find(
      rec => rec.soilType === selectedSoilType && rec.cropType === selectedCropType
    ) || fertilizerRecommendations.find(
      rec => rec.soilType === selectedSoilType
    );

    if (!baseRecommendation) {
      setRecommendations({
        message: "We don't have specific recommendations for this combination. Please consult with an agricultural expert.",
        fertilizers: []
      });
      return;
    }

    // Adjust based on land size
    const adjustedFertilizers = baseRecommendation.recommendedFertilizers.map(fert => {
      const baseDosage = parseFloat(fert.dosage.replace(/[^\d.-]/g, ''));
      const unit = fert.dosage.replace(/[\d.-]/g, '');
      const adjustedDosage = (baseDosage * landSize).toFixed(2);
      
      return {
        ...fert,
        originalDosage: fert.dosage,
        dosage: `${adjustedDosage}${unit}`,
        totalAmount: `${adjustedDosage} ${unit.includes('/') ? unit.split('/')[0] : unit}`
      };
    });

    // Adjust based on soil pH
    let phAdjustment = "";
    if (soilPH < 5.5) {
      phAdjustment = "Consider applying lime to raise soil pH before fertilizer application.";
    } else if (soilPH > 7.5) {
      phAdjustment = "Consider applying sulfur to lower soil pH before fertilizer application.";
    }

    // Adjust based on weather conditions
    let weatherAdjustment = "";
    if (weatherCondition === 'Heavy Rainfall') {
      weatherAdjustment = "Use slow-release fertilizers to minimize leaching due to heavy rainfall.";
    } else if (weatherCondition === 'Drought') {
      weatherAdjustment = "Consider fertigation or split application to optimize nutrient uptake during drought conditions.";
    }

    setRecommendations({
      message: `Fertilizer recommendations for ${selectedCropType} on ${selectedSoilType} soil:`,
      seasonalNote: `Current season: ${currentSeason}. ${weatherForecast.find(f => f.month === currentSeason)?.recommendedFertilizerAdjustments || ''}`,
      fertilizers: adjustedFertilizers,
      soilTypeInfo: soilTypes.find(st => st.type === selectedSoilType),
      phAdjustment,
      weatherAdjustment
    });
  };

  const handleReset = () => {
    setSelectedSoilType('');
    setSelectedCropType('');
    setLandSize(1);
    setSoilPH(6.5);
    setOrganicMatter(3.0);
    setPreviousYield('');
    setWeatherCondition('');
    setRecommendations(null);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">AI-Driven Fertilizer Recommendations</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Enter Farm Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Soil Type</label>
            <select
              value={selectedSoilType}
              onChange={(e) => setSelectedSoilType(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
            >
              <option value="">Select Soil Type</option>
              {soilTypes.map(soil => (
                <option key={soil.type} value={soil.type}>{soil.type}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Crop Type</label>
            <select
              value={selectedCropType}
              onChange={(e) => setSelectedCropType(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
            >
              <option value="">Select Crop Type</option>
              {cropTypes.map(crop => (
                <option key={crop} value={crop}>{crop}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Land Size (hectares)</label>
            <input
              type="number"
              value={landSize}
              min={0.1}
              step={0.1}
              onChange={(e) => setLandSize(parseFloat(e.target.value))}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Soil pH</label>
            <input
              type="range"
              min={4.0}
              max={9.0}
              step={0.1}
              value={soilPH}
              onChange={(e) => setSoilPH(parseFloat(e.target.value))}
              className="w-full accent-green-500"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>4.0 (Acidic)</span>
              <span>{soilPH}</span>
              <span>9.0 (Alkaline)</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Organic Matter (%)</label>
            <input
              type="number"
              value={organicMatter}
              min={0}
              max={10}
              step={0.1}
              onChange={(e) => setOrganicMatter(parseFloat(e.target.value))}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Previous Yield (ton/ha)</label>
            <input
              type="number"
              value={previousYield}
              onChange={(e) => setPreviousYield(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
              placeholder="Optional"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Weather Conditions</label>
            <select
              value={weatherCondition}
              onChange={(e) => setWeatherCondition(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
            >
              <option value="">Select Weather Condition</option>
              <option value="Normal">Normal</option>
              <option value="Heavy Rainfall">Heavy Rainfall</option>
              <option value="Drought">Drought</option>
              <option value="Cold">Cold Season</option>
            </select>
          </div>
        </div>
        
        <div className="mt-6 flex space-x-4">
          <button
            onClick={handleGenerateRecommendations}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Generate Recommendations
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
      
      {recommendations && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Fertilizer Recommendations</h2>
          
          <div className="bg-green-50 border border-green-100 rounded-md p-4 mb-6">
            <p className="font-medium">{recommendations.message}</p>
            <p className="text-sm mt-2 text-gray-600">{recommendations.seasonalNote}</p>
            
            {recommendations.phAdjustment && (
              <p className="text-sm mt-2 text-amber-700">
                <span className="font-medium">pH Adjustment:</span> {recommendations.phAdjustment}
              </p>
            )}
            
            {recommendations.weatherAdjustment && (
              <p className="text-sm mt-2 text-blue-700">
                <span className="font-medium">Weather Adjustment:</span> {recommendations.weatherAdjustment}
              </p>
            )}
          </div>
          
          {recommendations.soilTypeInfo && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-800 mb-2">Soil Type Information</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p><span className="font-medium">Texture:</span> {recommendations.soilTypeInfo.characteristics.texture}</p>
                <p><span className="font-medium">Drainage:</span> {recommendations.soilTypeInfo.characteristics.drainage}</p>
                <p><span className="font-medium">Nutrient Retention:</span> {recommendations.soilTypeInfo.characteristics.nutrientRetention}</p>
                <p className="text-sm mt-2 text-gray-600">{recommendations.soilTypeInfo.fertilizerConsiderations}</p>
              </div>
            </div>
          )}
          
          <div className="mt-4">
            <h3 className="font-medium text-gray-800 mb-2">Recommended Fertilizers</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fertilizer</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Standard Dosage</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adjusted Dosage</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Effectiveness</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recommendations.fertilizers.map((fert, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{fert.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fert.originalDosage}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fert.dosage}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fert.totalAmount}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="relative w-full h-2 bg-gray-200 rounded">
                            <div 
                              className="absolute h-full bg-green-500 rounded" 
                              style={{ width: `${fert.effectiveness}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-xs text-gray-600">{fert.effectiveness}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="mt-6 border-t border-gray-100 pt-4">
            <h3 className="font-medium text-gray-800 mb-2">Application Guidelines</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
              <li>Apply base fertilizers before planting or at the beginning of the growing season.</li>
              <li>Split nitrogen applications to increase efficiency and reduce leaching.</li>
              <li>Avoid applying fertilizers when heavy rain is expected in the next 24 hours.</li>
              <li>Ensure uniform distribution for broadcast application methods.</li>
              <li>Consider soil testing every 2-3 years to refine future recommendations.</li>
            </ul>
          </div>
          
          <div className="mt-6 flex justify-center">
            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
              Save Recommendations
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FertilizerRecommendations;