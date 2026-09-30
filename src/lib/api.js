const apiBaseUrl = import.meta.env.VITE_API_URL || 'https://api.loryiai.com/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('loryiToken');
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const body = await response.json().catch(() => ({}));
  if (response.status === 401 && token) {
    window.dispatchEvent(new CustomEvent('loryi:session-expired'));
    throw new Error('Your session expired. Please sign in again.');
  }
  if (!response.ok) throw new Error(body.error?.message || 'API request failed');
  return body.data;
}

export const api = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),
  dashboard: () => request('/dashboard'),
  modules: () => request('/dashboard/modules'),
  updateProfile: (profile) => request('/me', { method: 'PATCH', body: JSON.stringify(profile) }),
  credits: () => request('/credits'),
  adjustCredits: (amount, action = 'Credit Adjustment') => request('/credits/adjust', { method: 'POST', body: JSON.stringify({ amount, action }) }),
  purchaseCredits: (amount) => request('/credits/purchase', { method: 'POST', body: JSON.stringify({ amount }) }),
  redeemCredits: (code) => request('/credits/redeem', { method: 'POST', body: JSON.stringify({ code }) }),
  products: (search = '') => request(`/marketplace/products?search=${encodeURIComponent(search)}`),
  suppliers: () => request('/marketplace/suppliers'),
  counterfeitReports: () => request('/marketplace/counterfeit-reports'),
  createCounterfeitReport: (report) => request('/marketplace/counterfeit-reports', { method: 'POST', body: JSON.stringify(report) }),
  demand: () => request('/marketplace/demand'),
  createDemand: (demand) => request('/marketplace/demand', { method: 'POST', body: JSON.stringify(demand) }),
  campaigns: () => request('/safevest/campaigns'),
  createCampaign: (campaign) => request('/safevest/campaigns', { method: 'POST', body: JSON.stringify(campaign) }),
  donateToCampaign: (campaignId, amount) => request(`/safevest/campaigns/${encodeURIComponent(campaignId)}/donations`, { method: 'POST', body: JSON.stringify({ amount }) }),
  withdrawFromCampaign: (campaignId, amount) => request(`/safevest/campaigns/${encodeURIComponent(campaignId)}/withdrawals`, { method: 'POST', body: JSON.stringify({ amount }) }),
  posts: () => request('/community/posts'),
  createPost: (post) => request('/community/posts', { method: 'POST', body: JSON.stringify(typeof post === 'string' ? { content: post } : post) }),
  replyToPost: (postId, content) => request(`/community/posts/${encodeURIComponent(postId)}/replies`, { method: 'POST', body: JSON.stringify({ content }) }),
  likePost: (postId) => request(`/community/posts/${encodeURIComponent(postId)}/like`, { method: 'POST' }),
  credittrackFarmers: (phone = '') => request(`/credittrack/farmers${phone ? `?phone=${encodeURIComponent(phone)}` : ''}`),
  credittrackFarmer: (farmerId) => request(`/credittrack/farmers/${encodeURIComponent(farmerId)}`),
  credittrackScore: (farmerId) => request(`/credittrack/farmers/${encodeURIComponent(farmerId)}/score`, { method: 'POST' }),
  credittrackScoreHistory: (farmerId) => request(`/credittrack/farmers/${encodeURIComponent(farmerId)}/scores`),
  credittrackFeedback: (farmerId, language) => request(`/credittrack/farmers/${encodeURIComponent(farmerId)}/feedback?language=${encodeURIComponent(language)}`),
  moduleStatus: () => request('/modules'),
  moduleRecords: (collection) => request(`/modules/${encodeURIComponent(collection)}`),
  createModuleRecord: (collection, record) => request(`/modules/${encodeURIComponent(collection)}`, { method: 'POST', body: JSON.stringify(record) }),
  geoSenseFarms: () => request('/modules/farms'),
  fertilizerPlans: () => request('/modules/fertilizer-plans'),
  createFertilizerPlan: (plan) => request('/modules/fertilizer-plans', { method: 'POST', body: JSON.stringify(plan) }),
  fertilizerApplications: () => request('/modules/fertilizer-applications'),
  createFertilizerApplication: (application) => request('/modules/fertilizer-applications', { method: 'POST', body: JSON.stringify(application) }),
  agronomists: () => request('/fertiwise/experts'),
  expertConsultations: () => request('/fertiwise/consultations'),
  bookExpertConsultation: (consultation) => request('/fertiwise/consultations', { method: 'POST', body: JSON.stringify(consultation) }),
  subsidyPrograms: () => request('/fertiwise/subsidies/programs'),
  createSubsidyProgram: (program) => request('/fertiwise/subsidies/programs', { method: 'POST', body: JSON.stringify(program) }),
  subsidyApplications: () => request('/fertiwise/subsidies/applications'),
  createSubsidyApplication: (application) => request('/fertiwise/subsidies/applications', { method: 'POST', body: JSON.stringify(application) }),
  createGeoSenseFarm: (farm) => request('/modules/farms', { method: 'POST', body: JSON.stringify(farm) }),
  updateGeoSenseFarm: (farmId, updates) => request(`/modules/farms/${encodeURIComponent(farmId)}`, { method: 'PATCH', body: JSON.stringify(updates) }),
  deleteGeoSenseFarm: (farmId) => request(`/modules/farms/${encodeURIComponent(farmId)}`, { method: 'DELETE' }),
  livestockTriage: (record) => request('/modules/livestock/triage', { method: 'POST', body: JSON.stringify(record) }),
  soilTests: () => request('/GeoSense/soilTests'),
  createSoilTest: (record) => request('/GeoSense/soilTests', { method: 'POST', body: JSON.stringify(record) }),
  diagnoses: (mine = true) => request(`/DiagnoX/diagnoses${mine ? '?mine=true' : ''}`),
  createDiagnosis: (record) => request('/DiagnoX/diagnoses', { method: 'POST', body: JSON.stringify(record) }),
  analyzeCropImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return request('/DiagnoX/diagnoses/image', { method: 'POST', body: formData });
  },
  analyzeLivestockImage: (file, { species, bodyArea }) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('species', species);
    formData.append('bodyArea', bodyArea);
    return request('/DiagnoX/livestock/diagnoses/image', { method: 'POST', body: formData });
  },
  diseases: ({ search = '', crop = '', severity = '' } = {}) => {
    const params = new URLSearchParams({ search, crop, severity });
    return request(`/DiagnoX/diseases?${params.toString()}`);
  },
  createDisease: (disease, image) => {
    const formData = new FormData();
    Object.entries(disease).forEach(([key, value]) => {
      formData.append(key, Array.isArray(value) ? JSON.stringify(value) : value);
    });
    formData.append('image', image);
    return request('/DiagnoX/diseases', { method: 'POST', body: formData });
  },
  forecasts: () => request('/Predicto/forecasts'),
  alerts: (mine = true) => request(`/Predicto/alerts${mine ? '?mine=true' : ''}`),
  createForecast: (record) => request('/Predicto/forecasts', { method: 'POST', body: JSON.stringify(record) }),
  createYieldPrediction: (record) => request('/Predicto/yield-predictions', { method: 'POST', body: JSON.stringify(record) }),
  analyzeFarmerField: (record) => request('/predicto/farmer-field-analysis', { method: 'POST', body: JSON.stringify(record) }),
  farmerFieldAnalyses: (farmerId) => request(`/predicto/farmer-field-analysis/${encodeURIComponent(farmerId)}`),
  fertilizerPlans: () => request('/FertiWise/plans'),
  createFertilizerPlan: (record) => request('/FertiWise/plans', { method: 'POST', body: JSON.stringify(record) }),
  seedVerifications: () => request('/SeedLin/verifications'),
  createSeedVerification: (record) => request('/SeedLin/verifications', { method: 'POST', body: JSON.stringify(record) }),
  lookupSeedVerification: (code) => request(`/SeedLin/verifications/lookup?code=${encodeURIComponent(code)}`),
  seedAnalyses: () => request('/SeedLin/analyses'),
  createSeedAnalysis: (record) => request('/SeedLin/analyses', { method: 'POST', body: JSON.stringify(record) }),
  analyzeSeedImage: (file, analysisType = 'testkit') => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('analysisType', analysisType);
    return request('/SeedLin/analyses/image', { method: 'POST', body: formData });
  },
  farmProjects: (mine = true) => request(`/FarmIQ/projects${mine ? '?mine=true' : ''}`),
  createFarmProject: (record) => request('/FarmIQ/projects', { method: 'POST', body: JSON.stringify(record) }),
  estimateFarmProject: (project) => request('/FarmIQ/projects/estimate', { method: 'POST', body: JSON.stringify(project) }),
  farmActivities: (mine = true) => request(`/FarmIQ/activities${mine ? '?mine=true' : ''}`),
  createFarmActivity: (record) => request('/FarmIQ/activities', { method: 'POST', body: JSON.stringify(record) }),
  farmMarketPrices: (commodity = '', centre = '') => {
    const params = new URLSearchParams();
    if (commodity) params.set('commodity', commodity);
    if (centre) params.set('centre', centre);
    return request(`/FarmIQ/market-prices${params.size ? `?${params.toString()}` : ''}`);
  },
  terraQChat: (messages) => request('/TerraQ/chat', { method: 'POST', body: JSON.stringify({ messages }) }),
  agritrackActivities: (mine = true) => request(`/AgriTrack/activities${mine ? '?mine=true' : ''}`),
  createAgriTrackRecord: (record) => request('/AgriTrack/activities', { method: 'POST', body: JSON.stringify(record) }),
  updateAgriTrackRecord: (recordId, updates) => request(`/AgriTrack/activities/${encodeURIComponent(recordId)}`, { method: 'PATCH', body: JSON.stringify(updates) }),
  deleteAgriTrackRecord: (recordId) => request(`/AgriTrack/activities/${encodeURIComponent(recordId)}`, { method: 'DELETE' }),
  createUpdate: (record) => request('/UpdateX/posts', { method: 'POST', body: JSON.stringify(record) }),
  integrations: () => request('/platform/integrations'),
  ingest: (source, payload) => request(`/platform/ingest/${encodeURIComponent(source)}`, { method: 'POST', body: JSON.stringify(payload) }),
  evaluateBankPolicy: (payload) => request('/platform/bank/evaluate', { method: 'POST', body: JSON.stringify(payload) }),
  notify: (payload) => request('/platform/notifications', { method: 'POST', body: JSON.stringify(payload) }),
  weather: (location) => {
    const params = typeof location === 'object'
      ? `latitude=${encodeURIComponent(location.latitude)}&longitude=${encodeURIComponent(location.longitude)}&city=${encodeURIComponent(location.name || 'My Location')}`
      : `city=${encodeURIComponent(location)}`;
    return request(`/predicto/weather?${params}`);
  },
  farmWeatherHistory: (farmId, startYear, endYear) => {
    const params = new URLSearchParams({ farmId: String(farmId) });
    if (startYear) params.set('startYear', String(startYear));
    if (endYear) params.set('endYear', String(endYear));
    return request(`/predicto/weather/history?${params.toString()}`);
  },
  monitoring: (location = 'Greater Accra') => {
    const params = typeof location === 'object'
      ? `latitude=${encodeURIComponent(location.latitude)}&longitude=${encodeURIComponent(location.longitude)}&city=${encodeURIComponent(location.name || 'My Location')}`
      : `region=${encodeURIComponent(location)}`;
    return request(`/predicto/weather/monitoring?${params}`);
  },
  carbonCredits: (farmerId = '') => request(`/predicto/carbon-credits${farmerId ? `?farmerId=${encodeURIComponent(farmerId)}` : ''}`),
  pendingCarbonCredits: (limit = 5, offset = 0) => request(`/predicto/carbon-credits/review?limit=${limit}&offset=${offset}`),
  recordCarbonPractice: (activity) => request('/predicto/carbon-credits/activities', { method: 'POST', body: JSON.stringify(activity) }),
  verifyCarbonPractice: (activityId, approved = true, notes = '') => request(`/predicto/carbon-credits/activities/${encodeURIComponent(activityId)}/verify`, { method: 'POST', body: JSON.stringify({ approved, notes }) }),
  redeemCarbonCredits: (units, farmerId = '') => request('/predicto/carbon-credits/redeem', { method: 'POST', body: JSON.stringify({ units, farmerId }) }),
};