import React from 'react';
import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { monthlyFinanceData, yearlyFinanceData } from '../farmData';

const FinanceChart = ({ showRevenueOnly = false, showExpensesOnly = false, showYearly = false }) => {
  const data = showYearly ? yearlyFinanceData : monthlyFinanceData;
  
  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart
        data={data}
        margin={{
          top: 20,
          right: 20,
          bottom: 20,
          left: 20,
        }}
      >
        <CartesianGrid stroke="#f5f5f5" />
        <XAxis dataKey="name" scale="band" />
        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
        <Legend />
        
        {!showExpensesOnly && (
          <Bar yAxisId="left" dataKey="revenue" name="Revenue" barSize={20} fill="#8884d8" />
        )}
        
        {!showRevenueOnly && (
          <Bar yAxisId="left" dataKey="expenses" name="Expenses" barSize={20} fill="#82ca9d" />
        )}
        
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="profit"
          name="Profit"
          stroke="#ff7300"
          activeDot={{ r: 8 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default FinanceChart;