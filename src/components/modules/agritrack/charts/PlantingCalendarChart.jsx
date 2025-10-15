import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { seasonalPlantingData } from '../../agritrack/farmData';

const PlantingCalendarChart = () => {
  // Transform the seasonal planting data into chart format
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const chartData = months.map((month, index) => {
    const monthIndex = index + 1;
    const data = {
      name: month,
      month: monthIndex,
    };
    
    // Check each crop's planting, growing, and harvesting phases
    Object.entries(seasonalPlantingData).forEach(([crop, schedule]) => {
      if (schedule.plant.includes(monthIndex)) {
        data[`${crop}Plant`] = 1;
      }
      if (schedule.grow.includes(monthIndex)) {
        data[`${crop}Grow`] = 1;
      }
      if (schedule.harvest.includes(monthIndex)) {
        data[`${crop}Harvest`] = 1;
      }
    });
    
    return data;
  });
  
  // Define colors for different phases
  const cropColors = {
    corn: {
      plant: '#8884d8',
      grow: '#83a6ed',
      harvest: '#8dd1e1',
    },
    wheat: {
      plant: '#82ca9d',
      grow: '#a4de6c',
      harvest: '#d0ed57',
    },
    soybeans: {
      plant: '#ffc658',
      grow: '#ffb14e',
      harvest: '#ff8042',
    }
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
        barSize={20}
        barGap={0}
        barCategoryGap={2}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis hide />
        <Tooltip
          formatter={(value, name) => {
            if (value === 1) {
              const cropName = name.replace(/Plant|Grow|Harvest/g, '');
              const phase = name.replace(cropName, '');
              return [`${cropName} - ${phase}`, ''];
            }
            return ['', ''];
          }}
        />
        <Legend
          formatter={(value) => {
            const cropName = value.replace(/Plant|Grow|Harvest/g, '');
            const phase = value.replace(cropName, '');
            return `${cropName.charAt(0).toUpperCase() + cropName.slice(1)} ${phase}`;
          }}
        />
        
        {Object.keys(seasonalPlantingData).map(crop => (
          <React.Fragment key={crop}>
            <Bar dataKey={`${crop}Plant`} name={`${crop}Plant`} stackId={crop} fill={cropColors[crop].plant} />
            <Bar dataKey={`${crop}Grow`} name={`${crop}Grow`} stackId={crop} fill={cropColors[crop].grow} />
            <Bar dataKey={`${crop}Harvest`} name={`${crop}Harvest`} stackId={crop} fill={cropColors[crop].harvest} />
          </React.Fragment>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PlantingCalendarChart;