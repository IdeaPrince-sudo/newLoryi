import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../lib/api';

const mapApiFarmer = (farmer) => {
  const score = farmer.latestScore;
  const fame = score?.score;
  return {
    id: farmer.id,
    name: farmer.name,
    region: farmer.region || 'Ghana',
    fame: fame ?? '—',
    risk: score ? Math.round(score.pd * 100) : '—',
    status: fame >= 700 ? 'Preferred' : fame >= 650 ? 'Eligible' : fame ? 'Review' : 'Not scored',
    loan: farmer.requestedAmount ? `GHS ${farmer.requestedAmount.toLocaleString()}` : 'Not set',
    trend: score ? 'Live API' : 'Awaiting score',
    crop: 'Farm profile',
    yield: `${farmer.farmSizeAcres || '—'} acres`,
    latestScore: score,
  };
};

const emptyProfile = { id: null, name: 'No farmer selected', fame: '—', risk: '—', status: 'Awaiting data', loan: '—', trend: '—', crop: '—', yield: '—' };

const alerts = [
  { title: 'Drought risk rising', detail: 'North cluster forecast indicates 34% probability of moisture stress for the next 10 days.', level: 'high' },
  { title: 'Recommendation adherence improving', detail: 'Farmer Grace followed fertilizer recommendation and crop performance improved by 12%.', level: 'medium' },
  { title: 'Cash flow anomaly', detail: 'Input purchase spending is above policy threshold compared to the last cycle.', level: 'low' },
];

const scoreBreakdown = [
  { label: 'Yield consistency', value: 82 },
  { label: 'Mobile money health', value: 74 },
  { label: 'Loan repayment history', value: 68 },
  { label: 'Market linkage', value: 88 },
  { label: 'Recommendation adherence', value: 79 },
];

const activityFeed = [
  'John purchased the recommended fertilizer blend using the active loan facility.',
  'Satellite NDVI update shows healthy crop vigor across the monitored plot.',
  'Cash inflow from crop sales increased 18% over the previous season.',
  'Regional rainfall anomaly was detected; insurance review recommended for one field.',
];

const settlementWaterfall = [
  { label: 'Off-taker revenue', amount: '$48,500', share: '100%', color: 'bg-emerald-500', value: 100 },
  { label: 'Input financing settlement', amount: '$14,200', share: '29%', color: 'bg-cyan-500', value: 29 },
  { label: 'Logistics & operations', amount: '$6,300', share: '13%', color: 'bg-sky-500', value: 13 },
  { label: 'Lender principal + interest', amount: '$12,600', share: '26%', color: 'bg-violet-500', value: 26 },
  { label: 'Farmer net proceeds', amount: '$21,700', share: '45%', color: 'bg-amber-500', value: 45 },
];

const onboardingDefaults = {
  name: 'Grace Mensah',
  region: 'Tamale',
  crop: 'Rice',
  acreage: '3.4 ha',
  cooperative: 'Northern Agro Co-op',
  phone: '+233 24 123 4567',
  expectedYield: '5.6 t/ha',
  financingNeed: '$450,000',
};

