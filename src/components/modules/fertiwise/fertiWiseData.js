// Mock data for FertiWise application

// Fertilizer recommendations based on soil types
export const fertilizerRecommendations = [
  {
    id: 1,
    soilType: 'Clay',
    cropType: 'Maize',
    recommendedFertilizers: [
      { name: 'NPK 17-17-17', dosage: '250kg/ha', effectiveness: 85 },
      { name: 'Urea', dosage: '120kg/ha', effectiveness: 80 },
      { name: 'DAP', dosage: '100kg/ha', effectiveness: 75 }
    ],
    notes: 'Clay soils benefit from balanced fertilizers that can improve soil structure.'
  },
  {
    id: 2,
    soilType: 'Sandy',
    cropType: 'Rice',
    recommendedFertilizers: [
      { name: 'NPK 15-15-15', dosage: '300kg/ha', effectiveness: 90 },
      { name: 'Ammonium Sulphate', dosage: '150kg/ha', effectiveness: 85 },
      { name: 'MOP', dosage: '80kg/ha', effectiveness: 70 }
    ],
    notes: 'Sandy soils require more frequent fertilizer applications due to leaching.'
  },
  {
    id: 3,
    soilType: 'Loamy',
    cropType: 'Wheat',
    recommendedFertilizers: [
      { name: 'NPK 20-10-10', dosage: '200kg/ha', effectiveness: 95 },
      { name: 'Urea', dosage: '100kg/ha', effectiveness: 90 },
      { name: 'SSP', dosage: '120kg/ha', effectiveness: 85 }
    ],
    notes: 'Loamy soils have good nutrient retention properties.'
  },
  {
    id: 4,
    soilType: 'Silt',
    cropType: 'Vegetables',
    recommendedFertilizers: [
      { name: 'NPK 12-24-12', dosage: '220kg/ha', effectiveness: 88 },
      { name: 'Calcium Ammonium Nitrate', dosage: '140kg/ha', effectiveness: 82 },
      { name: 'Potassium Nitrate', dosage: '90kg/ha', effectiveness: 78 }
    ],
    notes: 'Silt soils benefit from phosphorus-rich fertilizers for vegetable crops.'
  },
  {
    id: 5,
    soilType: 'Acidic',
    cropType: 'Tea',
    recommendedFertilizers: [
      { name: 'Rock Phosphate', dosage: '180kg/ha', effectiveness: 92 },
      { name: 'Ammonium Sulphate', dosage: '130kg/ha', effectiveness: 88 },
      { name: 'Potassium Magnesium Sulphate', dosage: '110kg/ha', effectiveness: 85 }
    ],
    notes: 'Acidic soils work well with tea but need specific nutrient balance.'
  }
];

// Soil health data
export const soilHealthData = [
  {
    id: 1,
    farmerId: 'F001',
    location: { lat: 1.3521, lng: 103.8198 },
    lastTestedDate: '2023-05-15',
    pH: 6.5,
    organicMatter: 3.2,
    nitrogen: 45,
    phosphorus: 28,
    potassium: 180,
    micronutrients: {
      zinc: 0.8,
      iron: 4.5,
      manganese: 1.2,
      copper: 0.3
    },
    recommendedActions: [
      'Add phosphorus supplement',
      'Maintain current nitrogen levels',
      'Consider zinc micronutrient supplementation'
    ]
  },
  {
    id: 2,
    farmerId: 'F002',
    location: { lat: 1.3423, lng: 103.7890 },
    lastTestedDate: '2023-06-10',
    pH: 5.8,
    organicMatter: 2.1,
    nitrogen: 32,
    phosphorus: 15,
    potassium: 120,
    micronutrients: {
      zinc: 0.5,
      iron: 5.2,
      manganese: 0.9,
      copper: 0.2
    },
    recommendedActions: [
      'Apply lime to increase pH',
      'Add nitrogen rich fertilizer',
      'Increase phosphorus and potassium'
    ]
  },
  {
    id: 3,
    farmerId: 'F003',
    location: { lat: 1.3644, lng: 103.8277 },
    lastTestedDate: '2023-04-22',
    pH: 7.2,
    organicMatter: 4.5,
    nitrogen: 60,
    phosphorus: 35,
    potassium: 210,
    micronutrients: {
      zinc: 1.1,
      iron: 3.8,
      manganese: 1.5,
      copper: 0.4
    },
    recommendedActions: [
      'Maintain current practices',
      'Monitor potassium levels'
    ]
  },
  {
    id: 4,
    farmerId: 'F004',
    location: { lat: 1.3700, lng: 103.8300 },
    lastTestedDate: '2023-07-05',
    pH: 4.9,
    organicMatter: 1.8,
    nitrogen: 25,
    phosphorus: 12,
    potassium: 95,
    micronutrients: {
      zinc: 0.3,
      iron: 6.1,
      manganese: 0.7,
      copper: 0.1
    },
    recommendedActions: [
      'Apply dolomitic lime urgently',
      'Increase all major nutrients',
      'Add organic matter',
      'Consider full-spectrum micronutrient supplement'
    ]
  }
];

