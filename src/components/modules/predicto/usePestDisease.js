export function getPestDiseaseRisk(region, crop) {
    const risks = {
      Maize: {
        Eastern: {
          diseaseRisk: 'High (Fungal)',
          pestRisk: 'Moderate (Armyworm)',
          advice: 'Apply antifungal spray and monitor early mornings.',
        },
        Volta: {
          diseaseRisk: 'Low',
          pestRisk: 'Low',
          advice: 'Maintain monitoring. No immediate action required.',
        },
      },
      Tomato: {
        Eastern: {
          diseaseRisk: 'Severe (Blight)',
          pestRisk: 'High (Whiteflies)',
          advice: 'Use protective fungicides and sticky traps.',
        },
        Northern: {
          diseaseRisk: 'Medium',
          pestRisk: 'Moderate',
          advice: 'Spray neem-based pesticide every 5 days.',
        },
      },
    };
  
    const cropRisk = risks[crop]?.[region] || {
      diseaseRisk: 'Unknown',
      pestRisk: 'Unknown',
      advice: 'No data available. Please check later.',
    };
  
    return {
      crop,
      region,
      ...cropRisk,
    };
  }
  