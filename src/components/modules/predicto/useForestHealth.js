export function analyzeForestHealth(region) {
    const coverStatus = {
      Ahafo: 'Stable',
      Ashanti: 'Declining',
      'Upper West': 'Critical',
      Savannah: 'Fragmented',
    };
  
    const fireRisk = {
      Ahafo: 'Low',
      Ashanti: 'Medium',
      'Upper West': 'High',
      Savannah: 'Extreme',
    };
  
    const soilRisk = {
      Ahafo: 'Moderate',
      Ashanti: 'Erosion Risk',
      'Upper West': 'Salinity Detected',
      Savannah: 'Severe Erosion',
    };
  
    const degradationLevel = {
      Ahafo: 'Mild',
      Ashanti: 'Moderate',
      'Upper West': 'Severe',
      Savannah: 'Very High',
    };
  
    return {
      coverStatus: coverStatus[region],
      fireRisk: fireRisk[region],
      soilRisk: soilRisk[region],
      degradationLevel: degradationLevel[region],
    };
  }
  