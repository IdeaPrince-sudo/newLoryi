// Farm Statistics
export const farmStats = [
  {
    id: 1,
    title: 'Total Revenue',
    value: '$86,432',
    change: '+19.8%',
    icon: 'fa-dollar-sign',
    iconColor: 'text-green-500',
    changeType: 'increase'
  },
  {
    id: 2,
    title: 'Total Expenses',
    value: '$34,519',
    change: '+10.5%',
    icon: 'fa-credit-card',
    iconColor: 'text-red-500',
    changeType: 'increase'
  },
  {
    id: 3,
    title: 'Net Profit',
    value: '$51,913',
    change: '+26.9%',
    icon: 'fa-chart-line',
    iconColor: 'text-blue-500',
    changeType: 'increase'
  },
  {
    id: 4,
    title: 'Crop Yield',
    value: '157 tons',
    change: '+18.9%',
    icon: 'fa-seedling',
    iconColor: 'text-green-500',
    changeType: 'increase'
  }
];

// Monthly Financial Data
export const monthlyFinanceData = [
  { name: 'Jan', revenue: 4200, expenses: 1800, profit: 2400 },
  { name: 'Feb', revenue: 3800, expenses: 1600, profit: 2200 },
  { name: 'Mar', revenue: 5100, expenses: 2100, profit: 3000 },
  { name: 'Apr', revenue: 6700, expenses: 2700, profit: 4000 },
  { name: 'May', revenue: 8900, expenses: 3500, profit: 5400 },
  { name: 'Jun', revenue: 11500, expenses: 4200, profit: 7300 },
  { name: 'Jul', revenue: 13800, expenses: 5100, profit: 8700 },
  { name: 'Aug', revenue: 12600, expenses: 4800, profit: 7800 },
  { name: 'Sep', revenue: 9800, expenses: 3900, profit: 5900 },
  { name: 'Oct', revenue: 7200, expenses: 3100, profit: 4100 },
  { name: 'Nov', revenue: 5300, expenses: 2200, profit: 3100 },
  { name: 'Dec', revenue: 4500, expenses: 1900, profit: 2600 }
];

// Yearly Financial Data
export const yearlyFinanceData = [
  { name: '2021', revenue: 62150, expenses: 26890, profit: 35260 },
  { name: '2022', revenue: 68732, expenses: 28950, profit: 39782 },
  { name: '2023', revenue: 72150, expenses: 31240, profit: 40910 },
  { name: '2024', revenue: 86432, expenses: 34519, profit: 51913 }
];

// Expense Categories Data
export const expenseCategoriesData = [
  { category: 'Seeds', amount: 6500 },
  { category: 'Fertilizers', amount: 7200 },
  { category: 'Pesticides', amount: 4300 },
  { category: 'Equipment', amount: 5800 },
  { category: 'Fuel', amount: 3100 },
  { category: 'Labor', amount: 5200 },
  { category: 'Utilities', amount: 1600 },
  { category: 'Maintenance', amount: 819 }
];

// Income Sources Data
export const incomeSourcesData = [
  { source: 'Corn', amount: 28500 },
  { source: 'Wheat', amount: 21700 },
  { source: 'Soybeans', amount: 18300 },
  { source: 'Vegetables', amount: 12100 },
  { source: 'Grants', amount: 5832 }
];

// Crop Performance Data
export const cropPerformanceData = [
  { name: 'Corn', cost: 12450, revenue: 28500, yield: 62 },
  { name: 'Wheat', cost: 10380, revenue: 21700, yield: 48 },
  { name: 'Soybeans', cost: 7920, revenue: 18300, yield: 34 },
  { name: 'Vegetables', cost: 3769, revenue: 12100, yield: 13 }
];

// Treatment Effectiveness Data
export const treatmentEffectivenessData = [
  { treatment: 'Organic Fertilizer', effectiveness: 78, costEfficiency: 65 },
  { treatment: 'Pesticide A', effectiveness: 92, costEfficiency: 72 },
  { treatment: 'Pesticide B', effectiveness: 65, costEfficiency: 85 },
  { treatment: 'Fungicide', effectiveness: 81, costEfficiency: 74 },
  { treatment: 'Herbicide', effectiveness: 88, costEfficiency: 68 },
  { treatment: 'Soil Amendment', effectiveness: 75, costEfficiency: 90 }
];

// Task Schedule Data
export const taskScheduleData = [
  {
    id: 1,
    task: 'Apply fertilizer to North Field',
    assignee: 'John',
    dueDate: '2025-07-25',
    priority: 'high',
    status: 'pending'
  },
  {
    id: 2,
    task: 'Repair tractor',
    assignee: 'Mike',
    dueDate: '2025-07-26',
    priority: 'medium',
    status: 'in-progress'
  },
  {
    id: 3,
    task: 'Order seeds for next season',
    assignee: 'Sarah',
    dueDate: '2025-08-15',
    priority: 'low',
    status: 'pending'
  },
  {
    id: 4,
    task: 'Inspect irrigation system',
    assignee: 'David',
    dueDate: '2025-07-22',
    priority: 'high',
    status: 'overdue'
  },
  {
    id: 5,
    task: 'Schedule equipment maintenance',
    assignee: 'Maria',
    dueDate: '2025-07-29',
    priority: 'medium',
    status: 'pending'
  },
  {
    id: 6,
    task: 'Prepare East Field for planting',
    assignee: 'John',
    dueDate: '2025-08-02',
    priority: 'high',
    status: 'pending'
  },
  {
    id: 7,
    task: 'Update inventory records',
    assignee: 'Sarah',
    dueDate: '2025-07-24',
    priority: 'low',
    status: 'completed'
  }
];

// Activity Log Data
export const activityLogData = [
  {
    id: 1,
    date: '2025-07-23',
    type: 'Field Operation',
    performedBy: 'John',
    location: 'North Field',
    description: 'Completed planting corn in the north section.'
  },
  {
    id: 2,
    date: '2025-07-22',
    type: 'Maintenance',
    performedBy: 'Mike',
    location: 'Equipment Shed',
    description: 'Performed routine maintenance on tractor and harvester.'
  },
  {
    id: 3,
    date: '2025-07-21',
    type: 'Treatment',
    performedBy: 'David',
    location: 'East Field',
    description: 'Applied pesticide to control aphid infestation.'
  },
  {
    id: 4,
    date: '2025-07-20',
    type: 'Harvest',
    performedBy: 'Sarah',
    location: 'South Field',
    description: 'Completed wheat harvest with yield of 48 tons.'
  },
  {
    id: 5,
    date: '2025-07-18',
    type: 'Field Operation',
    performedBy: 'John',
    location: 'West Field',
    description: 'Prepared soil for next season planting.'
  }
];

// Seasonal Planting Schedule
export const seasonalPlantingData = {
  corn: {
    plant: [4, 5], // April to May
    grow: [6, 7, 8], // June to August
    harvest: [9, 10] // September to October
  },
  wheat: {
    plant: [10, 11], // October to November
    grow: [12, 1, 2, 3, 4, 5], // December to May
    harvest: [6, 7] // June to July
  },
  soybeans: {
    plant: [5, 6], // May to June
    grow: [7, 8], // July to August
    harvest: [9, 10] // September to October
  }
};