// Certified supplier data
export const certifiedSuppliers = [
  {
    id: 1,
    name: 'AgroTech Fertilizers Ltd',
    location: { lat: 1.3520, lng: 103.8192 },
    contactInfo: {
      phone: '+65 6789 1234',
      email: 'info@agrotechfert.com',
      website: 'www.agrotechfert.com'
    },
    certificationLevel: 'Gold',
    verificationStatus: 'Verified',
    productCategories: ['Organic', 'NPK', 'Micronutrients'],
    ratings: 4.8,
    reviewCount: 235,
    supplyChainScore: 95
  },
  {
    id: 2,
    name: 'Green Earth Fertilizers',
    location: { lat: 1.3440, lng: 103.7950 },
    contactInfo: {
      phone: '+65 6123 4567',
      email: 'contact@greenearthfert.com',
      website: 'www.greenearthfert.com'
    },
    certificationLevel: 'Silver',
    verificationStatus: 'Verified',
    productCategories: ['Organic', 'Biofertilizers', 'Soil Amendments'],
    ratings: 4.5,
    reviewCount: 187,
    supplyChainScore: 88
  },
  {
    id: 3,
    name: 'FarmNutrients Pte Ltd',
    location: { lat: 1.3650, lng: 103.8280 },
    contactInfo: {
      phone: '+65 6234 5678',
      email: 'support@farmnutrients.com',
      website: 'www.farmnutrients.com'
    },
    certificationLevel: 'Gold',
    verificationStatus: 'Verified',
    productCategories: ['NPK', 'Urea', 'DAP', 'Foliar Sprays'],
    ratings: 4.9,
    reviewCount: 312,
    supplyChainScore: 97
  },
  {
    id: 4,
    name: 'SoilHealth Solutions',
    location: { lat: 1.3560, lng: 103.8100 },
    contactInfo: {
      phone: '+65 6345 6789',
      email: 'info@soilhealth.com',
      website: 'www.soilhealth.com'
    },
    certificationLevel: 'Bronze',
    verificationStatus: 'Under Review',
    productCategories: ['Soil Conditioners', 'Micronutrients', 'pH Adjusters'],
    ratings: 4.2,
    reviewCount: 98,
    supplyChainScore: 82
  }
];

// Fertilizer history data
export const fertilizerHistory = [
  {
    id: 1,
    farmerId: 'F001',
    fieldId: 'FLD001',
    date: '2023-01-15',
    fertilizerType: 'NPK 17-17-17',
    amount: '250kg',
    areaCovered: '1 hectare',
    applicationMethod: 'Broadcast',
    cropStage: 'Pre-planting',
    weather: 'Sunny',
    cost: 325
  },
  {
    id: 2,
    farmerId: 'F001',
    fieldId: 'FLD001',
    date: '2023-03-10',
    fertilizerType: 'Urea',
    amount: '120kg',
    areaCovered: '1 hectare',
    applicationMethod: 'Side dressing',
    cropStage: 'Vegetative growth',
    weather: 'Cloudy',
    cost: 180
  },
  {
    id: 3,
    farmerId: 'F002',
    fieldId: 'FLD003',
    date: '2023-02-05',
    fertilizerType: 'NPK 15-15-15',
    amount: '300kg',
    areaCovered: '1.5 hectare',
    applicationMethod: 'Broadcast',
    cropStage: 'Pre-planting',
    weather: 'Sunny',
    cost: 420
  },
  {
    id: 4,
    farmerId: 'F002',
    fieldId: 'FLD003',
    date: '2023-04-12',
    fertilizerType: 'Ammonium Sulphate',
    amount: '150kg',
    areaCovered: '1.5 hectare',
    applicationMethod: 'Fertigation',
    cropStage: 'Flowering',
    weather: 'Light rain',
    cost: 225
  },
  {
    id: 5,
    farmerId: 'F001',
    fieldId: 'FLD002',
    date: '2023-05-20',
    fertilizerType: 'DAP',
    amount: '100kg',
    areaCovered: '0.8 hectare',
    applicationMethod: 'Broadcast',
    cropStage: 'Pre-planting',
    weather: 'Sunny',
    cost: 200
  }
];

