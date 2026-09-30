import React from 'react';

const domainConfig = {
  livestock: {
    title: 'Livestock',
    subtitle: 'Improve animal health, productivity, and preventive care',
    accent: 'amber',
    stats: [
      { label: 'Active Herd', value: '1,284', delta: '+8.2%', tone: 'text-emerald-600' },
      { label: 'Vaccination Ready', value: '87%', delta: '+6.4%', tone: 'text-blue-600' },
      { label: 'Health Alerts', value: '12', delta: '-3.1%', tone: 'text-orange-600' },
      { label: 'Feed Efficiency', value: '91%', delta: '+2.8%', tone: 'text-violet-600' },
    ],
    features: [
      { title: 'Vaccination reminders', detail: 'Automated voice notifications for Newcastle disease, deworming, and critical herd schedules.' },
      { title: 'Symptom triage', detail: 'Farmers describe issues like swollen udder or poor appetite; the AI recommends safe first-response care.' },
      { title: 'Feed ration optimization', detail: 'Formulate affordable feed mixes from cassava peels, groundnut haulms, and stage-specific nutrition.' },
      { title: 'Breeding records', detail: 'Track mating dates, expected due dates, and birth weights for herd productivity over time.' },
    ],
    alerts: [
      'Vaccination reminder due for poultry cluster 3.',
      'Two cattle pens need hoof checks before Friday.',
      'Feed inventory is 18% below target in one section.',
    ],
    actions: [
      'Review vaccination schedule',
      'Check breeding heat list',
      'Rebalance feed orders',
      'Log new birth record',
    ],
  },
  forestry: {
    title: 'Forestry',
    subtitle: 'Promote climate resilience, soil health, and diversified income',
    accent: 'emerald',
    stats: [
      { label: 'Tree Survival', value: '93%', delta: '+4.6%', tone: 'text-emerald-600' },
      { label: 'Agroforestry Area', value: '2,480 ha', delta: '+7.1%', tone: 'text-green-600' },
      { label: 'NTFP Harvests', value: '18.2k kg', delta: '+11.5%', tone: 'text-teal-600' },
      { label: 'Carbon Capture', value: '6.8 tCO₂', delta: '+2.3%', tone: 'text-cyan-600' },
    ],
    features: [
      { title: 'Tree survival tracking', detail: 'Log planting dates and monitor survival rates for shade trees such as Shea, Cocoa shade, and Baobab.' },
      { title: 'Agroforestry guidance', detail: 'Receive step-by-step voice guidance on nitrogen-fixing legumes between tree rows.' },
      { title: 'NTFP reminders', detail: 'Seasonal alerts for sustainable Shea nut and medicinal bark harvesting.' },
      { title: 'Erosion control alerts', detail: 'Get contour planting guidance and deep-rooted tree recommendations before heavy rains.' },
    ],
    alerts: [
      'Dry spell risk has increased in the west block.',
      'Two plantation sections require pest screening.',
      'Contour planting reminder is due before the rainy season.',
    ],
    actions: [
      'Confirm tree survival check',
      'Review intercropping plan',
      'Schedule NTFP harvest reminder',
      'Map erosion-prone slopes',
    ],
  },
  fisheries: {
    title: 'Fisheries & Aquaculture',
    subtitle: 'Optimize pond health, feeding efficiency, and harvest timing',
    accent: 'sky',
    stats: [
      { label: 'Ponds Active', value: '46', delta: '+5.0%', tone: 'text-sky-600' },
      { label: 'Water Quality', value: '88%', delta: '+3.2%', tone: 'text-blue-600' },
      { label: 'Biomass', value: '12.4 t', delta: '+9.3%', tone: 'text-cyan-600' },
      { label: 'Feed Conversion', value: '1.42', delta: '-0.8%', tone: 'text-indigo-600' },
    ],
    features: [
      { title: 'Water quality diagnostics', detail: 'Interpret green water, bad smells, and low oxygen as potential algal bloom or oxygen stress events.' },
      { title: 'Feeding schedule optimization', detail: 'Adjust feed plans to water temperature and fish growth stage to avoid waste and pollution.' },
      { title: 'Disease management', detail: 'Get actionable voice-led troubleshooting for white spots, lethargy, and common pond problems.' },
      { title: 'Harvest timing', detail: 'Combine growth cycle estimates with cached market price trends to pick the best harvest window.' },
    ],
    alerts: [
      'One pond has elevated ammonia after rainfall.',
      'Feed delivery is delayed in the East cluster.',
      'Tilapia batch is ready for harvest assessment.',
    ],
    actions: [
      'Run pond aeration check',
      'Adjust feed ration',
      'Review fish disease guide',
      'Check market price window',
    ],
  },
  farmManagement: {
    title: 'Farm Management Tools',
    subtitle: 'Simplify record-keeping, resource optimization, and decision-making for low-literacy users',
    accent: 'violet',
    stats: [
      { label: 'Daily Logs', value: '1,420', delta: '+12.4%', tone: 'text-violet-600' },
      { label: 'Alerts Sent', value: '86%', delta: '+9.1%', tone: 'text-indigo-600' },
      { label: 'Market Queries', value: '324', delta: '+15.8%', tone: 'text-purple-600' },
      { label: 'ROI Tracking', value: '74%', delta: '+6.7%', tone: 'text-fuchsia-600' },
    ],
    features: [
      { title: 'Voice-activated daily logs', detail: 'Record updates like “I planted two acres of maize today” or “I spent 5,000 Cedis on fertilizer.”' },
      { title: 'Offline weather and alerts', detail: 'Localized voice notifications in Hausa, Twi, or Yoruba for optimal planting windows and SDG13 guidance.' },
      { title: 'Market price voice queries', detail: 'Ask, “What is the price of tomatoes in Kumasi today?” and receive a clear spoken answer.' },
      { title: 'Resource & yield tracking', detail: 'Capture input usage versus harvest to calculate ROI and support statistical validation.' },
    ],
    alerts: [
      'Planting window alert for maize is active in the north region.',
      'Tomato price spike detected in Kumasi market feed.',
      'Fertilizer cost tracking is above expected seasonal budget.',
    ],
    actions: [
      'Log today’s farm activity',
      'Check local market price',
      'Review planting window alert',
      'Update yield versus input summary',
    ],
  },
};

