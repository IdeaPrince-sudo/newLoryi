import React, { useState } from 'react';
import { soilAnalysisData } from '../../../data/farm-data/mockFarmData';

const SoilAnalysis = () => {
  const [soilData, setSoilData] = useState(soilAnalysisData);
  const [newSampleForm, setNewSampleForm] = useState({ 
    date: '', 
    pH: '', 
    nitrogen: '', 
    phosphorus: '', 
    potassium: '', 
    moisture: '', 
    organicMatter: '' 
  });
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewSampleForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newSample = {
      id: soilData.length + 1,
      ...newSampleForm
    };
    setSoilData(prev => [...prev, newSample]);
    setNewSampleForm({ 
      date: '', 
      pH: '', 
      nitrogen: '', 
      phosphorus: '', 
      potassium: '', 
      moisture: '', 
      organicMatter: '' 
    });
    setIsFormVisible(false);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getNitrogenColor = (level) => {
    if (level === 'Low') return 'text-red-600';
    if (level === 'Medium') return 'text-yellow-600';
    return 'text-green-600';
  };

  const getPhosphorusColor = (level) => {
    if (level === 'Low') return 'text-red-600';
    if (level === 'Medium') return 'text-yellow-600';
    return 'text-green-600';
  };

  const getPotassiumColor = (level) => {
    if (level === 'Low') return 'text-red-600';
    if (level === 'Medium') return 'text-yellow-600';
    return 'text-green-600';
  };

  const getpHStatus = (pH) => {
    if (pH < 5.5) return { text: 'Too Acidic', color: 'text-red-600' };
    if (pH >= 5.5 && pH < 6.5) return { text: 'Slightly Acidic', color: 'text-yellow-600' };
    if (pH >= 6.5 && pH < 7.5) return { text: 'Neutral (Optimal)', color: 'text-green-600' };
    if (pH >= 7.5 && pH < 8.5) return { text: 'Slightly Alkaline', color: 'text-yellow-600' };
    return { text: 'Too Alkaline', color: 'text-red-600' };
  };

  const renderRecommendation = () => {
    if (!soilData.length) return null;
    
    const latestSample = soilData[soilData.length - 1];
    const recommendations = [];
    
    // pH recommendations
    const pH = parseFloat(latestSample.pH);
    if (pH < 5.5) {
      recommendations.push("Soil is too acidic. Add agricultural lime to increase pH.");
    } else if (pH > 7.5) {
      recommendations.push("Soil is too alkaline. Add sulfur or acidifying organic matter to decrease pH.");
    }
    
    // Nitrogen recommendations
    if (latestSample.nitrogen === 'Low') {
      recommendations.push("Low nitrogen levels detected. Apply nitrogen-rich fertilizer or add leguminous cover crops.");
    }
    
    // Phosphorus recommendations
    if (latestSample.phosphorus === 'Low') {
      recommendations.push("Low phosphorus levels detected. Apply phosphate fertilizer or add bone meal.");
    }
    
    // Potassium recommendations
    if (latestSample.potassium === 'Low') {
      recommendations.push("Low potassium levels detected. Apply potash fertilizer or add wood ash.");
    }
    
    // Organic matter
    const organicMatterLevel = parseFloat(latestSample.organicMatter);
    if (organicMatterLevel < 3) {
      recommendations.push("Low organic matter content. Add compost, manure, or plant cover crops to improve soil structure.");
    }
    
    return (
      <div className="mt-6 bg-green-50 border border-green-200 p-4 rounded-md">
        <h4 className="text-lg font-medium text-green-800">Soil Recommendations</h4>
        {recommendations.length > 0 ? (
          <ul className="mt-2 space-y-1 list-disc list-inside text-sm text-green-700">
            {recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-green-700">Your soil is in optimal condition! Continue your current management practices.</p>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Soil Analysis</h2>
        <button
          onClick={() => setIsFormVisible(!isFormVisible)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          {isFormVisible ? 'Cancel' : 'Add New Sample'}
        </button>
      </div>
      
      {isFormVisible && (
        <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Add New Soil Sample</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={newSampleForm.date}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">pH Level</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="14"
                name="pH"
                value={newSampleForm.pH}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="e.g., 6.5"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nitrogen Level</label>
              <select
                name="nitrogen"
                value={newSampleForm.nitrogen}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select Level</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phosphorus Level</label>
              <select
                name="phosphorus"
                value={newSampleForm.phosphorus}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select Level</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Potassium Level</label>
              <select
                name="potassium"
                value={newSampleForm.potassium}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select Level</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Moisture</label>
              <input
                type="text"
                name="moisture"
                value={newSampleForm.moisture}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="e.g., 35%"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organic Matter</label>
              <input
                type="text"
                name="organicMatter"
                value={newSampleForm.organicMatter}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="e.g., 4%"
                required
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Add Sample
            </button>
          </div>
        </form>
      )}
      
      {soilData.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No soil analysis data available.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">pH</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nitrogen</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phosphorus</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Potassium</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Moisture</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organic Matter</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {soilData.map((sample) => (
                  <tr key={sample.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(sample.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span>{sample.pH}</span>
                      <span className={`ml-2 text-xs ${getpHStatus(sample.pH).color}`}>
                        ({getpHStatus(sample.pH).text})
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getNitrogenColor(sample.nitrogen)}`}>
                      {sample.nitrogen}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getPhosphorusColor(sample.phosphorus)}`}>
                      {sample.phosphorus}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getPotassiumColor(sample.potassium)}`}>
                      {sample.potassium}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sample.moisture}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sample.organicMatter}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {renderRecommendation()}
        </>
      )}
    </div>
  );
};

export default SoilAnalysis;