const ecosystemPartners = [
  { name: 'Banks & financiers', detail: 'Underwriting and disbursement', value: '$1.8M', status: '3 approvals pending', tone: 'border-cyan-200 bg-cyan-50 text-cyan-700' },
  { name: 'Off-takers', detail: 'Purchase commitments', value: '92%', status: 'Coverage secured', tone: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  { name: 'Input providers', detail: 'Inputs and logistics', value: '86%', status: 'Fulfillment on track', tone: 'border-amber-200 bg-amber-50 text-amber-700' },
  { name: 'Farmers', detail: 'Active financed profiles', value: '248', status: '84% monitored', tone: 'border-violet-200 bg-violet-50 text-violet-700' },
];

const ecosystemRoleData = {
  bank: {
    title: 'Lender command center',
    description: 'Approve productive credit with verified farm, market, and repayment signals.',
    metrics: [['Credit applications', '18', '+4 this week'], ['Capital deployed', '$684K', '+12.8% this cycle'], ['Portfolio at risk', '4.6%', '-0.8% this month'], ['Expected repayments', '$92K', 'Next 30 days']],
    queue: ['Review Grace Mensah facility for final approval', 'Confirm Tamale off-taker commitment', 'Release approved inputs for Kumasi cluster'],
  },
  buyer: {
    title: 'Off-taker command center',
    description: 'Secure supply by committing to forecast harvests and closing verified settlements.',
    metrics: [['Committed volume', '248 t', '+18% this cycle'], ['Supplier farms', '42', '6 new profiles'], ['Quality readiness', '88%', '+6% this month'], ['Pending settlements', '7', '$48.5K in queue']],
    queue: ['Confirm rice purchase commitment for Tamale', 'Review crop quality forecast for Ho cluster', 'Release settlement for completed harvest batch'],
  },
  store: {
    title: 'Input provider command center',
    description: 'Coordinate input inventory, delivery, and finance-backed fulfillment across farms.',
    metrics: [['Open input orders', '31', '8 due this week'], ['Inventory value', '$218K', '96% available'], ['Delivery success', '94%', '+3% this month'], ['Finance-backed orders', '86', '$74K active']],
    queue: ['Dispatch fertilizer order for Grace Mensah', 'Confirm seed inventory for Northern Agro Co-op', 'Upload delivery evidence for financed orders'],
  },
  farmer: {
    title: 'Farmer finance center',
    description: 'Complete your profile, access input finance, and track the path from planting to payout.',
    metrics: [['Credit score', '640', '+90 this cycle'], ['Approved facility', '$450K', 'Conditionally approved'], ['Expected harvest', '19 t', '5.6 t/ha forecast'], ['Net payout forecast', '$21.7K', 'After settlement']],
    queue: ['Complete identity and land documents', 'Confirm recommended rice input package', 'Review off-taker delivery date'],
  },
  investor: {
    title: 'Portfolio command center',
    description: 'Track productive agriculture exposure, risk-adjusted yield, and repayment performance.',
    metrics: [['Financed farms', '42', '+6 this cycle'], ['Capital deployed', '$684K', '+12.8% this cycle'], ['Expected portfolio yield', '18.7%', '+1.2% quarter'], ['Risk coverage', '92%', 'Off-taker backed']],
    queue: ['Review Northern Agro Co-op portfolio', 'Compare yield and repayment scenarios', 'Approve allocation to the next facility pool'],
  },
};

const famePipelineStages = [
  { label: 'Ingest & engineer', detail: '30 / 60 / 90-day rolling windows', items: ['Mobile money velocity and inflow variance', 'NDVI delta and distance to off-taker', 'Input purchase consistency and advice adherence'], tone: 'bg-sky-50 border-sky-200' },
  { label: 'Base learners', detail: 'Non-linear risk signals', items: ['XGBoost / LightGBM for tabular data', 'Random Forest for outlier robustness', 'KNN imputation and target encoding'], tone: 'bg-violet-50 border-violet-200' },
  { label: 'Meta-learner', detail: 'Calibrated probability of default', items: ['Regularized Logistic Regression', 'L2-regularized learned weights', 'Time-based validation and backtesting'], tone: 'bg-amber-50 border-amber-200' },
];

const explainabilityDrivers = [
  { feature: 'Consistent mobile money savings', impact: '+45 pts', tone: 'text-emerald-700 bg-emerald-50' },
  { feature: 'High NDVI crop health', impact: '+30 pts', tone: 'text-emerald-700 bg-emerald-50' },
  { feature: 'Land tenure document missing', impact: '-20 pts', tone: 'text-rose-700 bg-rose-50' },
];

const workflowSteps = [
  { step: '1', title: 'Farmer profiling', description: 'Collect farm size, crop, GPS, historic yields, mobile-money behavior, and soil data.', owner: 'Farmer' },
  { step: '2', title: 'Dynamic credit score', description: 'Estimate expected production, expected revenue, and repayment capacity using alternative data.', owner: 'Loryi AI' },
  { step: '3', title: 'Input financing', description: 'Input provider advances seed, fertilizer, mechanization, irrigation, and crop inputs.', owner: 'Input company' },
  { step: '4', title: 'Off-taker commitment', description: 'Buyer signs a purchase commitment for the expected crop output.', owner: 'Off-taker' },
  { step: '5', title: 'Harvest monitoring', description: 'Loryi AI tracks crop health, weather stress, and farm performance continuously.', owner: 'Bank + AI engine' },
  { step: '6', title: 'Settlement', description: 'Off-taker payment flows to input finance, financier repayment, and farmer net proceeds.', owner: 'Settlement layer' },
];

const roleOperations = {
  farmer: [
    'Register farm details and field GPS location',
    'Share mobile-money and input purchase history',
    'Accept input finance and follow agronomic recommendations',
    'Harvest and sell produce through the committed off-taker',
    'Receives net proceeds after finance and deductions',
  ],
  admin: [
    'Monitor portfolio performance across all farms',
    'Review risk thresholds and policy triggers',
    'Approve lender rules and underwriting limits',
    'Track platform-level settlement and payout health',
  ],
  investor: [
    'Assess portfolio exposure and farm-level credit health',
    'Track expected yield and repayment capacity',
    'Review pre-approved facility opportunities',
    'Monitor return performance across financed farms',
  ],
  buyer: [
    'Commit to crop purchase volumes with forecasted delivery dates',
    'Verify quality and quantity against expected harvest',
    'Process purchase settlement to the financing pipeline',
  ],
  store: [
    'Provide input access and logistics supply tracking',
    'Validate inventory and delivery schedules',
    'Confirm supplier repayment and fulfillment status',
  ],
  'financial, insurance, security': [
    'Approve risk policy and coverage thresholds',
    'Trigger insurance, review, or restructuring actions',
    'Monitor anomaly and default signals in the score engine',
  ],
  agronomist: [
    'Review field recommendations and crop health alerts',
    'Validate agronomic advice adherence',
    'Assess region-level risk and yield anomalies',
  ],
};

const functionIcon = (path, color = 'text-slate-700') => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={`h-5 w-5 ${color}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

const CreditTrackModule = () => {
  const { currentUser } = useAuth();
  const [selectedFarmer, setSelectedFarmer] = useState('');
  const [liveProfiles, setLiveProfiles] = useState([]);
  const [searchPhone, setSearchPhone] = useState('');
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState('');
  const [approvalStatus, setApprovalStatus] = useState('Conditionally approved');
  const [onboarding, setOnboarding] = useState(onboardingDefaults);
  const normalizedRole = currentUser?.role || 'bank';

  useEffect(() => {
    let active = true;
    setLiveLoading(true);
    api.credittrackFarmers()
      .then((farmers) => {
        if (!active || !farmers.length) return;
        const profiles = farmers.map(mapApiFarmer);
        setLiveProfiles(profiles);
        setSelectedFarmer(profiles[0].id);
      })
      .catch(() => {
        if (active) setLiveError('Live CreditTrack data is unavailable; showing the demo portfolio.');
      })
      .finally(() => {
        if (active) setLiveLoading(false);
      });
    return () => { active = false; };
  }, []);

  const currentProfile = useMemo(
    () => liveProfiles.find((item) => item.id === selectedFarmer) ?? liveProfiles[0] ?? emptyProfile,
    [liveProfiles, selectedFarmer]
  );

  const handleOnboardingChange = (field, value) => {
    setOnboarding((prev) => ({ ...prev, [field]: value }));
  };

  const currentOperations = roleOperations[normalizedRole] || roleOperations.farmer;
  const ecosystemRole = normalizedRole.includes('financial') ? 'bank' : normalizedRole;
  const roleDashboard = ecosystemRoleData[ecosystemRole] || ecosystemRoleData.bank;
  const displayRole = ecosystemRole === 'buyer' ? 'Off-taker' : ecosystemRole === 'store' ? 'Input provider' : ecosystemRole;
  const canViewCreditOperations = normalizedRole === 'bank' || normalizedRole === 'admin' || normalizedRole.includes('agronomist');

  const handleFarmerSearch = async (event) => {
    event.preventDefault();
    setLiveLoading(true);
    setLiveError('');
    try {
      const farmers = await api.credittrackFarmers(searchPhone);
      const profiles = farmers.map(mapApiFarmer);
      setLiveProfiles(profiles);
      if (profiles[0]) setSelectedFarmer(profiles[0].id);
      if (!profiles.length) setLiveError('No farmer found for that phone number.');
    } catch (error) {
      setLiveError(error.message);
    } finally {
      setLiveLoading(false);
    }
  };

  const handleRefreshScore = async () => {
    if (!currentProfile.id) return;
    setLiveLoading(true);
    setLiveError('');
    try {
      const score = await api.credittrackScore(currentProfile.id);
      setLiveProfiles((profiles) => profiles.map((profile) => (
        profile.id === currentProfile.id ? mapApiFarmer({ ...profile, latestScore: score }) : profile
      )));
    } catch (error) {
      setLiveError(error.message);
    } finally {
      setLiveLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-700">
              {functionIcon('M4 19h16M7 16V8m5 8V5m5 11v-7', 'text-cyan-700')}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">CreditTrack</h1>
              <p className="text-sm text-slate-600">AI-powered input finance + off-taker-backed credit</p>
            </div>
          </div>

          <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
            Closed-loop credit system live
          </div>
        </div>

        <div className="mt-5 inline-flex items-center px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium">
          {currentUser?.role ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1) : 'Bank User'}
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-white shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Credit Ecosystem</p>
            <h2 className="mt-2 text-2xl font-bold">{roleDashboard.title}</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-300">{roleDashboard.description}</p>
          </div>
          <span className="rounded-full border border-slate-600 px-3 py-1 text-xs font-semibold capitalize text-slate-200">{displayRole} view</span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {roleDashboard.metrics.map(([label, value, change]) => (
            <div key={label} className="rounded-lg border border-slate-700 bg-slate-800 p-3">
              <div className="text-xs text-slate-400">{label}</div>
              <div className="mt-2 text-2xl font-bold text-white">{value}</div>
              <div className="mt-1 text-xs text-cyan-300">{change}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Ecosystem partner health</h2>
              <p className="text-sm text-slate-500">Live signals across the credit and supply chain</p>
            </div>
            <span className="text-xs font-semibold text-emerald-600">Network healthy</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {ecosystemPartners.map((partner) => (
              <div key={partner.name} className={`rounded-lg border p-4 ${partner.tone}`}>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold">{partner.name}</h3>
                  <span className="text-xl font-bold">{partner.value}</span>
                </div>
                <p className="mt-1 text-xs opacity-80">{partner.detail}</p>
                <p className="mt-3 text-xs font-semibold">{partner.status}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">My work queue</h2>
              <p className="text-sm text-slate-500">Next actions for this role</p>
            </div>
            <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">{roleDashboard.queue.length} open</span>
          </div>
          <div className="space-y-3">
            {roleDashboard.queue.map((item, index) => (
              <div key={item} className="flex items-start gap-3 rounded-lg border border-slate-200 p-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-xs font-bold text-cyan-700">{index + 1}</span>
                <span className="text-sm leading-5 text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-600">Model governance</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">Fame Base Index technical architecture</h2>
            <p className="mt-1 max-w-3xl text-sm text-slate-500">A dynamic, explainable scoring pipeline built for sparse, noisy, multimodal agricultural data.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-700">SHAP enabled</span>
            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-blue-700">PSI monitor &lt; 0.2</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">18-month training window</span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-3">
          {famePipelineStages.map((stage, index) => (
            <div key={stage.label} className={`rounded-xl border p-4 ${stage.tone}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-700">{index + 1}</span>
                <span className="text-xs font-semibold text-slate-500">{stage.detail}</span>
              </div>
              <h3 className="mt-3 font-semibold text-slate-900">{stage.label}</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {stage.items.map((item) => <li key={item}>• {item}</li>)}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.2fr_1fr_1fr]">
          <div className="rounded-xl bg-slate-900 p-5 text-white">
            <h3 className="font-semibold">Score mapping</h3>
            <p className="mt-3 font-mono text-sm leading-7 text-cyan-200">P(Default | X) = sigmoid(meta [P_XGB, P_LGBM, P_RF])</p>
            <p className="mt-2 font-mono text-sm leading-7 text-amber-200">Fame Base = 300 + (1 - PD) × 550</p>
            <div className="mt-4 flex items-center justify-between border-t border-slate-700 pt-3 text-xs text-slate-400">
              <span>Current score</span>
              <span className="text-2xl font-bold text-white">{currentProfile.fame}</span>
              <span className="rounded-full bg-emerald-900 px-2 py-1 text-emerald-300">{currentProfile.status}</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Explainable drivers</h3>
              <span className="text-xs font-medium text-slate-500">SHAP local audit</span>
            </div>
            <div className="mt-4 space-y-2">
              {explainabilityDrivers.map((driver) => (
                <div key={driver.feature} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 p-2.5 text-sm">
                  <span className="text-slate-600">{driver.feature}</span>
                  <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${driver.tone}`}>{driver.impact}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-500">Actionable feedback: upload the land document and maintain the savings streak to target 700+.</p>
          </div>

          <div className="rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Drift & compliance</h3>
              <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">Stable</span>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">KS feature checks</span><span className="font-semibold text-slate-800">Passed</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Population stability</span><span className="font-semibold text-slate-800">0.14 PSI</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Next retraining</span><span className="font-semibold text-slate-800">Quarterly</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Fair-lending tests</span><span className="font-semibold text-emerald-700">No variance</span></div>
            </div>
            <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-500">Event-driven retraining triggers when PSI exceeds 0.20 or a material climate or market shift is detected.</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>Fame Base Index</span>
            {functionIcon('M12 2v20M2 12h20', 'text-sky-600')}
          </div>
          <div className="mt-4 text-3xl font-bold text-slate-900">620</div>
          <div className="mt-2 text-sm text-emerald-600">+70 from prior cycle</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>Agri-Risk Index</span>
            {functionIcon('M3 12h18M12 3v18', 'text-amber-600')}
          </div>
          <div className="mt-4 text-3xl font-bold text-slate-900">25</div>
          <div className="mt-2 text-sm text-emerald-600">Lower than last review</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>Portfolio coverage</span>
            {functionIcon('M3 7l9-4 9 4-9 4-9-4zm0 5l9 4 9-4M3 17l9 4 9-4', 'text-violet-600')}
          </div>
          <div className="mt-4 text-3xl font-bold text-slate-900">84%</div>
          <div className="mt-2 text-sm text-slate-500">Active farms tracked</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>Pre-approved facilities</span>
            {functionIcon('M12 6v12m-6-6h12', 'text-rose-600')}
          </div>
          <div className="mt-4 text-3xl font-bold text-slate-900">$1.8M</div>
          <div className="mt-2 text-sm text-rose-600">3 farms eligible</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">CreditTrack lifecycle</h2>
            <p className="text-sm text-slate-500">Farmer profiling → dynamic score → input finance → off-taker commitment → harvest → settlement</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {workflowSteps.map((item) => (
            <div key={item.step} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 text-cyan-700 font-bold">{item.step}</span>
                <span className="text-[10px] uppercase tracking-wide text-slate-500">{item.owner}</span>
              </div>
              <h3 className="font-semibold text-slate-800">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600 leading-6">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_2fr] gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Portfolio Heatmap</h2>
            <span className="text-xs font-medium text-slate-500">10-day update</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              ['Kumasi', 'Low', 'bg-emerald-100 text-emerald-700'],
              ['Tamale', 'Medium', 'bg-amber-100 text-amber-700'],
              ['Cape Coast', 'Medium', 'bg-amber-100 text-amber-700'],
              ['Ho', 'Low', 'bg-emerald-100 text-emerald-700'],
              ['Accra', 'High', 'bg-rose-100 text-rose-700'],
              ['Sunyani', 'Low', 'bg-emerald-100 text-emerald-700'],
            ].map(([region, status, tone]) => (
              <div key={region} className="rounded-lg border border-slate-200 p-3 flex items-center justify-between">
                <span className="text-sm text-slate-700">{region}</span>
                <span className={`px-2 py-1 rounded-full text-[11px] font-semibold ${tone}`}>{status}</span>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Actionable alerts</h3>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.title} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      alert.level === 'high' ? 'bg-rose-500' : alert.level === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} />
                    <h4 className="font-medium text-slate-800">{alert.title}</h4>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{alert.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {canViewCreditOperations && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Farmer 360 View</h2>
              <p className="text-sm text-slate-500">Fame Base Index, risk, crop health, and settlement signals</p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <form onSubmit={handleFarmerSearch} className="flex gap-2">
                <input
                  value={searchPhone}
                  onChange={(event) => setSearchPhone(event.target.value)}
                  placeholder="Search phone"
                  aria-label="Search farmer phone number"
                  className="w-36 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button type="submit" disabled={liveLoading} className="rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-50">
                  Search
                </button>
              </form>
              <select
                value={selectedFarmer}
                onChange={(e) => setSelectedFarmer(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {liveProfiles.map((farmer) => (
                  <option key={farmer.id || farmer.name} value={farmer.id || farmer.name}>{farmer.name}</option>
                ))}
              </select>
              {currentProfile.id && (
                <button type="button" onClick={handleRefreshScore} disabled={liveLoading} className="rounded-lg border border-cyan-600 px-3 py-2 text-sm font-semibold text-cyan-700 hover:bg-cyan-50 disabled:opacity-50">
                  {liveLoading ? 'Loading...' : 'Refresh score'}
                </button>
              )}
            </div>
          </div>

          {liveError && <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{liveError}</p>}
          {liveProfiles.length > 0 && <p className="mt-3 text-xs font-medium text-emerald-600">Live API data connected</p>}

          <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Fame score</span>
                <span className="text-xs font-medium text-emerald-600">{currentProfile.trend}</span>
              </div>
              <div className="mt-3 text-4xl font-bold text-slate-900">{currentProfile.fame}</div>
              <div className="mt-2 text-sm text-slate-600">Loan band: {currentProfile.loan}</div>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Risk score</span>
                <span className="text-xs font-medium text-amber-600">{currentProfile.status}</span>
              </div>
              <div className="mt-3 text-4xl font-bold text-slate-900">{currentProfile.risk}</div>
              <div className="mt-2 text-sm text-slate-600">{currentProfile.crop} • {currentProfile.yield}</div>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Crop health</span>
                <span className="text-xs font-medium text-sky-600">NDVI</span>
              </div>
              <div className="mt-3 text-4xl font-bold text-slate-900">0.82</div>
              <div className="mt-2 text-sm text-slate-600">Strong vigor across plot</div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Score breakdown</h3>
              <div className="space-y-3">
                {scoreBreakdown.map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span>{item.label}</span>
                      <span>{item.value}</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500" style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Operations timeline</h3>
              <div className="space-y-3">
                {activityFeed.map((item, index) => (
                  <div key={item} className="flex gap-3">
                    <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <p className="text-sm text-slate-600 leading-6">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-lg font-semibold text-slate-900">Production tracking</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li className="flex items-start gap-3"><span className="mt-1 w-2 h-2 rounded-full bg-emerald-500" /> Satellite integration updates crop health every 10 days.</li>
            <li className="flex items-start gap-3"><span className="mt-1 w-2 h-2 rounded-full bg-emerald-500" /> Planting and harvest benchmarks are tracked against regional performance.</li>
            <li className="flex items-start gap-3"><span className="mt-1 w-2 h-2 rounded-full bg-emerald-500" /> Yield forecasts use weather and NDVI to reduce blind spots.</li>
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-lg font-semibold text-slate-900">Digital records</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li className="flex items-start gap-3"><span className="mt-1 w-2 h-2 rounded-full bg-blue-500" /> Farm logbook stores input usage, labor, and equipment data.</li>
            <li className="flex items-start gap-3"><span className="mt-1 w-2 h-2 rounded-full bg-blue-500" /> Land tenure, ID, and cooperative documents are secured in a vault.</li>
            <li className="flex items-start gap-3"><span className="mt-1 w-2 h-2 rounded-full bg-blue-500" /> Recommendation adherence is scored and folded into the Fame Base Index.</li>
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-lg font-semibold text-slate-900">Financial tracking</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li className="flex items-start gap-3"><span className="mt-1 w-2 h-2 rounded-full bg-violet-500" /> Mobile money inflows and outflows are monitored for cash-flow health.</li>
            <li className="flex items-start gap-3"><span className="mt-1 w-2 h-2 rounded-full bg-violet-500" /> Input financing is validated against actual farm expenses.</li>
            <li className="flex items-start gap-3"><span className="mt-1 w-2 h-2 rounded-full bg-violet-500" /> Sales verification digitizes purchase receipts and revenue evidence.</li>
          </ul>
        </div>
      </div>

      {canViewCreditOperations && (
      <>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Lender approval / underwriting</h2>
              <p className="text-sm text-slate-500">Underwriting decision for the active facility</p>
            </div>
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              {approvalStatus}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              ['Facility amount', '$450,000'],
              ['Expected yield', '5.6 t/ha'],
              ['Off-taker coverage', '92%'],
              ['Repayment period', '12 months'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
                <div className="mt-2 text-lg font-semibold text-slate-900">{value}</div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-amber-900">Credit assessment flags</h3>
              <span className="text-xs font-medium text-amber-700">Risk review</span>
            </div>

            <ul className="space-y-2 text-sm text-amber-900">
              <li>• Seasonal yield is strong, but rainfall sensitivity remains moderately elevated.</li>
              <li>• Borrower has strong mobile money history and consistent input repayment behavior.</li>
              <li>• Off-taker commitment covers 92% of projected harvest and reduces default risk.</li>
            </ul>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setApprovalStatus('Approved')}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Approve
            </button>
            <button
              type="button"
              onClick={() => setApprovalStatus('Documents requested')}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
            >
              Request docs
            </button>
            <button
              type="button"
              onClick={() => setApprovalStatus('Conditional approval')}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Conditional approval
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Settlement waterfall logic</h2>
              <p className="text-sm text-slate-500">Purchase proceeds flow to finance, operations, lender, and net farmer payout</p>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Priority queue</span>
          </div>

          <div className="space-y-4">
            {settlementWaterfall.map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{item.label}</span>
                  <span className="text-slate-600">{item.amount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
                  </div>
                  <span className="w-12 text-right text-xs text-slate-500">{item.share}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl bg-slate-900 p-4 text-white">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>Net farmer payout</span>
              <span>45%</span>
            </div>
            <div className="mt-2 text-3xl font-bold">$21,700</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Farmer onboarding form</h2>
            <p className="text-sm text-slate-500">Capture farmer details for the CreditTrack profile</p>
          </div>
          <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">Profile ready</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[
            ['name', 'Farmer name'],
            ['region', 'Region'],
            ['crop', 'Primary crop'],
            ['acreage', 'Farm size'],
            ['cooperative', 'Cooperative'],
            ['phone', 'Phone number'],
            ['expectedYield', 'Expected yield'],
            ['financingNeed', 'Financing need'],
          ].map(([field, label]) => (
            <label key={field} className="block text-sm text-slate-700">
              <span className="mb-1 block font-medium">{label}</span>
              <input
                type="text"
                value={onboarding[field]}
                onChange={(e) => handleOnboardingChange(field, e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-700 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100"
              />
            </label>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="text-sm text-slate-600">
            Profile status: <span className="font-semibold text-slate-900">Ready for underwriting review</span>
          </div>
          <button
            type="button"
            className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700"
          >
            Save profile
          </button>
        </div>
      </div>
      </>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Operations by user type</h2>
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{normalizedRole}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentOperations.map((item) => (
            <div key={item} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 flex items-start gap-3">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-500" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CreditTrackModule;
