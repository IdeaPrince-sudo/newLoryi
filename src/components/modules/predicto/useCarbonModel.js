export function estimateCarbonAndGHG(location) {
    const baseCarbon = {
      Ejisu: 3.4,
      Wa: 2.9,
      Tamale: 3.1,
    };
  
    const baseGHG = {
      Ejisu: 1.2,
      Wa: 1.8,
      Tamale: 1.5,
    };
  
    const anomaly = Math.random() < 0.3 ? 'Moderate Risk' : 'Normal';
  
    return {
      soilCarbon: baseCarbon[location],
      ghgEmissions: baseGHG[location],
      anomaly,
    };
  }
  