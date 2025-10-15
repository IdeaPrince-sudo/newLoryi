import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { incomeSourcesData } from '../farmData';
import IncomePieChart from '../charts/IncomePieChart';
import FinanceChart from '../charts/FinanceChart';

const IncomeDashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Income Management</h1>
      
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Income Overview</TabsTrigger>
          <TabsTrigger value="ledger">Income Ledger</TabsTrigger>
          <TabsTrigger value="add">Add Income</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Income Distribution</h2>
              <IncomePieChart />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Monthly Income</h2>
              <FinanceChart showRevenueOnly={true} />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Income Sources</h2>
            <div className="space-y-4">
              {incomeSourcesData.map((source, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span>{source.source}</span>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">${source.amount.toLocaleString()}</span>
                    <span className="text-gray-500 text-sm">{(source.amount / incomeSourcesData.reduce((acc, src) => acc + src.amount, 0) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
              <div className="border-t pt-4 flex justify-between font-semibold">
                <span>Total</span>
                <span>${incomeSourcesData.reduce((acc, src) => acc + src.amount, 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="ledger" className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Income Ledger</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">2025-07-21</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">Corn</td>
                    <td className="px-6 py-4 text-sm">Corn sale to ABC Distributors</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">$8,750</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm"><span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Received</span></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">2025-07-18</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">Wheat</td>
                    <td className="px-6 py-4 text-sm">Wheat sale to XYZ Mills</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">$6,300</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm"><span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Received</span></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">2025-07-15</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">Grants</td>
                    <td className="px-6 py-4 text-sm">Agricultural sustainability grant</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">$2,500</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm"><span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Received</span></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">2025-07-12</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">Soybeans</td>
                    <td className="px-6 py-4 text-sm">Soybean sale to Global Foods Inc.</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">$5,800</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm"><span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">2025-07-05</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">Vegetables</td>
                    <td className="px-6 py-4 text-sm">Vegetable sale to local market</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">$3,200</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm"><span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Received</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="add" className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Add New Income</h2>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="income-date" className="text-sm font-medium">Date</label>
                  <Input id="income-date" type="date" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="income-source" className="text-sm font-medium">Source</label>
                  <select id="income-source" className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="">Select a source</option>
                    {incomeSourcesData.map((source, index) => (
                      <option key={index} value={source.source}>{source.source}</option>
                    ))}
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="income-desc" className="text-sm font-medium">Description</label>
                <Input id="income-desc" placeholder="Enter income description" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="income-amount" className="text-sm font-medium">Amount ($)</label>
                  <Input id="income-amount" type="number" min="0" step="0.01" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="income-status" className="text-sm font-medium">Payment Status</label>
                  <select id="income-status" className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="received">Received</option>
                    <option value="pending">Pending</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="income-invoice" className="text-sm font-medium">Invoice (optional)</label>
                <Input id="income-invoice" type="file" />
              </div>
              
              <div className="flex justify-end">
                <Button type="submit">Save Income</Button>
              </div>
            </form>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IncomeDashboard;