// Counterfeit reports data
export const counterfeitReports = [
  {
    id: 1,
    location: { lat: 1.3430, lng: 103.7920 },
    reportDate: '2023-03-05',
    productName: 'Fake NPK 20-20-20',
    reporterType: 'Farmer',
    severity: 'High',
    status: 'Verified',
    description: 'Purchased fertilizer didn\'t dissolve properly and had unusual color.',
    affectedArea: '2 districts',
    actionTaken: 'Supplier blacklisted, warning issued to farmers'
  },
  {
    id: 2,
    location: { lat: 1.3610, lng: 103.8250 },
    reportDate: '2023-04-12',
    productName: 'Counterfeit Urea',
    reporterType: 'Extension Officer',
    severity: 'Medium',
    status: 'Under Investigation',
    description: 'Suspected diluted urea being sold at discount prices.',
    affectedArea: 'Local market only',
    actionTaken: 'Samples collected for testing'
  },
  {
    id: 3,
    location: { lat: 1.3580, lng: 103.8150 },
    reportDate: '2023-05-28',
    productName: 'Mislabeled Organic Fertilizer',
    reporterType: 'Regulatory Agent',
    severity: 'Medium',
    status: 'Verified',
    description: 'Product labeled as organic contains synthetic chemicals.',
    affectedArea: '3 districts',
    actionTaken: 'Product recalled, fines imposed'
  }
];

// Weather forecast data (for seasonal recommendations)
export const weatherForecast = [
  {
    month: 'August',
    avgTemperature: 28,
    rainfall: 'High',
    humidity: 85,
    recommendedFertilizerAdjustments: 'Reduce nitrogen application by 15%, apply slow-release fertilizers'
  },
  {
    month: 'September',
    avgTemperature: 29,
    rainfall: 'Medium',
    humidity: 80,
    recommendedFertilizerAdjustments: 'Standard application rates, focus on balanced NPK'
  },
  {
    month: 'October',
    avgTemperature: 27,
    rainfall: 'Low',
    humidity: 75,
    recommendedFertilizerAdjustments: 'Increase potassium by 10%, consider foliar applications'
  },
  {
    month: 'November',
    avgTemperature: 26,
    rainfall: 'Medium',
    humidity: 78,
    recommendedFertilizerAdjustments: 'Apply micronutrients, maintain standard NPK rates'
  }
];

// Fertilizer market prices
export const fertilizerPrices = [
  { name: 'Urea', price: 450, unit: 'per ton', trend: 'stable' },
  { name: 'DAP', price: 580, unit: 'per ton', trend: 'increasing' },
  { name: 'NPK 15-15-15', price: 520, unit: 'per ton', trend: 'stable' },
  { name: 'NPK 17-17-17', price: 540, unit: 'per ton', trend: 'stable' },
  { name: 'Ammonium Sulphate', price: 320, unit: 'per ton', trend: 'decreasing' },
  { name: 'MOP', price: 390, unit: 'per ton', trend: 'increasing' },
  { name: 'Organic Compost', price: 250, unit: 'per ton', trend: 'stable' },
  { name: 'Micronutrient Mix', price: 780, unit: 'per ton', trend: 'stable' }
];

