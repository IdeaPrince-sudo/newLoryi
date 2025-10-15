import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import FinanceChart from '../charts/FinanceChart';
import CropPerformanceChart from '../charts/CropPerformanceChart';
import CostBenefitTable from '../CostBenefitTable';
import PlantingCalendarChart from '../charts/PlantingCalendarChart';
import { yearlyFinanceData } from '../../agritrack/farmData';

const ReportDashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Farm Reports &amp; Analytics</h1>
      
      <Tabs defaultValue="financial">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="financial">Financial Reports</TabsTrigger>
          <TabsTrigger value="crops">Crop Performance</TabsTrigger>
          <TabsTrigger value="seasonal">Seasonal Analysis</TabsTrigger>
          <TabsTrigger value="yearly">Yearly Overview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="financial" className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Monthly Financial Overview</h2>
            <FinanceChart />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Financial Metrics</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Annual Revenue:</span>
                  <span className="font-semibold">${yearlyFinanceData[yearlyFinanceData.length-1].revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Annual Expenses:</span>
                  <span className="font-semibold">${yearlyFinanceData[yearlyFinanceData.length-1].expenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Net Profit:</span>
                  <span className="font-semibold text-green-600">${yearlyFinanceData[yearlyFinanceData.length-1].profit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Profit Margin:</span>
                  <span className="font-semibold">{(yearlyFinanceData[yearlyFinanceData.length-1].profit / yearlyFinanceData[yearlyFinanceData.length-1].revenue * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>ROI:</span>
                  <span className="font-semibold">{(yearlyFinanceData[yearlyFinanceData.length-1].profit / yearlyFinanceData[yearlyFinanceData.length-1].expenses * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Revenue Breakdown</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Q1 Revenue:</span>
                  <span className="font-semibold">${(yearlyFinanceData[yearlyFinanceData.length-1].revenue * 0.15).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Q2 Revenue:</span>
                  <span className="font-semibold">${(yearlyFinanceData[yearlyFinanceData.length-1].revenue * 0.32).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Q3 Revenue:</span>
                  <span className="font-semibold">${(yearlyFinanceData[yearlyFinanceData.length-1].revenue * 0.38).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Q4 Revenue:</span>
                  <span className="font-semibold">${(yearlyFinanceData[yearlyFinanceData.length-1].revenue * 0.15).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="crops" className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Crop Performance Analysis</h2>
            <CropPerformanceChart />
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Cost-Benefit Analysis by Crop</h2>
            <CostBenefitTable />
          </div>
        </TabsContent>
        
        <TabsContent value="seasonal" className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Seasonal Planting Calendar</h2>
            <PlantingCalendarChart />
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Seasonal Analysis</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Spring (Mar-May)</h3>
                <p className="text-gray-600">Primary planting season for corn. Wheat continues growing. Prepare for soybean planting.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium">Summer (Jun-Aug)</h3>
                <p className="text-gray-600">Wheat harvest season. Corn and soybeans in growth phase. Peak maintenance period.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium">Fall (Sep-Nov)</h3>
                <p className="text-gray-600">Corn and soybean harvest. Winter wheat planting begins. Equipment maintenance.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium">Winter (Dec-Feb)</h3>
                <p className="text-gray-600">Planning period. Equipment maintenance. Winter wheat dormancy.</p>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="yearly" className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Yearly Performance Trends</h2>
            <FinanceChart showYearly={true} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Year-over-Year Growth</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Revenue Growth:</span>
                  <span className="font-semibold text-green-600">+19.8%</span>
                </div>
                <div className="flex justify-between">
                  <span>Expense Growth:</span>
                  <span className="font-semibold text-red-600">+10.5%</span>
                </div>
                <div className="flex justify-between">
                  <span>Profit Growth:</span>
                  <span className="font-semibold text-green-600">+26.9%</span>
                </div>
                <div className="flex justify-between">
                  <span>Yield Improvement:</span>
                  <span className="font-semibold text-green-600">+18.9%</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">4-Year Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Revenue (4 yr):</span>
                  <span className="font-semibold">${yearlyFinanceData.reduce((acc, item) => acc + item.revenue, 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Expenses (4 yr):</span>
                  <span className="font-semibold">${yearlyFinanceData.reduce((acc, item) => acc + item.expenses, 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Profit (4 yr):</span>
                  <span className="font-semibold text-green-600">${yearlyFinanceData.reduce((acc, item) => acc + item.profit, 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg. Profit Margin:</span>
                  <span className="font-semibold">
                    {(yearlyFinanceData.reduce((acc, item) => acc + item.profit, 0) / 
                      yearlyFinanceData.reduce((acc, item) => acc + item.revenue, 0) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportDashboard;