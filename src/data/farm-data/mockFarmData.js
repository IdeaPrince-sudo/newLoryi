// Mock historical farm data
export const historicalCropData = [
  { year: '2020', cropYield: 120, expenses: 5000, revenue: 8500, profit: 3500 },
  { year: '2021', cropYield: 135, expenses: 5200, revenue: 9100, profit: 3900 },
  { year: '2022', cropYield: 128, expenses: 5600, revenue: 8800, profit: 3200 },
  { year: '2023', cropYield: 145, expenses: 5800, revenue: 10200, profit: 4400 },
  { year: '2024', cropYield: 150, expenses: 6000, revenue: 10800, profit: 4800 },
];

// Mock soil data
export const soilAnalysisData = [
  { id: 1, date: '2024-01-15', pH: 6.2, nitrogen: 'Medium', phosphorus: 'Low', potassium: 'High', moisture: '35%', organicMatter: '4%' },
  { id: 2, date: '2024-03-22', pH: 6.5, nitrogen: 'Medium', phosphorus: 'Medium', potassium: 'High', moisture: '38%', organicMatter: '4.2%' },
  { id: 3, date: '2024-05-18', pH: 6.7, nitrogen: 'High', phosphorus: 'Medium', potassium: 'High', moisture: '40%', organicMatter: '4.5%' },
];

// Mock resource data
export const resourcesData = [
  { 
    id: 1, 
    type: 'Seeds', 
    name: 'Corn Seed - Premium', 
    quantity: 250, 
    unit: 'kg', 
    cost: 1200, 
    purchaseDate: '2024-02-10', 
    expiryDate: '2024-12-10' 
  },
  { 
    id: 2, 
    type: 'Fertilizer', 
    name: 'NPK 15-15-15', 
    quantity: 500, 
    unit: 'kg', 
    cost: 850, 
    purchaseDate: '2024-02-15', 
    expiryDate: '2025-02-15' 
  },
  { 
    id: 3, 
    type: 'Pesticide', 
    name: 'Organic Pest Control', 
    quantity: 30, 
    unit: 'liters', 
    cost: 600, 
    purchaseDate: '2024-03-05', 
    expiryDate: '2024-09-05' 
  },
  { 
    id: 4, 
    type: 'Equipment', 
    name: 'Irrigation Pipes', 
    quantity: 100, 
    unit: 'meters', 
    cost: 350, 
    purchaseDate: '2024-01-20', 
    expiryDate: null 
  },
];

// Mock projects data
export const farmProjectsData = [
  {
    id: 1,
    name: 'Summer Corn 2024',
    farmType: 'crop',
    cropType: 'grain',
    location: 'North Field',
    landSize: 50,
    sizeUnit: 'acres',
    soilType: 'loamy',
    soilpH: 6.5,
    soilMoisture: '38%',
    startDate: '2024-04-15',
    expectedHarvestDate: '2024-08-30',
    status: 'active',
    budget: 12500,
    expenses: 8200,
    estimatedYield: 7500,
    estimatedRevenue: 22500,
    activities: [
      { id: 1, name: 'Land Preparation', startDate: '2024-04-15', endDate: '2024-04-25', status: 'completed', cost: 1200 },
      { id: 2, name: 'Planting', startDate: '2024-04-28', endDate: '2024-05-10', status: 'completed', cost: 3500 },
      { id: 3, name: 'Fertilization', startDate: '2024-05-25', endDate: '2024-05-30', status: 'completed', cost: 1800 },
      { id: 4, name: 'Pest Control', startDate: '2024-06-15', endDate: '2024-06-20', status: 'in-progress', cost: 1200 },
      { id: 5, name: 'Irrigation', startDate: '2024-05-15', endDate: '2024-08-15', status: 'in-progress', cost: 500 },
      { id: 6, name: 'Harvesting', startDate: '2024-08-25', endDate: '2024-08-30', status: 'planned', cost: 2500 },
    ]
  },
  {
    id: 2,
    name: 'Winter Wheat 2023',
    farmType: 'crop',
    cropType: 'grain',
    location: 'South Field',
    landSize: 35,
    sizeUnit: 'acres',
    soilType: 'silty',
    soilpH: 6.8,
    soilMoisture: '42%',
    startDate: '2023-09-15',
    expectedHarvestDate: '2024-06-30',
    status: 'active',
    budget: 9500,
    expenses: 7800,
    estimatedYield: 5250,
    estimatedRevenue: 15750,
    activities: [
      { id: 1, name: 'Land Preparation', startDate: '2023-09-15', endDate: '2023-09-25', status: 'completed', cost: 900 },
      { id: 2, name: 'Planting', startDate: '2023-09-28', endDate: '2023-10-10', status: 'completed', cost: 2800 },
      { id: 3, name: 'Fertilization', startDate: '2023-10-25', endDate: '2023-10-30', status: 'completed', cost: 1500 },
      { id: 4, name: 'Winter Care', startDate: '2023-12-15', endDate: '2024-02-28', status: 'completed', cost: 800 },
      { id: 5, name: 'Spring Fertilization', startDate: '2024-03-15', endDate: '2024-03-20', status: 'completed', cost: 1500 },
      { id: 6, name: 'Pest Control', startDate: '2024-04-15', endDate: '2024-04-20', status: 'completed', cost: 1200 },
      { id: 7, name: 'Harvesting', startDate: '2024-06-25', endDate: '2024-06-30', status: 'planned', cost: 2200 },
    ]
  },
];

// Farm stats for dashboard
export const farmStats = [
  {
    title: 'Total Land Area',
    value: '85 acres',
    change: '+5 acres',
    trend: 'up',
    icon: {
      path: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
      bgColor: 'bg-green-500'
    }
  },
  {
    title: 'Active Projects',
    value: '2',
    change: '0',
    trend: 'neutral',
    icon: {
      path: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
      bgColor: 'bg-blue-500'
    }
  },
  {
    title: 'Current Expenses',
    value: '$16,000',
    change: '+$2,500',
    trend: 'up',
    icon: {
      path: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      bgColor: 'bg-amber-500'
    }
  },
  {
    title: 'Est. Annual Yield',
    value: '12,750 kg',
    change: '+8.5%',
    trend: 'up',
    icon: {
      path: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
      bgColor: 'bg-emerald-500'
    }
  }
];