// Soil types and characteristics
export const soilTypes = [
  {
    type: 'Clay',
    characteristics: {
      texture: 'Heavy, sticky when wet',
      drainage: 'Poor',
      nutrientRetention: 'High',
      waterRetention: 'High',
      workability: 'Difficult'
    },
    suitableCrops: ['Rice', 'Wheat', 'Cabbage'],
    fertilizerConsiderations: 'Clay soils generally need less frequent fertilizer applications but may require amendments to improve drainage and reduce compaction.'
  },
  {
    type: 'Sandy',
    characteristics: {
      texture: 'Gritty, loose',
      drainage: 'Excellent',
      nutrientRetention: 'Poor',
      waterRetention: 'Poor',
      workability: 'Easy'
    },
    suitableCrops: ['Carrots', 'Potatoes', 'Radishes'],
    fertilizerConsiderations: 'Sandy soils need more frequent fertilizer applications in smaller amounts to prevent leaching. Organic matter addition is beneficial.'
  },
  {
    type: 'Loamy',
    characteristics: {
      texture: 'Smooth, slightly gritty',
      drainage: 'Good',
      nutrientRetention: 'Good',
      waterRetention: 'Good',
      workability: 'Easy'
    },
    suitableCrops: ['Most crops', 'Vegetables', 'Fruits'],
    fertilizerConsiderations: 'Loamy soils have good natural fertility and balanced nutrient retention. Standard fertilizer practices work well.'
  },
  {
    type: 'Silt',
    characteristics: {
      texture: 'Smooth, floury when dry',
      drainage: 'Moderate',
      nutrientRetention: 'Moderate',
      waterRetention: 'Moderate',
      workability: 'Moderate'
    },
    suitableCrops: ['Vegetables', 'Fruit trees', 'Ornamentals'],
    fertilizerConsiderations: 'Silty soils are naturally fertile but may compact easily. Careful fertilizer application to avoid runoff.'
  },
  {
    type: 'Peaty',
    characteristics: {
      texture: 'Spongy, dark',
      drainage: 'Variable',
      nutrientRetention: 'High (for certain nutrients)',
      waterRetention: 'High',
      workability: 'Easy when drained'
    },
    suitableCrops: ['Blueberries', 'Cranberries', 'Specialized crops'],
    fertilizerConsiderations: 'Peaty soils often need less nitrogen but more phosphorus, potassium, and micronutrients.'
  }
];

// Expert advice content
export const expertAdvice = [
  {
    id: 1,
    topic: 'Organic Farming',
    expert: 'Dr. Sarah Johnson',
    organization: 'Agricultural University',
    content: 'For organic farming, consider using compost, manure, bone meal, and rock phosphate as natural fertilizers. Crop rotation with legumes can naturally improve soil nitrogen. Mulching helps retain moisture and adds organic matter over time.',
    datePublished: '2023-05-12'
  },
  {
    id: 2,
    topic: 'Precision Agriculture',
    expert: 'Prof. Mark Williams',
    organization: 'Tech Agricultural Institute',
    content: 'Precision agriculture uses soil sensors and GPS mapping to apply fertilizers exactly where needed, reducing waste and improving efficiency. Variable rate technology can save 15-30% on fertilizer costs while maintaining or improving yields.',
    datePublished: '2023-06-25'
  },
  {
    id: 3,
    topic: 'Climate-Smart Fertilization',
    expert: 'Dr. Amina Patel',
    organization: 'Climate Agricultural Research Center',
    content: 'As climate patterns shift, consider slower-release fertilizers that are less vulnerable to extreme weather events. Adding biochar can improve carbon sequestration while enhancing soil fertility for multiple seasons.',
    datePublished: '2023-07-08'
  }
];

// Subsidy program data
export const subsidyPrograms = [
  {
    id: 1,
    name: 'National Fertilizer Subsidy Program',
    eligibility: 'Farmers with less than 5 hectares of land',
    discount: '50% on approved fertilizer types',
    registrationProcess: 'Register through local agricultural office with land ownership documents',
    validUntil: '2023-12-31',
    contactInfo: 'helpdesk@agrisubsidy.gov',
    status: 'Active'
  },
  {
    id: 2,
    name: 'Organic Farming Transition Support',
    eligibility: 'Farmers transitioning to certified organic practices',
    discount: '75% on organic inputs for first two years',
    registrationProcess: 'Apply online with transition plan and current farming details',
    validUntil: '2024-06-30',
    contactInfo: 'organic@agrisubsidy.gov',
    status: 'Active'
  },
  {
    id: 3,
    name: 'Small-Scale Farmer Relief Program',
    eligibility: 'Subsistence farmers with annual income below $5,000',
    discount: 'Free basic NPK package for up to 1 hectare',
    registrationProcess: 'Register through village agricultural extension officer',
    validUntil: '2023-10-15',
    contactInfo: 'relief@agrisubsidy.gov',
    status: 'Closing Soon'
  }
];