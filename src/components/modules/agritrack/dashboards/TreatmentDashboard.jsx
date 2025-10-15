import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { treatmentEffectivenessData } from '../../agritrack/farmData';
import TreatmentRadarChart from '../charts/TreatmentRadarChart';

const TreatmentDashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Treatment Tracking</h1>
      
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Treatment Overview</TabsTrigger>
          <TabsTrigger value="history">Treatment History</TabsTrigger>
          <TabsTrigger value="add">Add Treatment</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Treatment Effectiveness Analysis</h2>
            <TreatmentRadarChart />
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Treatment Comparison</h2>
            <div className="space-y-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Treatment</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Effectiveness</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Cost Efficiency</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {treatmentEffectivenessData.map((treatment, index) => {
                    // Calculate overall rating (average of effectiveness and cost efficiency)
                    const overallRating = (treatment.effectiveness + treatment.costEfficiency) / 2;
                    let ratingClass = "bg-yellow-100 text-yellow-800";
                    if (overallRating >= 80) {
                      ratingClass = "bg-green-100 text-green-800";
                    } else if (overallRating < 70) {
                      ratingClass = "bg-red-100 text-red-800";
                    }
                    
                    return (
                      <tr key={index}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{treatment.treatment}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 text-center">
                          <div className="flex items-center justify-center">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div className="bg-blue-600 h-2.5 rounded-full" style={{width: `${treatment.effectiveness}%`}}></div>
                            </div>
                            <span className="ml-2">{treatment.effectiveness}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 text-center">
                          <div className="flex items-center justify-center">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div className="bg-green-600 h-2.5 rounded-full" style={{width: `${treatment.costEfficiency}%`}}></div>
                            </div>
                            <span className="ml-2">{treatment.costEfficiency}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-center">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${ratingClass}`}>
                            {overallRating.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Treatment Recommendations</h2>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-blue-50">
                <h3 className="text-lg font-medium text-blue-800">Corn Fields</h3>
                <p className="text-blue-600">Based on current soil conditions and pest presence, recommended treatment is Organic Fertilizer combined with Pesticide A.</p>
              </div>
              <div className="p-4 border rounded-lg bg-green-50">
                <h3 className="text-lg font-medium text-green-800">Wheat Fields</h3>
                <p className="text-green-600">Soil Amendment treatment is recommended with moderate Herbicide application to control weed growth.</p>
              </div>
              <div className="p-4 border rounded-lg bg-yellow-50">
                <h3 className="text-lg font-medium text-yellow-800">Soybean Fields</h3>
                <p className="text-yellow-600">Recommended treatment includes Fungicide application and minimal Pesticide B to address current fungal concerns.</p>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Treatment History</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Treatment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Field</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied By</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Results</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">2025-07-21</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">Pesticide A</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">North Field (Corn)</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">David</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">12 liters</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Excellent</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">2025-07-18</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">Organic Fertilizer</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">East Field (Wheat)</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">John</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">200 kg</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Good</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">2025-07-15</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">Fungicide</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">South Field (Soybeans)</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">David</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">8 liters</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Good</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">2025-07-10</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">Herbicide</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">West Field (Vegetables)</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">Mike</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">5 liters</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Fair</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">2025-07-05</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">Soil Amendment</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">North Field (Corn)</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">John</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">150 kg</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Excellent</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="add" className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Add New Treatment</h2>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="treatment-date" className="text-sm font-medium">Date</label>
                  <Input id="treatment-date" type="date" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="treatment-type" className="text-sm font-medium">Treatment Type</label>
                  <select id="treatment-type" className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="">Select a treatment</option>
                    {treatmentEffectivenessData.map((treatment, index) => (
                      <option key={index} value={treatment.treatment}>{treatment.treatment}</option>
                    ))}
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="treatment-field" className="text-sm font-medium">Field</label>
                  <select id="treatment-field" className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="">Select a field</option>
                    <option value="north">North Field (Corn)</option>
                    <option value="east">East Field (Wheat)</option>
                    <option value="south">South Field (Soybeans)</option>
                    <option value="west">West Field (Vegetables)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="treatment-person" className="text-sm font-medium">Applied By</label>
                  <select id="treatment-person" className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="">Select a person</option>
                    <option value="john">John</option>
                    <option value="david">David</option>
                    <option value="mike">Mike</option>
                    <option value="sarah">Sarah</option>
                    <option value="maria">Maria</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="treatment-amount" className="text-sm font-medium">Amount</label>
                  <Input id="treatment-amount" placeholder="e.g. 10 liters" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="treatment-cost" className="text-sm font-medium">Cost ($)</label>
                  <Input id="treatment-cost" type="number" min="0" step="0.01" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="treatment-notes" className="text-sm font-medium">Notes</label>
                <textarea
                  id="treatment-notes"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[100px]"
                  placeholder="Additional notes about the treatment"
                ></textarea>
              </div>
              
              <div className="flex justify-end">
                <Button type="submit">Save Treatment</Button>
              </div>
            </form>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TreatmentDashboard;