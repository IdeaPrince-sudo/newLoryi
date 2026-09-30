import React, { useEffect, useState } from 'react';
import StatsCard from './StatsCard';
import AreaChartComponent from './charts/AreaChart';
import LineChartComponent from './charts/LineChart';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import moduleRegistry from '../data/modules';
import { api } from '../lib/api';

const latestRecord = (records, predicate) => records
  .filter(predicate)
  .sort((first, second) => new Date(second.capturedAt || second.checkedOn || second.recordedAt || second.createdAt || 0) - new Date(first.capturedAt || first.checkedOn || first.recordedAt || first.createdAt || 0))[0];

const summarizeForestry = (records) => {
  const plantings = records.filter((record) => record.type === 'planting');
  const checkedPlantings = plantings.map((planting) => ({
    planting,
    check: latestRecord(records, (record) => record.type === 'survivalCheck' && record.plantingId === planting.id),
  })).filter(({ check }) => check);
  const plantedCount = checkedPlantings.reduce((sum, { planting }) => sum + Number(planting.plantedCount || 0), 0);
  const survivingCount = checkedPlantings.reduce((sum, { check }) => sum + Number(check.survivingCount || 0), 0);
  return { plantingCount: plantings.length, survivalRate: plantedCount ? Math.round((survivingCount / plantedCount) * 100) : null };
};

const FarmerDomainSummary = ({ records, loading, errors }) => {
  const animals = records.livestock.filter((record) => record.type === 'animal');
  const sensorAlerts = animals.filter((animal) => {
    const reading = latestRecord(records.livestock, (record) => record.type === 'sensorReading' && record.animalTag === animal.tag);
    return reading?.highTemperature || reading?.unusualChange;
  }).length;
  const urgentLivestockNotes = records.livestock.filter((record) => record.type === 'triage' && /urgent|same-day/i.test(record.urgency || '')).length;
  const forestry = summarizeForestry(records.forestry);
  const ponds = records.fisheries.filter((record) => record.type === 'pond');
  const latestWaterCheck = latestRecord(records.fisheries, (record) => record.type === 'waterCheck');
  const urgentFishNotes = records.fisheries.filter((record) => record.type === 'diseaseNote' && /urgent/i.test(record.level || '')).length;

  const cards = [
    {
      title: 'Livestock', path: '/livestock', tone: 'border-amber-500',
      value: `${animals.length} animal${animals.length === 1 ? '' : 's'}`,
      detail: sensorAlerts ? `${sensorAlerts} sensor alert${sensorAlerts === 1 ? '' : 's'} · ${urgentLivestockNotes} urgent health note${urgentLivestockNotes === 1 ? '' : 's'}` : `${urgentLivestockNotes} urgent health note${urgentLivestockNotes === 1 ? '' : 's'}`,
      empty: 'No herd records yet',
    },
    {
      title: 'Forestry', path: '/forestry', tone: 'border-emerald-600',
      value: `${forestry.plantingCount} planting group${forestry.plantingCount === 1 ? '' : 's'}`,
      detail: forestry.survivalRate === null ? 'No survival checks saved yet' : `${forestry.survivalRate}% survival across checked trees`,
      empty: 'No tree records yet',
    },
    {
      title: 'Fisheries & Aquaculture', path: '/fisheries', tone: 'border-sky-600',
      value: `${ponds.length} pond${ponds.length === 1 ? '' : 's'}`,
      detail: latestWaterCheck
        ? `Latest ${latestWaterCheck.pondName || latestWaterCheck.pondId || 'pond'} check${latestWaterCheck.dissolvedOxygen === undefined ? '' : ` · DO ${latestWaterCheck.dissolvedOxygen} mg/L`}${urgentFishNotes ? ` · ${urgentFishNotes} urgent health note${urgentFishNotes === 1 ? '' : 's'}` : ''}`
        : `${urgentFishNotes} urgent fish health note${urgentFishNotes === 1 ? '' : 's'}`,
      empty: 'No pond records yet',
    },
  ];

  return (
    <section aria-labelledby="farmer-domain-summary" className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="farmer-domain-summary" className="text-lg font-semibold text-gray-900">Livestock, forestry & fisheries</h2>
        <span className="text-xs text-gray-500">Saved records · refreshes every minute</span>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {cards.map((card) => {
          const collection = card.path === '/livestock' ? 'livestock' : card.path === '/forestry' ? 'forestry' : 'fisheries';
          const hasRecords = records[collection].length > 0;
          return (
            <Link key={card.path} to={card.path} className={`block min-w-0 border-l-4 ${card.tone} bg-white p-4 shadow-sm transition hover:bg-gray-50`}>
              <div className="flex items-center justify-between gap-3"><h3 className="font-semibold text-gray-950">{card.title}</h3><span aria-hidden="true" className="text-gray-400">›</span></div>
              {loading ? <p className="mt-3 text-sm text-gray-500">Loading records…</p> : errors[collection] ? <p className="mt-3 text-sm text-amber-800">Stats unavailable</p> : hasRecords ? <><p className="mt-3 text-lg font-semibold text-gray-900">{card.value}</p><p className="mt-1 text-sm text-gray-600">{card.detail}</p></> : <p className="mt-3 text-sm text-gray-600">{card.empty}</p>}
            </Link>
          );
        })}
      </div>
    </section>
  );
};

