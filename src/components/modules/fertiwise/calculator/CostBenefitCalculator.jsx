import React, { useState, useEffect } from 'react';
import { fertilizerPrices, fertilizerRecommendations } from '../fertiWiseData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CostBenefitCalculator = () => {
  const [selectedCrop, setSelectedCrop] = useState('');
  const [landSize, setLandSize] = useState(1);
  const [expectedYield, setExpectedYield] = useState(0);
  const [cropPrice, setCropPrice] = useState(0);
  const [selectedFertilizers, setSelectedFertilizers] = useState([]);
  const [calculationResult, setCalculationResult] = useState(null);
  
  // Extract unique crop types from recommendations
  const cropTypes = [...new Set(fertilizerRecommendations.map(rec => rec.cropType))];
  
  // Crop yield baselines (tons per hectare)
  const cropYieldBaselines = {
    'Maize': 5.5,
    'Rice': 4.8,
    'Wheat': 3.9,
    'Vegetables': 18.0,
    'Tea': 2.3
  };
  
  // Crop price baselines (per ton)
  const cropPriceBaselines = {
    'Maize': 180,
    'Rice': 300,
    'Wheat': 220,
    'Vegetables': 450,
    'Tea': 2800
  };
  
  // Update expected yield and crop price when crop selection changes
  useEffect(() => {
    if (selectedCrop) {
      setExpectedYield(cropYieldBaselines[selectedCrop] || 0);
      setCropPrice(cropPriceBaselines[selectedCrop] || 0);
    } else {
      setExpectedYield(0);
      setCropPrice(0);
    }
  }, [selectedCrop]);
  
  // Add fertilizer to selected list
  const addFertilizer = (fertilizer) => {
    const alreadyAdded = selectedFertilizers.some(f => f.name === fertilizer.name);
    if (!alreadyAdded) {
      setSelectedFertilizers([...selectedFertilizers, {
        ...fertilizer,
        quantity: 0,
        cost: 0
      }]);
    }
  };
  
  // Remove fertilizer from selected list
  const removeFertilizer = (fertilizerName) => {
    setSelectedFertilizers(selectedFertilizers.filter(f => f.name !== fertilizerName));
  };
  
  // Update fertilizer quantity and calculate cost
  const updateFertilizerQuantity = (index, quantity) => {
    const updatedFertilizers = [...selectedFertilizers];
    const fertilizerPrice = fertilizerPrices.find(fp => fp.name === updatedFertilizers[index].name)?.price || 0;
    
    updatedFertilizers[index] = {
      ...updatedFertilizers[index],
      quantity,
      cost: (quantity / 1000) * fertilizerPrice // Convert kg to tons for cost calculation
    };
    
    setSelectedFertilizers(updatedFertilizers);
  };
  
  // Calculate cost-benefit analysis
  const calculateCostBenefit = () => {
    if (!selectedCrop || landSize <= 0 || expectedYield <= 0 || cropPrice <= 0) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Calculate total fertilizer cost
    const totalFertilizerCost = selectedFertilizers.reduce((sum, fert) => sum + fert.cost, 0);
    
    // Calculate estimated revenue
    const totalRevenue = expectedYield * landSize * cropPrice;
    
    // Calculate net profit
    const netProfit = totalRevenue - totalFertilizerCost;
    
    // Calculate ROI
    const roi = totalFertilizerCost > 0 ? (netProfit / totalFertilizerCost) * 100 : 0;
    
    // Calculate scenarios
    const lowYieldScenario = {
      yield: expectedYield * 0.8,
      revenue: expectedYield * 0.8 * landSize * cropPrice,
      profit: (expectedYield * 0.8 * landSize * cropPrice) - totalFertilizerCost,
      roi: totalFertilizerCost > 0 ? (((expectedYield * 0.8 * landSize * cropPrice) - totalFertilizerCost) / totalFertilizerCost) * 100 : 0
    };
    
    const highYieldScenario = {
      yield: expectedYield * 1.2,
      revenue: expectedYield * 1.2 * landSize * cropPrice,
      profit: (expectedYield * 1.2 * landSize * cropPrice) - totalFertilizerCost,
      roi: totalFertilizerCost > 0 ? (((expectedYield * 1.2 * landSize * cropPrice) - totalFertilizerCost) / totalFertilizerCost) * 100 : 0
    };
    
    // Generate chart data for comparison
    const chartData = [
      {
        name: 'Low Yield (-20%)',
        profit: lowYieldScenario.profit,
        cost: totalFertilizerCost
      },
      {
        name: 'Expected Yield',
        profit: netProfit,
        cost: totalFertilizerCost
      },
      {
        name: 'High Yield (+20%)',
        profit: highYieldScenario.profit,
        cost: totalFertilizerCost
      }
    ];
    
    setCalculationResult({
      totalFertilizerCost,
      totalRevenue,
      netProfit,
      roi,
      lowYieldScenario,
      highYieldScenario,
      chartData
    });
  };
  
  const resetCalculator = () => {
    setSelectedCrop('');
    setLandSize(1);
    setExpectedYield(0);
    setCropPrice(0);
    setSelectedFertilizers([]);
    setCalculationResult(null);
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Cost-Benefit Calculator</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Crop & Land Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Crop Type</label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
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
              min="0.1"
              step="0.1"
              onChange={(e) => setLandSize(parseFloat(e.target.value))}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expected Yield (tons/hectare)</label>
            <input
              type="number"
              value={expectedYield}
              min="0"
              step="0.1"
              onChange={(e) => setExpectedYield(parseFloat(e.target.value))}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Crop Price ($/ton)</label>
            <input
              type="number"
              value={cropPrice}
              min="0"
              onChange={(e) => setCropPrice(parseFloat(e.target.value))}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-800">Fertilizer Selection</h2>
          <div className="relative">
            <select
              onChange={(e) => {
                const selectedFertilizerName = e.target.value;
                if (selectedFertilizerName) {
                  const price = fertilizerPrices.find(fp => fp.name === selectedFertilizerName);
                  if (price) {
                    addFertilizer({
                      name: selectedFertilizerName,
                      price: price.price,
                      unit: price.unit
                    });
                  }
                  e.target.value = ''; // Reset select after adding
                }
              }}
              className="border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
            >
              <option value="">Add Fertilizer</option>
              {fertilizerPrices.map(fert => (
                <option 
                  key={fert.name} 
                  value={fert.name}
                  disabled={selectedFertilizers.some(f => f.name === fert.name)}
                >
                  {fert.name} - ${fert.price} {fert.unit}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {selectedFertilizers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fertilizer</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity (kg)</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedFertilizers.map((fert, index) => (
                  <tr key={fert.name}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {fert.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${fertilizerPrices.find(fp => fp.name === fert.name)?.price || 0} per ton
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={fert.quantity}
                        onChange={(e) => updateFertilizerQuantity(index, parseFloat(e.target.value))}
                        className="w-24 border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${fert.cost.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button 
                        onClick={() => removeFertilizer(fert.name)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" colSpan="3">
                    Total Cost:
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    ${selectedFertilizers.reduce((sum, fert) => sum + fert.cost, 0).toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-gray-50 p-4 text-center rounded-md">
            <p className="text-sm text-gray-500">No fertilizers selected. Add fertilizers to calculate cost-benefit analysis.</p>
          </div>
        )}
        
        <div className="mt-6 flex space-x-4">
          <button
            onClick={calculateCostBenefit}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Calculate Cost-Benefit
          </button>
          <button
            onClick={resetCalculator}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
      
      {calculationResult && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Cost-Benefit Analysis</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-medium text-gray-800 mb-3">Summary</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm">Land Size:</div>
                  <div className="text-sm font-medium">{landSize} hectares</div>
                  
                  <div className="text-sm">Crop:</div>
                  <div className="text-sm font-medium">{selectedCrop}</div>
                  
                  <div className="text-sm">Expected Yield:</div>
                  <div className="text-sm font-medium">{expectedYield} tons/hectare</div>
                  
                  <div className="text-sm">Total Yield:</div>
                  <div className="text-sm font-medium">{(expectedYield * landSize).toFixed(2)} tons</div>
                  
                  <div className="text-sm">Crop Price:</div>
                  <div className="text-sm font-medium">${cropPrice}/ton</div>
                  
                  <div className="text-sm">Total Revenue:</div>
                  <div className="text-sm font-medium">${calculationResult.totalRevenue.toFixed(2)}</div>
                  
                  <div className="text-sm">Total Fertilizer Cost:</div>
                  <div className="text-sm font-medium">${calculationResult.totalFertilizerCost.toFixed(2)}</div>
                  
                  <div className="text-sm font-medium">Net Profit:</div>
                  <div className={`text-sm font-bold ${calculationResult.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${calculationResult.netProfit.toFixed(2)}
                  </div>
                  
                  <div className="text-sm font-medium">Return on Investment (ROI):</div>
                  <div className={`text-sm font-bold ${calculationResult.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {calculationResult.roi.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-800 mb-3">Profit Comparison</h3>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={calculationResult.chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`$${value.toFixed(2)}`, '']}
                    />
                    <Legend />
                    <Bar dataKey="profit" name="Profit" fill="#10B981" />
                    <Bar dataKey="cost" name="Cost" fill="#6B7280" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-800 mb-3">Yield Scenarios</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scenario</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yield (tons)</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ROI</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr className="bg-red-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Low Yield (-20%)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(calculationResult.lowYieldScenario.yield * landSize).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${calculationResult.lowYieldScenario.revenue.toFixed(2)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${calculationResult.lowYieldScenario.profit >= 0 ? 'text-green-600' : 'text-red-600'} font-medium`}>
                      ${calculationResult.lowYieldScenario.profit.toFixed(2)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${calculationResult.lowYieldScenario.roi >= 0 ? 'text-green-600' : 'text-red-600'} font-medium`}>
                      {calculationResult.lowYieldScenario.roi.toFixed(2)}%
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Expected Yield
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(expectedYield * landSize).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${calculationResult.totalRevenue.toFixed(2)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${calculationResult.netProfit >= 0 ? 'text-green-600' : 'text-red-600'} font-medium`}>
                      ${calculationResult.netProfit.toFixed(2)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${calculationResult.roi >= 0 ? 'text-green-600' : 'text-red-600'} font-medium`}>
                      {calculationResult.roi.toFixed(2)}%
                    </td>
                  </tr>
                  <tr className="bg-green-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      High Yield (+20%)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(calculationResult.highYieldScenario.yield * landSize).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${calculationResult.highYieldScenario.revenue.toFixed(2)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${calculationResult.highYieldScenario.profit >= 0 ? 'text-green-600' : 'text-red-600'} font-medium`}>
                      ${calculationResult.highYieldScenario.profit.toFixed(2)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${calculationResult.highYieldScenario.roi >= 0 ? 'text-green-600' : 'text-red-600'} font-medium`}>
                      {calculationResult.highYieldScenario.roi.toFixed(2)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-md">
            <h3 className="font-medium text-blue-800 mb-1">Recommendation</h3>
            <p className="text-sm text-gray-700">
              {calculationResult.roi >= 100 ? 
                `This fertilizer investment shows an excellent ROI of ${calculationResult.roi.toFixed(2)}%. Highly recommended to proceed with this plan.` :
                calculationResult.roi >= 50 ?
                `This fertilizer investment shows a good ROI of ${calculationResult.roi.toFixed(2)}%. Recommended to proceed with this plan.` :
                calculationResult.roi >= 0 ?
                `This fertilizer investment shows a positive but modest ROI of ${calculationResult.roi.toFixed(2)}%. Consider optimizing your fertilizer selection or exploring alternative options.` :
                `This fertilizer investment shows a negative ROI of ${calculationResult.roi.toFixed(2)}%. Not recommended to proceed with the current plan. Consider reducing costs or selecting different fertilizers.`
              }
            </p>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors mr-3">
              Save Analysis
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
              Print Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostBenefitCalculator;