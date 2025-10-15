import React from 'react';
import { cropPerformanceData } from './farmData';

const CostBenefitTable = () => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Revenue</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Profit Margin</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ROI</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Yield (tons)</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {cropPerformanceData.map((crop) => {
            const profit = crop.revenue - crop.cost;
            const profitMargin = (profit / crop.revenue * 100).toFixed(1);
            const roi = (profit / crop.cost * 100).toFixed(1);
            
            return (
              <tr key={crop.name}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{crop.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">${crop.cost.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">${crop.revenue.toLocaleString()}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${profit.toLocaleString()}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {profitMargin}%
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {roi}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{crop.yield}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Totals</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-900">
              ${cropPerformanceData.reduce((acc, crop) => acc + crop.cost, 0).toLocaleString()}
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-900">
              ${cropPerformanceData.reduce((acc, crop) => acc + crop.revenue, 0).toLocaleString()}
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-green-600">
              ${cropPerformanceData.reduce((acc, crop) => acc + (crop.revenue - crop.cost), 0).toLocaleString()}
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-900">
              {(cropPerformanceData.reduce((acc, crop) => acc + (crop.revenue - crop.cost), 0) / 
                cropPerformanceData.reduce((acc, crop) => acc + crop.revenue, 0) * 100).toFixed(1)}%
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-900">
              {(cropPerformanceData.reduce((acc, crop) => acc + (crop.revenue - crop.cost), 0) / 
                cropPerformanceData.reduce((acc, crop) => acc + crop.cost, 0) * 100).toFixed(1)}%
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-900">
              {cropPerformanceData.reduce((acc, crop) => acc + crop.yield, 0).toLocaleString()}
            </th>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default CostBenefitTable;