const accentStyles = {
  amber: {
    badge: 'bg-amber-100 text-amber-800',
    button: 'bg-amber-600 hover:bg-amber-700',
    accent: 'from-amber-500 to-orange-500',
  },
  emerald: {
    badge: 'bg-emerald-100 text-emerald-800',
    button: 'bg-emerald-600 hover:bg-emerald-700',
    accent: 'from-emerald-500 to-teal-500',
  },
  sky: {
    badge: 'bg-sky-100 text-sky-800',
    button: 'bg-sky-600 hover:bg-sky-700',
    accent: 'from-sky-500 to-cyan-500',
  },
  violet: {
    badge: 'bg-violet-100 text-violet-800',
    button: 'bg-violet-600 hover:bg-violet-700',
    accent: 'from-violet-500 to-fuchsia-500',
  },
};

const AgriDomainDashboard = ({ domain = 'farmManagement' }) => {
  const config = domainConfig[domain] || domainConfig.farmManagement;
  const style = accentStyles[config.accent] || accentStyles.violet;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${style.badge}`}>
              {config.title} module
            </div>
            <h1 className="mt-3 text-2xl font-semibold text-gray-900">{config.title}</h1>
            <p className="mt-1 text-sm text-gray-600">{config.subtitle}</p>
          </div>
          <button className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm transition ${style.button}`}>
            Generate report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {config.stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{stat.label}</span>
              <span className={`font-semibold ${stat.tone}`}>{stat.delta}</span>
            </div>
            <div className="mt-4 text-2xl font-bold text-gray-900">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Core capabilities</h2>
            <span className="text-xs font-medium text-gray-500">Voice-first workflow</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config.features.map((item) => (
              <div key={item.title} className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                <div className="text-xs uppercase tracking-wide text-gray-500">Feature</div>
                <div className="mt-2 text-lg font-semibold text-gray-900">{item.title}</div>
                <p className="mt-2 text-sm text-gray-600">{item.detail}</p>
              </div>
            ))}
          </div>

          <div className={`mt-6 rounded-xl bg-gradient-to-r p-4 text-white shadow-sm ${style.accent}`}>
            <div className="text-sm font-medium opacity-90">Operational focus</div>
            <div className="mt-2 text-lg font-semibold">This module is designed for low-literacy, voice-led farm decisions and practical action reminders.</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900">Priority alerts</h2>
          <ul className="mt-4 space-y-3">
            {config.alerts.map((alert) => (
              <li key={alert} className="flex items-start gap-3 rounded-lg bg-red-50 p-3 text-sm text-red-800 border border-red-100">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-red-500"></span>
                <span>{alert}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900">Action queue</h2>
          <div className="mt-4 space-y-3">
            {config.actions.map((action, index) => (
              <div key={action} className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-700">
                    {index + 1}
                  </div>
                  <span className="text-sm text-gray-700">{action}</span>
                </div>
                <button className="text-xs font-medium text-gray-600 hover:text-gray-900">Open</button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900">Performance summary</h2>
          <div className="mt-4 space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Productivity</span>
                <span>84%</span>
              </div>
              <div className="mt-2 h-2.5 w-full rounded-full bg-gray-200">
                <div className="h-2.5 rounded-full bg-emerald-500" style={{ width: '84%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Risk reduction</span>
                <span>76%</span>
              </div>
              <div className="mt-2 h-2.5 w-full rounded-full bg-gray-200">
                <div className="h-2.5 rounded-full bg-blue-500" style={{ width: '76%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Adoption readiness</span>
                <span>91%</span>
              </div>
              <div className="mt-2 h-2.5 w-full rounded-full bg-gray-200">
                <div className="h-2.5 rounded-full bg-violet-500" style={{ width: '91%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgriDomainDashboard;
