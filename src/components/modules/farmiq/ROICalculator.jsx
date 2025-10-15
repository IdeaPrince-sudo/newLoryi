import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const ROICalculator = () => {
  // Farm types with their ROI data
  const farmTypes = [
    {
      type: "General Crop Farming",
      totalCost: 4464.60,
      totalRevenue: 7200.00,
      profit: 2735.40,
      roi: 61.27,
      details: {
        costs: [
          { category: "Land Rent", amount: 100.00 },
          { category: "Land Preparation", amount: 450.00 },
          { category: "Planting", amount: 200.00 },
          { category: "Weed Control", amount: 300.00 },
          { category: "Fertilizer Application", amount: 1700.00 },
          { category: "Pest & Disease Control", amount: 80.00 },
          { category: "Harvesting", amount: 250.00 },
          { category: "Post-Harvest", amount: 272.00 },
          { category: "Tools (Annualized)", amount: 150.00 },
          { category: "Contingency (5%)", amount: 212.60 }
        ],
        revenue: [
          { item: "Crop Sales (24 bags @100kg)", amount: 7200.00 }
        ]
      }
    },
    {
      type: "Poultry Farming",
      totalCost: 43970.00,
      totalRevenue: 66700.00,
      profit: 22730.00,
      roi: 51.7,
      details: {
        costs: [
          { category: "Poultry House & Chicks", amount: 11600.00 },
          { category: "Vaccines & Drugs", amount: 1020.00 },
          { category: "Equipment", amount: 6690.00 },
          { category: "Feed", amount: 23230.00 },
          { category: "Brooding Expenses", amount: 430.00 },
          { category: "Labour", amount: 1000.00 }
        ],
        revenue: [
          { item: "Bird Sales (950 birds)", amount: 66500.00 },
          { item: "Manure Sales", amount: 200.00 }
        ]
      }
    },
    {
      type: "Pig Farming",
      totalCost: 19500.00,
      totalRevenue: 20200.00,
      profit: 700.00,
      roi: 3.6,
      details: {
        costs: [
          { category: "Piglets", amount: 3000.00 },
          { category: "Housing & Setup", amount: 5000.00 },
          { category: "Feed", amount: 8960.00 },
          { category: "Veterinary & Drugs", amount: 600.00 },
          { category: "Labour", amount: 1200.00 },
          { category: "Utilities", amount: 400.00 },
          { category: "Miscellaneous", amount: 340.00 }
        ],
        revenue: [
          { item: "Pig Sales (10 pigs)", amount: 20000.00 },
          { item: "Manure Sales", amount: 200.00 }
        ]
      }
    },
    {
      type: "Aquatic Farming (Tilapia)",
      totalCost: 100000.00,
      totalRevenue: 154000.00,
      profit: 54000.00,
      roi: 54.0,
      details: {
        costs: [
          { category: "Fingerlings", amount: 6500.00 },
          { category: "Feed", amount: 67500.00 },
          { category: "Pond setup", amount: 6500.00 },
          { category: "Labor", amount: 9000.00 },
          { category: "Water pumping / aeration", amount: 4750.00 },
          { category: "Disease control / vet services", amount: 1500.00 },
          { category: "Harvesting / Transport", amount: 2500.00 },
          { category: "Miscellaneous", amount: 2500.00 }
        ],
        revenue: [
          { item: "Fish Sales (7,000 kg)", amount: 154000.00 }
        ]
      }
    }
  ];

  const [selectedFarmType, setSelectedFarmType] = useState(farmTypes[0]);
  const [customInputs, setCustomInputs] = useState({
    scale: 1,
    marketPriceAdjustment: 0,
    costReduction: 0,
    yieldIncrease: 0
  });
  const [calculatedROI, setCalculatedROI] = useState({
    totalCost: selectedFarmType.totalCost,
    totalRevenue: selectedFarmType.totalRevenue,
    profit: selectedFarmType.profit,
    roi: selectedFarmType.roi
  });
  
  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  useEffect(() => {
    calculateROI();
  }, [selectedFarmType, customInputs]);

  const handleFarmTypeChange = (e) => {
    const farmType = farmTypes.find(farm => farm.type === e.target.value);
    setSelectedFarmType(farmType);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomInputs({
      ...customInputs,
      [name]: parseFloat(value) || 0
    });
  };

  const calculateROI = () => {
    // Apply scale factor
    const scaledCost = selectedFarmType.totalCost * customInputs.scale;
    
    // Apply cost reduction (percentage)
    const costAfterReduction = scaledCost * (1 - (customInputs.costReduction / 100));
    
    // Apply yield/revenue increase (percentage)
    const revenueAfterIncrease = selectedFarmType.totalRevenue * 
      customInputs.scale * 
      (1 + (customInputs.yieldIncrease / 100));
    
    // Apply market price adjustment (percentage)
    const finalRevenue = revenueAfterIncrease * (1 + (customInputs.marketPriceAdjustment / 100));
    
    // Calculate new profit and ROI
    const newProfit = finalRevenue - costAfterReduction;
    const newROI = (newProfit / costAfterReduction) * 100;
    
    setCalculatedROI({
      totalCost: costAfterReduction,
      totalRevenue: finalRevenue,
      profit: newProfit,
      roi: newROI
    });
  };

  // Prepare data for pie charts
  const costData = selectedFarmType.details.costs.map(item => ({
    name: item.category,
    value: item.amount * customInputs.scale * (1 - (customInputs.costReduction / 100))
  }));

  const revenueData = selectedFarmType.details.revenue.map(item => ({
    name: item.item,
    value: item.amount * 
      customInputs.scale * 
      (1 + (customInputs.yieldIncrease / 100)) * 
      (1 + (customInputs.marketPriceAdjustment / 100))
  }));

  const comparisonData = [
    { name: 'General Crop', roi: farmTypes[0].roi },
    { name: 'Poultry', roi: farmTypes[1].roi },
    { name: 'Pig', roi: farmTypes[2].roi },
    { name: 'Aquatic', roi: farmTypes[3].roi },
    { name: 'Your Farm', roi: parseFloat(calculatedROI.roi.toFixed(2)) }
  ];

  const formatCurrency = (value) => {
    return `GHS ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Farm ROI Calculator</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Input Parameters</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Farm Type</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={selectedFarmType.type}
                onChange={handleFarmTypeChange}
              >
                {farmTypes.map((farm, index) => (
                  <option key={index} value={farm.type}>{farm.type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scale Factor (1 = standard size from analysis)
              </label>
              <input
                type="number"
                name="scale"
                min="0.1"
                step="0.1"
                value={customInputs.scale}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Market Price Adjustment (%)
              </label>
              <input
                type="number"
                name="marketPriceAdjustment"
                min="-50"
                max="100"
                value={customInputs.marketPriceAdjustment}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              <p className="text-xs text-gray-500 mt-1">
                Positive values indicate higher market prices, negative values indicate lower prices.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cost Reduction Through Efficiency (%)
              </label>
              <input
                type="number"
                name="costReduction"
                min="0"
                max="50"
                value={customInputs.costReduction}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              <p className="text-xs text-gray-500 mt-1">
                Potential savings through better practices, technology, or bulk purchasing.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Yield/Output Increase (%)
              </label>
              <input
                type="number"
                name="yieldIncrease"
                min="0"
                max="100"
                value={customInputs.yieldIncrease}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              <p className="text-xs text-gray-500 mt-1">
                Potential increase through better genetics, management, or technology.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium text-gray-700 mb-4">ROI Calculation Results</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-md shadow-sm">
                <p className="text-sm text-gray-500">Total Cost</p>
                <p className="text-xl font-bold text-gray-800">{formatCurrency(calculatedROI.totalCost)}</p>
              </div>
              
              <div className="bg-white p-3 rounded-md shadow-sm">
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-xl font-bold text-gray-800">{formatCurrency(calculatedROI.totalRevenue)}</p>
              </div>
              
              <div className="bg-white p-3 rounded-md shadow-sm">
                <p className="text-sm text-gray-500">Net Profit</p>
                <p className={`text-xl font-bold ${calculatedROI.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(calculatedROI.profit)}
                </p>
              </div>
              
              <div className="bg-white p-3 rounded-md shadow-sm">
                <p className="text-sm text-gray-500">ROI</p>
                <p className={`text-xl font-bold ${calculatedROI.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {calculatedROI.roi.toFixed(2)}%
                </p>
              </div>
            </div>
            
            <div className="bg-white p-3 rounded-md shadow-sm">
              <h4 className="text-md font-medium text-gray-700 mb-2">ROI Interpretation</h4>
              
              {calculatedROI.roi > 50 && (
                <p className="text-sm text-green-700 bg-green-50 p-2 rounded">
                  <span className="font-bold">Excellent ROI!</span> This investment has strong profitability and should be prioritized. 
                  Consider expanding or replicating this farm model.
                </p>
              )}
              
              {calculatedROI.roi <= 50 && calculatedROI.roi > 20 && (
                <p className="text-sm text-blue-700 bg-blue-50 p-2 rounded">
                  <span className="font-bold">Good ROI.</span> This investment is profitable and worth pursuing,
                  though you may want to look for ways to optimize costs or increase revenue.
                </p>
              )}
              
              {calculatedROI.roi <= 20 && calculatedROI.roi > 0 && (
                <p className="text-sm text-yellow-700 bg-yellow-50 p-2 rounded">
                  <span className="font-bold">Moderate ROI.</span> This investment is marginally profitable.
                  Consider ways to improve efficiency or explore alternative farming models.
                </p>
              )}
              
              {calculatedROI.roi <= 0 && (
                <p className="text-sm text-red-700 bg-red-50 p-2 rounded">
                  <span className="font-bold">Negative ROI.</span> This investment is projected to lose money.
                  Reconsider your assumptions or explore completely different farming options.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-md shadow-sm">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Cost Breakdown</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={costData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {costData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [formatCurrency(value), 'Cost']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-md shadow-sm">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Revenue Sources</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#82ca9d"
                  dataKey="value"
                >
                  {revenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-md shadow-sm">
        <h3 className="text-lg font-medium text-gray-700 mb-4">ROI Comparison Across Farm Types</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={comparisonData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value}%`, 'ROI']} />
              <Legend />
              <Bar 
                dataKey="roi" 
                name="Return on Investment (%)" 
                fill="#8884d8" 
                barSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-md shadow-sm mt-6">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Recommendations</h3>
        
        {selectedFarmType.type === "General Crop Farming" && (
          <div className="space-y-3">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Optimize Fertilizer Usage:</span> Consider soil testing to apply only what's needed, potentially reducing the second-largest cost.
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Improved Seed Varieties:</span> Higher-yielding, pest-resistant varieties may increase your yield beyond the standard 24 bags per acre.
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Direct Marketing:</span> Selling directly to consumers or processors can increase your price per bag by 10-20%.
            </p>
          </div>
        )}
        
        {selectedFarmType.type === "Poultry Farming" && (
          <div className="space-y-3">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Feed Optimization:</span> Since feed represents over 50% of costs, explore alternative sources or bulk purchasing.
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Scale Economies:</span> Increasing your flock size can reduce per-bird costs and improve ROI.
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Value Addition:</span> Processing birds (butchering, packaging) can increase per-bird revenue by 15-30%.
            </p>
          </div>
        )}
        
        {selectedFarmType.type === "Pig Farming" && (
          <div className="space-y-3">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Scale Consideration:</span> The current model shows very low ROI; increasing to at least 30-50 pigs is recommended for better economics.
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Feed Alternatives:</span> Explore crop residues, food processing byproducts, and local feed formulations to reduce the 46% feed cost portion.
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Breeding Model:</span> Consider switching to a farrow-to-finish model for higher margins and self-sufficiency in piglets.
            </p>
          </div>
        )}
        
        {selectedFarmType.type === "Aquatic Farming (Tilapia)" && (
          <div className="space-y-3">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Reduce Feed Cost:</span> As the largest expense (over 60%), explore locally available alternative protein sources or improved feeding practices.
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Value Chain Integration:</span> Smoking, drying, or fresh distribution directly to restaurants can increase margins by 20-40%.
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Multi-Cropping:</span> Consider integrated systems like rice-fish farming or vegetable production using fish pond water to diversify income.
            </p>
          </div>
        )}
        
        <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-md text-sm">
          <p className="font-medium">Risk Management Advice:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Consider climate-smart practices to mitigate weather uncertainties</li>
            <li>Diversify farm enterprises to spread risk</li>
            <li>Explore insurance options for crops or livestock</li>
            <li>Build emergency reserves of 15-20% of operating costs</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ROICalculator;