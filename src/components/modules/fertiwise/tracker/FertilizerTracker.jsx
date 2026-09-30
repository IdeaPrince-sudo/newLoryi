import React, { useEffect, useState } from 'react';
import { fertilizerPrices } from '../fertiWiseData';
import { useAuth } from '../../../../contexts/AuthContext';
import { api } from '../../../../lib/api';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const emptyRecord = () => ({
  farmId: '',
  date: new Date().toISOString().split('T')[0],
  fertilizerType: '',
  amountKg: '',
  landAreaHa: '',
  crop: '',
  costGhs: '',
  method: '',
});

const getAmountKg = (record) => Number(record.amountKg ?? String(record.amount || '').replace(/[^\d.-]/g, '')) || 0;
const getCostGhs = (record) => Number(record.costGhs ?? record.cost) || 0;
const formatCedis = (value) => new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value) || 0);

const FertilizerTracker = () => {
  const { currentUser } = useAuth();
  const [farms, setFarms] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('6months');
  const [selectedFarmerId, setSelectedFarmerId] = useState('');
  const [showAddRecordForm, setShowAddRecordForm] = useState(false);
  const [newRecord, setNewRecord] = useState(emptyRecord);

  useEffect(() => {
    let active = true;
    const loadTrackerData = async () => {
      setLoading(true);
      setError('');
      try {
        const [farmProfiles, applications] = await Promise.all([api.geoSenseFarms(), api.fertilizerApplications()]);
        if (!active) return;
        const ownFarms = farmProfiles.filter((farm) => farm.ownerId === currentUser?.id || farm.farmerId === currentUser?.id);
        setFarms(ownFarms);
        setRecords(applications.filter((record) => record.ownerId === currentUser?.id));
        setNewRecord((current) => ({ ...current, farmId: current.farmId || (ownFarms.length === 1 ? String(ownFarms[0].id) : '') }));
      } catch (requestError) {
        if (active) setError(requestError.message || 'Fertilizer application history could not be loaded. Check the API connection and try again.');
      } finally {
        if (active) setLoading(false);
      }
    };
    loadTrackerData();
    return () => { active = false; };
  }, [currentUser?.id]);

  const fertilizerTypes = [...new Set([...fertilizerPrices.map((fertilizer) => fertilizer.name), ...records.map((record) => record.fertilizerType)])];

  const filteredRecords = selectedFarmerId
    ? records.filter((record) => String(record.farmId) === selectedFarmerId)
    : records;
    
  // Sort records by date (most recent first)
  const sortedRecords = [...filteredRecords].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Filter records based on time period
  const filterRecordsByTimePeriod = () => {
    const now = new Date();
    let cutoffDate;
    
    switch (selectedFilter) {
      case '1month':
        cutoffDate = new Date(now);
        cutoffDate.setMonth(cutoffDate.getMonth() - 1);
        break;
      case '3months':
        cutoffDate = new Date(now);
        cutoffDate.setMonth(cutoffDate.getMonth() - 3);
        break;
      case '6months':
        cutoffDate = new Date(now);
        cutoffDate.setMonth(cutoffDate.getMonth() - 6);
        break;
      case '1year':
        cutoffDate = new Date(now);
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
        break;
      default:
        cutoffDate = new Date(0); // All records
    }
    
    return sortedRecords.filter(record => new Date(record.date) >= cutoffDate);
  };
  
  const timeFilteredRecords = filterRecordsByTimePeriod();
  
  // Prepare usage trend data for line chart
  const prepareUsageTrendData = () => {
    const recordsByMonth = {};
    
    timeFilteredRecords.forEach(record => {
      const date = new Date(record.date);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const amount = getAmountKg(record);
      
      if (!recordsByMonth[monthKey]) {
        recordsByMonth[monthKey] = {
          month: monthKey,
          total: 0
        };
      }
      
      recordsByMonth[monthKey].total += amount;
    });
    
    return Object.values(recordsByMonth).sort((a, b) => a.month.localeCompare(b.month));
  };
  
  // Prepare cost trend data for area chart
  const prepareCostTrendData = () => {
    const costsByMonth = {};
    
    timeFilteredRecords.forEach(record => {
      const date = new Date(record.date);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      if (!costsByMonth[monthKey]) {
        costsByMonth[monthKey] = {
          month: monthKey,
          cost: 0
        };
      }
      
      costsByMonth[monthKey].cost += getCostGhs(record);
    });
    
    return Object.values(costsByMonth).sort((a, b) => a.month.localeCompare(b.month));
  };
  
  // Calculate total usage for the period
  const totalUsage = timeFilteredRecords.reduce((sum, record) => {
    const amount = getAmountKg(record);
    return sum + amount;
  }, 0);
  
  // Calculate total cost for the period
  const totalCost = timeFilteredRecords.reduce((sum, record) => sum + getCostGhs(record), 0);
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Handle form input changes
  const handleInputChange = (field, value) => {
    setNewRecord({
      ...newRecord,
      [field]: value
    });
  };
  
  // Handle form submission
  const handleSubmitRecord = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    const application = {
      ...newRecord,
      amountKg: Number(newRecord.amountKg),
      landAreaHa: Number(newRecord.landAreaHa),
      costGhs: Number(newRecord.costGhs),
    };
    setSaving(true);
    try {
      const savedRecord = await api.createFertilizerApplication(application);
      setRecords((current) => [savedRecord, ...current]);
      setSelectedFarmerId(String(savedRecord.farmId));
      setNotice(`Application record saved for ${savedRecord.farmName || 'your farm'}.`);
      setShowAddRecordForm(false);
      setNewRecord(emptyRecord());
    } catch (requestError) {
      setError(requestError.message || 'Application record could not be saved. Check the API connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Fertilizer Tracker</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-800">Application History</h2>
          <button
            onClick={() => { setShowAddRecordForm(!showAddRecordForm); setError(''); setNotice(''); }}
            disabled={!farms.length || loading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            {showAddRecordForm ? 'Cancel' : 'Add New Record'}
          </button>
        </div>

        {error && <p role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
        {notice && <p role="status" className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">{notice}</p>}
        {!loading && !farms.length && !error && <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">Add a farm profile before recording fertilizer applications.</p>}
        
        {showAddRecordForm && (
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <h3 className="font-medium text-gray-800 mb-3">Add Fertilizer Application Record</h3>
            
            <form onSubmit={handleSubmitRecord}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Farm</label>
                  <select 
                    required
                    value={newRecord.farmId}
                    onChange={(e) => handleInputChange('farmId', e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                  >
                    <option value="">Select your farm</option>
                    {farms.map((farm) => (
                      <option key={farm.id} value={farm.id}>{farm.farmName} · {farm.region || 'Region not set'}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Applied</label>
                  <input
                    type="date"
                    required
                    value={newRecord.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fertilizer Type</label>
                  <select
                    required
                    value={newRecord.fertilizerType}
                    onChange={(e) => handleInputChange('fertilizerType', e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                  >
                    <option value="">Select Type</option>
                    {fertilizerTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (kg)</label>
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    value={newRecord.amountKg}
                    onChange={(e) => handleInputChange('amountKg', e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                  />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Land Area Applied (hectares)</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={newRecord.landAreaHa}
                    onChange={(e) => handleInputChange('landAreaHa', e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Crop</label>
                  <input
                    type="text"
                    required
                    value={newRecord.crop}
                    onChange={(e) => handleInputChange('crop', e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                  />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cost (GH₵)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={newRecord.costGhs}
                    onChange={(e) => handleInputChange('costGhs', e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Application Method</label>
                  <select
                    required
                    value={newRecord.method}
                    onChange={(e) => handleInputChange('method', e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                  >
                    <option value="">Select Method</option>
                    <option value="Broadcasting">Broadcasting</option>
                    <option value="Side Dressing">Side Dressing</option>
                    <option value="Fertigation">Fertigation</option>
                    <option value="Foliar Spray">Foliar Spray</option>
                    <option value="Banding">Banding</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                    disabled={saving || !farms.length}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0 mb-4">
            <div className="flex items-center">
              <label htmlFor="tracker-farm-filter" className="text-sm font-medium text-gray-700 mr-2">Farm:</label>
              <select
                id="tracker-farm-filter"
                value={selectedFarmerId}
                onChange={(e) => setSelectedFarmerId(e.target.value)}
                className="border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
              >
                <option value="">All Farms</option>
                {farms.map((farm) => (
                  <option key={farm.id} value={farm.id}>{farm.farmName}</option>
                ))}
              </select>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedFilter('1month')}
                className={`px-3 py-1 text-sm rounded-md ${
                  selectedFilter === '1month'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                1 Month
              </button>
              <button
                onClick={() => setSelectedFilter('3months')}
                className={`px-3 py-1 text-sm rounded-md ${
                  selectedFilter === '3months'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                3 Months
              </button>
              <button
                onClick={() => setSelectedFilter('6months')}
                className={`px-3 py-1 text-sm rounded-md ${
                  selectedFilter === '6months'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                6 Months
              </button>
              <button
                onClick={() => setSelectedFilter('1year')}
                className={`px-3 py-1 text-sm rounded-md ${
                  selectedFilter === '1year'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                1 Year
              </button>
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-3 py-1 text-sm rounded-md ${
                  selectedFilter === 'all'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Time
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-md flex items-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700">Total Fertilizer Used</h3>
                <p className="text-2xl font-bold text-gray-900">{totalUsage.toFixed(2)} kg</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md flex items-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700">Total Cost</h3>
                <p className="text-2xl font-bold text-gray-900">{formatCedis(totalCost)}</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Fertilizer Usage Trend</h3>
              <div className="h-60 bg-white p-2 rounded-lg border border-gray-100">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={prepareUsageTrendData()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} kg`, 'Usage']} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      name="Fertilizer Usage (kg)" 
                      stroke="#10B981" 
                      activeDot={{ r: 8 }} 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Cost Trend</h3>
              <div className="h-60 bg-white p-2 rounded-lg border border-gray-100">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={prepareCostTrendData()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCedis(value), 'Cost']} />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="cost" 
                      name="Fertilizer Cost (GH₵)" 
                      stroke="#3B82F6" 
                      fill="#93C5FD" 
                      fillOpacity={0.6} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
        
        <h3 className="font-medium text-gray-800 mb-2">Application Records</h3>
        
        {loading ? (
          <p role="status" className="rounded-md bg-gray-50 p-6 text-center text-sm text-gray-600">Loading fertilizer application records…</p>
        ) : timeFilteredRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farm</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fertilizer Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {timeFilteredRecords.map((record, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(record.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.farmName || farms.find((farm) => String(farm.id) === String(record.farmId))?.farmName || 'Farm'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.fertilizerType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getAmountKg(record).toFixed(2)} kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.crop}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCedis(getCostGhs(record))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-gray-50 p-4 text-center rounded-md">
            <p className="text-sm text-gray-500">No records found for the selected period.</p>
          </div>
        )}
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Efficiency Insights</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-50 p-4 rounded-md">
            <h3 className="font-medium text-green-800 mb-2">Optimal Usage Tracking</h3>
            <p className="text-sm text-gray-700 mb-3">
              Tracking your fertilizer use over time helps identify patterns and optimize application rates for better yield and reduced environmental impact.
            </p>
            <button className="text-green-600 text-sm font-medium hover:text-green-800">
              Get Optimization Tips →
            </button>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-md">
            <h3 className="font-medium text-yellow-800 mb-2">Application Timing</h3>
            <p className="text-sm text-gray-700 mb-3">
              Proper timing of fertilizer application based on crop growth stages and weather conditions can improve nutrient uptake efficiency by up to 30%.
            </p>
            <button className="text-yellow-600 text-sm font-medium hover:text-yellow-800">
              View Best Timing Guide →
            </button>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-md">
            <h3 className="font-medium text-blue-800 mb-2">Cost Reduction Strategies</h3>
            <p className="text-sm text-gray-700 mb-3">
              Analyze your fertilizer spending to identify cost-saving opportunities through bulk purchasing, precise application, and balanced nutrient management.
            </p>
            <button className="text-blue-600 text-sm font-medium hover:text-blue-800">
              Explore Strategies →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FertilizerTracker;