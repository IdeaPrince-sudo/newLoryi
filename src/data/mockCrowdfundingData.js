// Mock data for crowdfunding module

// Mock Campaigns
export const mockCampaigns = [
    {
      id: 'campaign-1',
      title: 'Hurricane Relief Fund',
      description: 'Providing emergency supplies, shelter, and support for families affected by the recent hurricane. Your donations will help us deliver food, clean water, medical supplies, and temporary housing to those in need.',
      targetAmount: 100000,
      currentAmount: 67350,
      withdrawnAmount: 32000,
      category: 'Disaster',
      createdAt: '2025-07-15T08:30:00Z',
      endDate: '2025-09-15T08:30:00Z',
      daysLeft: 50,
      creatorId: 'user-123',
      creatorName: 'Disaster Relief Network',
      imageUrl: '/images/Hurricane.jpg'
    },
    {
      id: 'campaign-2',
      title: 'Community Health Clinic',
      description: 'Establishing a free health clinic to serve low-income communities with basic medical care, vaccinations, and health education. We aim to provide accessible healthcare to those who need it most.',
      targetAmount: 75000,
      currentAmount: 42000,
      withdrawnAmount: 15000,
      category: 'Medical',
      createdAt: '2025-07-01T10:15:00Z',
      endDate: '2025-10-01T10:15:00Z',
      daysLeft: 66,
      creatorId: 'user-456',
      creatorName: 'Community Health Initiative',
      imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8Y2xpbmljfGVufDB8fDB8fA%3D%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60'
    },
    {
      id: 'campaign-3',
      title: 'Rebuilding Earthquake-Affected Schools',
      description: 'Reconstructing schools damaged by recent earthquakes to ensure children can continue their education in safe environments. Funds will be used for construction materials, furniture, and school supplies.',
      targetAmount: 150000,
      currentAmount: 95000,
      withdrawnAmount: 45000,
      category: 'Disaster',
      createdAt: '2025-06-15T14:45:00Z',
      endDate: '2025-08-30T14:45:00Z',
      daysLeft: 34,
      creatorId: 'user-789',
      creatorName: 'Education First Foundation',
      imageUrl: '/images/DisasterRelief.jpg'
    },
    {
      id: 'campaign-4',
      title: 'Clean Water for Rural Communities',
      description: 'Installing clean water wells and filtration systems in rural communities facing water shortages and contamination issues. This project will provide safe drinking water to thousands of families.',
      targetAmount: 50000,
      currentAmount: 47500,
      withdrawnAmount: 25000,
      category: 'Community',
      createdAt: '2025-07-10T09:20:00Z',
      endDate: '2025-09-10T09:20:00Z',
      daysLeft: 45,
      creatorId: 'user-101',
      creatorName: 'Clean Water Initiative',
      imageUrl: '/images/Water.jpg'
    },
    {
      id: 'campaign-5',
      title: 'Wildfire Emergency Response',
      description: 'Supporting firefighters and affected communities during the ongoing wildfire crisis. Funds will provide equipment for first responders, evacuation support, and essential supplies for displaced families.',
      targetAmount: 80000,
      currentAmount: 32000,
      withdrawnAmount: 10000,
      category: 'Disaster',
      createdAt: '2025-07-20T16:10:00Z',
      endDate: '2025-08-20T16:10:00Z',
      daysLeft: 24,
      creatorId: 'user-202',
      creatorName: 'Wildfire Response Team',
      imageUrl: '/images/Wildfire.jpg'
    },
    {
      id: 'campaign-6',
      title: 'School Supplies for Underserved Students',
      description: 'Providing backpacks, notebooks, and essential school supplies to children from low-income families to ensure they have the tools needed for academic success.',
      targetAmount: 25000,
      currentAmount: 19750,
      withdrawnAmount: 12000,
      category: 'Education',
      createdAt: '2025-07-05T11:30:00Z',
      endDate: '2025-08-15T11:30:00Z',
      daysLeft: 19,
      creatorId: 'user-123',
      creatorName: 'Education Support Network',
      imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8c2Nob29sJTIwc3VwcGxpZXN8ZW58MHx8MHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60'
    }
  ];
  
  // Mock Donations
  export const mockDonations = [
    {
      id: 'donation-1',
      campaignId: 'campaign-1',
      donorId: 'donor-1',
      donorName: 'John Smith',
      amount: 100,
      message: 'Stay strong! We are with you.',
      timestamp: '2025-07-16T14:23:00Z',
      anonymous: false
    },
    {
      id: 'donation-2',
      campaignId: 'campaign-1',
      donorId: 'donor-2',
      donorName: 'Sarah Johnson',
      amount: 250,
      message: 'Hope this helps those in need!',
      timestamp: '2025-07-17T09:45:00Z',
      anonymous: false
    },
    {
      id: 'donation-3',
      campaignId: 'campaign-1',
      donorId: 'donor-3',
      donorName: 'Anonymous',
      amount: 1000,
      message: null,
      timestamp: '2025-07-18T16:30:00Z',
      anonymous: true
    },
    {
      id: 'donation-4',
      campaignId: 'campaign-2',
      donorId: 'donor-4',
      donorName: 'Michael Brown',
      amount: 500,
      message: 'Healthcare should be accessible to everyone.',
      timestamp: '2025-07-10T11:15:00Z',
      anonymous: false
    },
    {
      id: 'donation-5',
      campaignId: 'campaign-2',
      donorId: 'donor-5',
      donorName: 'Emily Wilson',
      amount: 75,
      message: 'Thank you for this important initiative!',
      timestamp: '2025-07-12T13:40:00Z',
      anonymous: false
    },
    {
      id: 'donation-6',
      campaignId: 'campaign-3',
      donorId: 'donor-6',
      donorName: 'James Taylor',
      amount: 2000,
      message: 'Education is the foundation for a better future.',
      timestamp: '2025-07-01T10:20:00Z',
      anonymous: false
    },
    {
      id: 'donation-7',
      campaignId: 'campaign-3',
      donorId: 'donor-7',
      donorName: 'Anonymous',
      amount: 5000,
      message: 'Wishing the children a safe learning environment.',
      timestamp: '2025-07-05T15:10:00Z',
      anonymous: true
    },
    {
      id: 'donation-8',
      campaignId: 'campaign-4',
      donorId: 'donor-8',
      donorName: 'Lisa Martinez',
      amount: 150,
      message: 'Clean water is a basic human right!',
      timestamp: '2025-07-12T09:30:00Z',
      anonymous: false
    },
    {
      id: 'donation-9',
      campaignId: 'campaign-5',
      donorId: 'donor-9',
      donorName: 'Robert Chen',
      amount: 300,
      message: 'Supporting our brave firefighters.',
      timestamp: '2025-07-21T14:15:00Z',
      anonymous: false
    },
    {
      id: 'donation-10',
      campaignId: 'campaign-6',
      donorId: 'donor-10',
      donorName: 'Amanda Clark',
      amount: 125,
      message: 'Every child deserves the tools to learn!',
      timestamp: '2025-07-08T11:50:00Z',
      anonymous: false
    }
  ];
  
  // Mock Withdrawals
  export const mockWithdrawals = [
    {
      id: 'withdrawal-1',
      campaignId: 'campaign-1',
      amount: 15000,
      purpose: 'Purchase of emergency supplies and water purification systems.',
      timestamp: '2025-07-20T10:30:00Z',
      status: 'completed',
      paymentMethod: 'bank',
      accountDetails: 'Disaster Relief Network - Bank of America'
    },
    {
      id: 'withdrawal-2',
      campaignId: 'campaign-1',
      amount: 17000,
      purpose: 'Transportation and distribution of food supplies to affected areas.',
      timestamp: '2025-07-23T14:45:00Z',
      status: 'completed',
      paymentMethod: 'bank',
      accountDetails: 'Disaster Relief Network - Bank of America'
    },
    {
      id: 'withdrawal-3',
      campaignId: 'campaign-2',
      amount: 15000,
      purpose: 'Purchase of medical equipment and supplies for the clinic.',
      timestamp: '2025-07-15T09:20:00Z',
      status: 'completed',
      paymentMethod: 'bank',
      accountDetails: 'Community Health Initiative - Wells Fargo'
    },
    {
      id: 'withdrawal-4',
      campaignId: 'campaign-3',
      amount: 25000,
      purpose: 'Construction materials for the first school rebuilding project.',
      timestamp: '2025-07-05T11:10:00Z',
      status: 'completed',
      paymentMethod: 'bank',
      accountDetails: 'Education First Foundation - Chase Bank'
    },
    {
      id: 'withdrawal-5',
      campaignId: 'campaign-3',
      amount: 20000,
      purpose: 'Furniture and educational materials for completed classrooms.',
      timestamp: '2025-07-12T16:30:00Z',
      status: 'completed',
      paymentMethod: 'bank',
      accountDetails: 'Education First Foundation - Chase Bank'
    },
    {
      id: 'withdrawal-6',
      campaignId: 'campaign-4',
      amount: 25000,
      purpose: 'Well drilling equipment and filtration systems.',
      timestamp: '2025-07-15T13:45:00Z',
      status: 'completed',
      paymentMethod: 'bank',
      accountDetails: 'Clean Water Initiative - Citibank'
    },
    {
      id: 'withdrawal-7',
      campaignId: 'campaign-5',
      amount: 10000,
      purpose: 'Protective gear for volunteer firefighters.',
      timestamp: '2025-07-22T10:15:00Z',
      status: 'pending',
      paymentMethod: 'bank',
      accountDetails: 'Wildfire Response Team - US Bank'
    },
    {
      id: 'withdrawal-8',
      campaignId: 'campaign-6',
      amount: 12000,
      purpose: 'Bulk purchase of backpacks and school supplies.',
      timestamp: '2025-07-10T09:30:00Z',
      status: 'completed',
      paymentMethod: 'bank',
      accountDetails: 'Education Support Network - Bank of America'
    }
  ];