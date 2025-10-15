import React from 'react';
import { historicalCropData } from '../../../data/farm-data/mockFarmData';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const FarmHistory = () => {
  // Generate mock data for crop distribution
  const cropDistribution = [
    { name: 'Corn', value: 45, color: '#22c55e' },
    { name: 'Wheat', value: 30, color: '#eab308' },
    { name: 'Soybeans', value: 15, color: '#3b82f6' },
    { name: 'Vegetables', value: 10, color: '#ef4444' },
  ];

  // Mock historical weather data
  const weatherData = [
    { year: '2020', rainfall: 850, temperature: 25.4 },
    { year: '2021', rainfall: 920, temperature: 24.9 },
    { year: '2022', rainfall: 780, temperature: 25.8 },
    { year: '2023', rainfall: 910, temperature: 26.2 },
    { year: '2024', rainfall: 840, temperature: 26.5 },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Historical Farm Data</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-4">Yearly Revenue & Expenses</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={historicalCropData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, '']} />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue" fill="#22c55e" />
                  <Bar dataKey="expenses" name="Expenses" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-4">Profit Trend</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={historicalCropData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Profit']} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    name="Profit"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Historical Weather Impact</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-2">Annual Rainfall</h4>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weatherData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} mm`, 'Rainfall']} />
                  <Legend />
                  <Bar dataKey="rainfall" name="Rainfall (mm)" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-2">Average Temperature</h4>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={weatherData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}°C`, 'Average Temperature']} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="temperature" 
                    name="Temperature (°C)"
                    stroke="#ef4444"
                    strokeWidth={2} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Historical Crop Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cropDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {cropDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Land Usage']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex flex-col justify-center">
            <h4 className="text-md font-medium text-gray-700 mb-2">Crop Performance Summary</h4>
            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-medium text-gray-600 mb-1">Corn</h5>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">85% yield efficiency</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Consistent high performer over 5 years</p>
              </div>
              
              <div>
                <h5 className="text-sm font-medium text-gray-600 mb-1">Wheat</h5>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">78% yield efficiency</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Good winter hardiness, consistent returns</p>
              </div>
              
              <div>
                <h5 className="text-sm font-medium text-gray-600 mb-1">Soybeans</h5>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">70% yield efficiency</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Helps with soil nitrogen, good rotation crop</p>
              </div>
              
              <div>
                <h5 className="text-sm font-medium text-gray-600 mb-1">Vegetables</h5>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">92% yield efficiency</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">High value crops, excellent returns but labor intensive</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Historical Notes & Observations</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-green-500 pl-4">
            <p className="text-sm text-gray-700">The 2023 season saw record corn yields due to optimal rainfall in June and July. The implementation of new irrigation technology in the North Field contributed to a 12% increase in crop yield.</p>
            <p className="text-xs text-gray-500 mt-1">July 30, 2023</p>
          </div>
          
          <div className="border-l-4 border-amber-500 pl-4">
            <p className="text-sm text-gray-700">Early frost in 2022 affected the soybean harvest, resulting in approximately 8% yield loss. Consider earlier planting or shorter-season varieties for future years with similar climate patterns.</p>
            <p className="text-xs text-gray-500 mt-1">October 15, 2022</p>
          </div>
          
          <div className="border-l-4 border-blue-500 pl-4">
            <p className="text-sm text-gray-700">The crop rotation pattern implemented in 2021 showed significant improvements in soil health. Soil tests revealed 15% increase in organic matter and improved nitrogen availability.</p>
            <p className="text-xs text-gray-500 mt-1">December 5, 2021</p>
          </div>
          
          <div className="border-l-4 border-red-500 pl-4">
            <p className="text-sm text-gray-700">Heavy rainfall in Spring 2020 delayed planting by nearly 3 weeks. Future contingency plans should include faster-maturing seed varieties to compensate for potential late planting.</p>
            <p className="text-xs text-gray-500 mt-1">June 12, 2020</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmHistory;