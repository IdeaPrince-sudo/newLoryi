// Mock data for the dashboard charts and statistics

// Area Chart Data - Revenue and Profit
export const areaChartData = [
  {
    name: 'Jan',
    revenue: 4000,
    profit: 2400,
  },
  {
    name: 'Feb',
    revenue: 3000,
    profit: 1398,
  },
  {
    name: 'Mar',
    revenue: 2000,
    profit: 9800,
  },
  {
    name: 'Apr',
    revenue: 2780,
    profit: 3908,
  },
  {
    name: 'May',
    revenue: 1890,
    profit: 4800,
  },
  {
    name: 'Jun',
    revenue: 2390,
    profit: 3800,
  },
  {
    name: 'Jul',
    revenue: 3490,
    profit: 4300,
  },
];

// Weather Forecast Data for Line Chart
export const weatherForecastData = [
  {
    day: 'Mon',
    temperature: 28,
    humidity: 65,
    rainfall: 5,
  },
  {
    day: 'Tue',
    temperature: 31,
    humidity: 55,
    rainfall: 0,
  },
  {
    day: 'Wed',
    temperature: 30,
    humidity: 60,
    rainfall: 15,
  },
  {
    day: 'Thu',
    temperature: 26,
    humidity: 75,
    rainfall: 30,
  },
  {
    day: 'Fri',
    temperature: 24,
    humidity: 80,
    rainfall: 20,
  },
  {
    day: 'Sat',
    temperature: 27,
    humidity: 70,
    rainfall: 8,
  },
  {
    day: 'Sun',
    temperature: 29,
    humidity: 60,
    rainfall: 0,
  },
];

// Crop Health Data for Radar Chart
export const cropHealthData = [
  {
    subject: 'Soil Quality',
    score: 85,
    fullMark: 100,
  },
  {
    subject: 'Water',
    score: 70,
    fullMark: 100,
  },
  {
    subject: 'Nutrients',
    score: 80,
    fullMark: 100,
  },
  {
    subject: 'Pest Control',
    score: 90,
    fullMark: 100,
  },
  {
    subject: 'Sun Exposure',
    score: 65,
    fullMark: 100,
  },
];

// Crop Yield Data for Bar Chart
export const cropYieldData = [
  {
    name: 'Corn',
    current: 5.2,
    previous: 4.8,
  },
  {
    name: 'Wheat',
    current: 4.1,
    previous: 3.9,
  },
  {
    name: 'Soybeans',
    current: 3.8,
    previous: 3.5,
  },
  {
    name: 'Rice',
    current: 6.0,
    previous: 5.7,
  },
  {
    name: 'Barley',
    current: 3.2,
    previous: 3.0,
  },
];

// Soil Moisture Data for Gauge Chart
export const soilMoistureData = [
  {
    name: 'Field A',
    value: 68,
  },
  {
    name: 'Field B',
    value: 55,
  },
  {
    name: 'Field C',
    value: 72,
  },
];

// Market Price Data for Pie Chart
export const marketPriceData = [
  { name: 'Corn', value: 432 },
  { name: 'Wheat', value: 280 },
  { name: 'Soybeans', value: 510 },
  { name: 'Rice', value: 360 },
  { name: 'Barley', value: 210 },
];

// Farm Fields Data for TreeMap
export const farmFieldsData = [
  {
    name: 'Field A',
    size: 25,
    crop: 'Corn',
  },
  {
    name: 'Field B',
    size: 18,
    crop: 'Wheat',
  },
  {
    name: 'Field C',
    size: 30,
    crop: 'Soybeans',
  },
  {
    name: 'Field D',
    size: 15,
    crop: 'Rice',
  },
  {
    name: 'Field E',
    size: 12,
    crop: 'Barley',
  },
];

// Recent Activities
export const recentActivities = [
  {
    id: 1,
    action: 'Irrigation scheduled',
    field: 'Field A',
    timestamp: '2025-07-20T08:30:00Z',
    status: 'pending',
  },
  {
    id: 2,
    action: 'Fertilization completed',
    field: 'Field B',
    timestamp: '2025-07-19T14:15:00Z',
    status: 'completed',
  },
  {
    id: 3,
    action: 'Pest detection alert',
    field: 'Field C',
    timestamp: '2025-07-19T10:45:00Z',
    status: 'warning',
  },
  {
    id: 4,
    action: 'Soil analysis results',
    field: 'Field D',
    timestamp: '2025-07-18T16:20:00Z',
    status: 'info',
  },
  {
    id: 5,
    action: 'Harvest scheduled',
    field: 'Field A',
    timestamp: '2025-07-25T07:00:00Z',
    status: 'upcoming',
  },
];