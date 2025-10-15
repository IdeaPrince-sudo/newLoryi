import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { cropPerformanceData } from '../farmData';

const CropPerformanceChart = () => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={cropPerformanceData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
        <Tooltip formatter={(value, name) => [
          name === 'yield' ? `${value} tons` : `$${value.toLocaleString()}`, 
          name === 'yield' ? 'Yield' : name.charAt(0).toUpperCase() + name.slice(1)
        ]} />
        <Legend />
        <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#8884d8" />
        <Bar yAxisId="left" dataKey="cost" name="Cost" fill="#82ca9d" />
        <Bar yAxisId="right" dataKey="yield" name="Yield" fill="#ffc658" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CropPerformanceChart;