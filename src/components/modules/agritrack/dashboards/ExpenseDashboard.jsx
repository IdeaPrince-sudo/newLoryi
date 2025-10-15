import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { expenseCategoriesData } from '../farmData';
import ExpensePieChart from '../charts/ExpensePieChart';
import FinanceChart from '../charts/FinanceChart';

const ExpenseDashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Expense Management</h1>
      
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Expense Overview</TabsTrigger>
          <TabsTrigger value="ledger">Expense Ledger</TabsTrigger>
          <TabsTrigger value="add">Add Expense</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Expense Distribution</h2>
              <ExpensePieChart />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Monthly Expenses</h2>
              <FinanceChart showExpensesOnly={true} />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Expense Categories</h2>
            <div className="space-y-4">
              {expenseCategoriesData.map((category, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span>{category.category}</span>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">${category.amount.toLocaleString()}</span>
                    <span className="text-gray-500 text-sm">{(category.amount / expenseCategoriesData.reduce((acc, cat) => acc + cat.amount, 0) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
              <div className="border-t pt-4 flex justify-between font-semibold">
                <span>Total</span>
                <span>${expenseCategoriesData.reduce((acc, cat) => acc + cat.amount, 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="ledger" className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Expense Ledger</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">2025-07-22</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">Seeds</td>
                    <td className="px-6 py-4 text-sm">Winter wheat seeds</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">$1,250</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm"><span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Paid</span></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">2025-07-20</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">Fertilizers</td>
                    <td className="px-6 py-4 text-sm">Nitrogen fertilizer for corn fields</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">$2,100</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm"><span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Paid</span></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">2025-07-18</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">Equipment</td>
                    <td className="px-6 py-4 text-sm">Irrigation system repair</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">$850</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm"><span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Paid</span></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">2025-07-15</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">Pesticides</td>
                    <td className="px-6 py-4 text-sm">Insecticide for soybean fields</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">$1,475</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm"><span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">2025-07-10</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">Labor</td>
                    <td className="px-6 py-4 text-sm">Seasonal workers - July first half</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">$2,800</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm"><span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Paid</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="add" className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Add New Expense</h2>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="expense-date" className="text-sm font-medium">Date</label>
                  <Input id="expense-date" type="date" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="expense-category" className="text-sm font-medium">Category</label>
                  <select id="expense-category" className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="">Select a category</option>
                    {expenseCategoriesData.map((category, index) => (
                      <option key={index} value={category.category}>{category.category}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="expense-desc" className="text-sm font-medium">Description</label>
                <Input id="expense-desc" placeholder="Enter expense description" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="expense-amount" className="text-sm font-medium">Amount ($)</label>
                  <Input id="expense-amount" type="number" min="0" step="0.01" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="expense-status" className="text-sm font-medium">Payment Status</label>
                  <select id="expense-status" className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="expense-receipt" className="text-sm font-medium">Receipt (optional)</label>
                <Input id="expense-receipt" type="file" />
              </div>
              
              <div className="flex justify-end">
                <Button type="submit">Save Expense</Button>
              </div>
            </form>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExpenseDashboard;