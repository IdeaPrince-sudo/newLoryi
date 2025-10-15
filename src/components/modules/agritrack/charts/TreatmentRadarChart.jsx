import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { treatmentEffectivenessData } from '../../agritrack/farmData';

const TreatmentRadarChart = () => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={treatmentEffectivenessData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="treatment" />
        <PolarRadiusAxis angle={30} domain={[0, 100]} />
        <Radar name="Effectiveness (%)" dataKey="effectiveness" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
        <Radar name="Cost Efficiency (%)" dataKey="costEfficiency" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
        <Legend />
        <Tooltip formatter={(value) => `${value}%`} />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default TreatmentRadarChart;