const Dashboard = () => {
  const { currentUser, canAccessModule } = useAuth();
  const [domainRecords, setDomainRecords] = useState({ livestock: [], forestry: [], fisheries: [] });
  const [domainErrors, setDomainErrors] = useState({});
  const [domainRecordsLoading, setDomainRecordsLoading] = useState(true);
  const [farmMetrics, setFarmMetrics] = useState({ loading: true, soil: null, diagnosis: null, yieldProject: null, market: null, marketError: '' });

  useEffect(() => {
    if (currentUser?.role !== 'farmer') {
      setDomainRecordsLoading(false);
      return undefined;
    }

    let active = true;
    const refreshRecords = async () => {
      const collections = ['livestock', 'forestry', 'fisheries'];
      const results = await Promise.allSettled(collections.map((collection) => api.moduleRecords(collection)));
      if (!active) return;
      const nextRecords = {};
      const nextErrors = {};
      results.forEach((result, index) => {
        const collection = collections[index];
        if (result.status === 'fulfilled') nextRecords[collection] = result.value;
        else {
          nextRecords[collection] = [];
          nextErrors[collection] = true;
        }
      });
      setDomainRecords(nextRecords);
      setDomainErrors(nextErrors);
      setDomainRecordsLoading(false);
    };

    refreshRecords();
    const intervalId = window.setInterval(refreshRecords, 60000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [currentUser?.role]);

  useEffect(() => {
    if (currentUser?.role !== 'farmer') {
      setFarmMetrics((current) => ({ ...current, loading: false }));
      return undefined;
    }
    let active = true;
    const loadFarmMetrics = async () => {
      const [farmsResult, soilTestsResult, diagnosesResult, projectsResult] = await Promise.allSettled([
        api.geoSenseFarms(),
        api.soilTests(),
        api.diagnoses(),
        api.farmProjects(),
      ]);
      if (!active) return;
      const farms = farmsResult.status === 'fulfilled' && Array.isArray(farmsResult.value) ? farmsResult.value : [];
      const soilTests = soilTestsResult.status === 'fulfilled' && Array.isArray(soilTestsResult.value) ? soilTestsResult.value : [];
      const diagnoses = diagnosesResult.status === 'fulfilled' && Array.isArray(diagnosesResult.value) ? diagnosesResult.value : [];
      const projects = projectsResult.status === 'fulfilled' && Array.isArray(projectsResult.value) ? projectsResult.value : [];
      const mostRecent = (records) => [...records].sort((first, second) => new Date(second.createdAt || second.testedAt || 0) - new Date(first.createdAt || first.testedAt || 0))[0] || null;
      const soil = mostRecent(soilTests) || farms
        .filter((farm) => farm.moisture !== undefined && farm.moisture !== '')
        .sort((first, second) => new Date(second.updatedAt || second.createdAt || 0) - new Date(first.updatedAt || first.createdAt || 0))[0] || null;
      const diagnosis = mostRecent(diagnoses);
      const yieldProject = projects
        .filter((project) => Number(project.estimatedYield ?? project.expectedYield) > 0)
        .sort((first, second) => new Date(second.updatedAt || second.createdAt || 0) - new Date(first.updatedAt || first.createdAt || 0))[0] || null;
      const crops = farms.flatMap((farm) => Array.isArray(farm.suitableCrops) ? farm.suitableCrops : String(farm.suitableCrops || '').split(','))
        .map((crop) => crop.trim().toLowerCase());
      const marketCommodity = crops.some((crop) => /maize|corn/.test(crop)) ? 'Yellow Maize'
        : crops.some((crop) => /rice/.test(crop)) ? 'Rice'
          : crops.some((crop) => /soy|soya/.test(crop)) ? 'Soya Bean'
            : crops.some((crop) => /sorghum/.test(crop)) ? 'Sorghum'
              : crops.some((crop) => /sesame/.test(crop)) ? 'Sesame' : '';
      setFarmMetrics((current) => ({ ...current, loading: false, soil, diagnosis, yieldProject, market: null, marketError: marketCommodity ? '' : 'No GCX-supported crop is listed on your registered farms.' }));
      if (marketCommodity) {
        try {
          const result = await api.farmMarketPrices(marketCommodity);
          if (active) setFarmMetrics((current) => ({ ...current, market: result.latestQuote, marketError: result.message || '' }));
        } catch (error) {
          if (active) setFarmMetrics((current) => ({ ...current, market: null, marketError: error.message || 'Live market price unavailable.' }));
        }
      }
      if (active) setFarmMetrics((current) => ({ ...current, loading: false }));
    };
    loadFarmMetrics();
    const intervalId = window.setInterval(loadFarmMetrics, 60000);
    return () => { active = false; window.clearInterval(intervalId); };
  }, [currentUser?.id, currentUser?.role]);

  if (!currentUser) {
    return <div className="text-center p-6">Please log in to access your dashboard.</div>;
  }

  const allModules = moduleRegistry.filter((mod) => mod.path !== '/');

  const userModules = allModules.filter(
    (mod) => currentUser.role === 'admin' || currentUser.modules?.includes(mod.name)
  );

  // ✅ Role-based message
  const getRoleMessage = () => {
    if (currentUser.role === 'farmer') return "Here's what's happening with your farm today.";
    if (currentUser.role === 'investor') return "Track your investments and discover new farm opportunities.";
    if (currentUser.role.includes('financial') || currentUser.role.includes('insurance') || currentUser.role.includes('security'))
      return "Monitor policies, financial products, and security operations.";
    if (currentUser.role === 'admin') return "Manage users, modules, and platform settings.";
    return "Access your available modules below.";
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-semibold text-gray-900">Welcome back, {currentUser.name}!</h1>
        <p className="mt-1 text-gray-600">{getRoleMessage()}</p>
      </div>

      {/* ✅ FARMER STATS & CHARTS */}
      {currentUser.role === 'farmer' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard title="Soil Moisture" value={farmMetrics.loading ? 'Loading…' : farmMetrics.soil ? `${farmMetrics.soil.moisture ?? farmMetrics.soil.soilData?.moisture ?? '—'}%` : 'No reading'} changeText={farmMetrics.soil ? `Saved soil test · ${new Date(farmMetrics.soil.createdAt || farmMetrics.soil.testedAt || Date.now()).toLocaleDateString()}` : 'Add a soil test to your farm profile'} iconBg="bg-blue-100" iconColor="text-blue-600" />
            <StatsCard title="Crop Health" value={farmMetrics.loading ? 'Loading…' : farmMetrics.diagnosis?.diseaseName || 'No diagnosis'} changeText={farmMetrics.diagnosis ? `${farmMetrics.diagnosis.severity || 'Assessment'} · ${farmMetrics.diagnosis.confidence ?? '—'}% confidence` : 'Run a DiagnoX scan to assess a crop'} iconBg="bg-green-100" iconColor="text-green-600" />
            <StatsCard title="Yield Forecast" value={farmMetrics.loading ? 'Loading…' : farmMetrics.yieldProject ? `${Number(farmMetrics.yieldProject.estimatedYield ?? farmMetrics.yieldProject.expectedYield).toLocaleString()} kg` : 'No estimate'} changeText={farmMetrics.yieldProject ? `${farmMetrics.yieldProject.name} · FarmIQ project estimate` : 'Add an estimate to a FarmIQ project'} iconBg="bg-yellow-100" iconColor="text-yellow-600" />
            <StatsCard title="Market Price" value={farmMetrics.loading ? 'Loading…' : farmMetrics.market ? `GH₵${Number(farmMetrics.market.priceGhsPerTonne).toLocaleString()}/tonne` : 'Unavailable'} changeText={farmMetrics.market ? `${farmMetrics.market.commodity} · ${farmMetrics.market.deliveryCentre} · GCX ${farmMetrics.market.quoteDate}` : farmMetrics.marketError || 'No supported crop registered for live pricing'} iconBg="bg-purple-100" iconColor="text-purple-600" />
          </div>

          <FarmerDomainSummary records={domainRecords} loading={domainRecordsLoading} errors={domainErrors} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Revenue & Profit Trends</h2>
              <AreaChartComponent />
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">7-Day Weather Forecast</h2>
              <LineChartComponent />
            </div>
          </div>
        </>
      )}

      {/* ✅ INVESTOR STATS */}
      {currentUser.role === 'investor' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatsCard title="Active Investments" value="12" change={3.4} changeType="increase" changeText="this month" iconBg="bg-blue-100" iconColor="text-blue-600" />
          <StatsCard title="ROI (%)" value="18.7%" change={1.2} changeType="increase" changeText="last quarter" iconBg="bg-green-100" iconColor="text-green-600" />
          <StatsCard title="Pending Pitches" value="5" change={-0.8} changeType="decrease" changeText="since last week" iconBg="bg-yellow-100" iconColor="text-yellow-600" />
        </div>
      )}

      {/* ✅ PROVIDER STATS & CHARTS */}
      {(currentUser.role.includes('financial') || currentUser.role.includes('insurance') || currentUser.role.includes('security')) && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatsCard title="Active Policies" value="45" change={2.1} changeType="increase" changeText="this month" iconBg="bg-green-100" iconColor="text-green-600" />
            <StatsCard title="Claims Processed" value="120" change={-1.5} changeType="decrease" changeText="since last week" iconBg="bg-blue-100" iconColor="text-blue-600" />
            <StatsCard title="Security Requests" value="14" change={0.9} changeType="increase" changeText="last 7 days" iconBg="bg-red-100" iconColor="text-red-600" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Claims Trend</h2>
              <AreaChartComponent />
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Policy Distribution</h2>
              <LineChartComponent />
            </div>
          </div>
        </>
      )}

      {/* ✅ QUICK ACCESS */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {userModules.map((module) => (
            <Link
              key={module.name}
              to={canAccessModule(module.name) ? module.path : '#'}
              onClick={(e) => !canAccessModule(module.name) && e.preventDefault()}
              className={`block p-6 rounded-lg transition-all ${
                canAccessModule(module.name)
                  ? 'border border-gray-200 hover:shadow-md'
                  : 'border border-gray-200 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className={`${module.color} rounded-full w-12 h-12 flex items-center justify-center mb-4`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={module.icon} />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">{module.name}</h3>
              <p className="text-sm text-gray-600">{module.description}</p>
            </Link>
          ))}
          
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
