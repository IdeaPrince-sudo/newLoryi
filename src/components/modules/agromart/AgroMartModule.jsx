import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../lib/api';

const supplyRegions = [
  { name: 'Tamale', code: 'NR', suppliers: 12, products: 34, eligible: 92, status: 'High readiness', tone: 'bg-emerald-500', coordinates: 'top-16 left-[58%]' },
  { name: 'Kumasi', code: 'AS', suppliers: 8, products: 21, eligible: 84, status: 'Ready', tone: 'bg-cyan-500', coordinates: 'top-[48%] left-[39%]' },
  { name: 'Ho', code: 'VR', suppliers: 6, products: 15, eligible: 78, status: 'Review stock', tone: 'bg-amber-500', coordinates: 'top-[43%] left-[66%]' },
  { name: 'Cape Coast', code: 'CR', suppliers: 5, products: 11, eligible: 71, status: 'Limited supply', tone: 'bg-rose-500', coordinates: 'top-[58%] left-[28%]' },
];

const marketplaceOrders = [
  { id: 'AM-1048', farmer: 'Grace Mensah', item: 'NPK Rice Fertilizer', quantity: '14 bags', value: '$434', status: 'Ready to dispatch' },
  { id: 'AM-1047', farmer: 'Isaac Boateng', item: 'Certified Rice Seed', quantity: '8 bags', value: '$336', status: 'In transit' },
  { id: 'AM-1043', farmer: 'Ruth Tetteh', item: 'Solar Irrigation Kit', quantity: '1 kit', value: '$780', status: 'Delivered' },
];

const roleCopy = {
  buyer: {
    label: 'Off-taker workspace',
    title: 'Source verified harvests',
    description: 'Post crop demand, match with financed farms, and create purchase commitments that unlock productive credit.',
  },
  store: {
    label: 'Input provider workspace',
    title: 'Fulfill financed farm inputs',
    description: 'List inputs and services, receive finance-backed orders, and confirm delivery evidence across the ecosystem.',
  },
  farmer: {
    label: 'Farm marketplace',
    title: 'Access inputs and markets',
    description: 'Find recommended inputs and purchase commitments connected to your CreditTrack profile.',
  },
  investor: {
    label: 'Ecosystem marketplace',
    title: 'Monitor productive trade',
    description: 'Review supply, demand, and fulfillment signals behind financed agricultural activity.',
  },
  admin: {
    label: 'Marketplace operations',
    title: 'Manage ecosystem trade',
    description: 'Monitor input supply, off-taker demand, and transaction readiness across AgroMart.',
  },
};

const AgroMartModule = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [notice, setNotice] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedDemand, setSelectedDemand] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All categories');
  const [demand, setDemand] = useState({ crop: 'Rice', volume: '120 tonnes', region: 'Tamale', delivery: 'Oct 18, 2026' });
  const [listing, setListing] = useState({ name: 'Certified Rice Seed', category: 'Seed', price: '$42 / bag', stock: '500 bags' });
  const [liveProducts, setLiveProducts] = useState([]);
  const [liveDemand, setLiveDemand] = useState([]);
  const [apiNotice, setApiNotice] = useState('');

  useEffect(() => {
    Promise.all([api.products(), api.demand()])
      .then(([products, demandRequests]) => {
        setLiveProducts(products.map((product) => ({ ...product, price: `$${product.price}`, rating: product.rating || 'New', color: 'bg-cyan-500', image: '/images/SeedSaving.jpg' })));
        setLiveDemand(demandRequests);
      })
      .catch(() => setApiNotice('Live marketplace data is unavailable; showing the demo catalog.'));
  }, []);

  const role = currentUser?.role || 'farmer';
  const viewRole = role.includes('financial') ? 'admin' : role;
  const copy = roleCopy[viewRole] || roleCopy.farmer;
  const isProvider = viewRole === 'store';
  const isOfftaker = viewRole === 'buyer';
  const products = liveProducts;
  const purchaseRequests = liveDemand;
  const filteredProducts = products.filter((product) => {
    const matchesSearch = `${product.name} ${product.supplier} ${product.region}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All categories' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  const categories = ['All categories', ...new Set(products.map((product) => product.category))];

  const tabs = useMemo(() => {
    if (isProvider) return [['overview', 'Overview'], ['catalog', 'My catalog'], ['orders', 'Input orders'], ['map', 'Supply map']];
    if (isOfftaker) return [['overview', 'Overview'], ['demand', 'Purchase demand'], ['commitments', 'Commitments'], ['map', 'Input map']];
    return [['overview', 'Overview'], ['inputs', 'Inputs'], ['demand', 'Off-taker demand'], ['map', 'Supply map']];
  }, [isOfftaker, isProvider]);

  const showNotice = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2600);
  };

  const handleFieldChange = (setter) => (event) => {
    const { name, value } = event.target;
    setter((previous) => ({ ...previous, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900 p-6 text-white shadow-sm">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border-[28px] border-amber-400/10" />
        <div className="pointer-events-none absolute bottom-0 right-24 h-24 w-24 rounded-full bg-cyan-400/10 blur-2xl" />
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">AgroMart | {copy.label}</p>
            <h1 className="mt-2 text-3xl font-bold">{copy.title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{copy.description}</p>
          </div>
          <span className="relative rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300"><span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-emerald-300 align-middle" />Marketplace active</span>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ['Input supply', '86%', 'Fulfillment readiness'],
            ['Open demand', '235 t', 'Off-taker requests'],
            ['Financed orders', '86', 'Credit-linked orders'],
            ['Trade value', '$218K', 'Current cycle'],
          ].map(([label, value, detail]) => (
            <div key={label} className="rounded-lg border border-slate-700 bg-slate-800 p-3">
              <p className="text-xs text-slate-400">{label}</p>
              <p className="mt-2 text-2xl font-bold">{value}</p>
              <p className="mt-1 text-xs text-amber-300">{detail}</p>
            </div>
          ))}
        </div>
      </section>

      {notice && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800" role="status">{notice}</div>}
      {apiNotice && <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800" role="status">{apiNotice}</div>}

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {tabs.map(([tab, label]) => (
          <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`rounded-lg px-4 py-2 text-sm font-semibold ${activeTab === tab ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {label}
          </button>
        ))}
      </div>

      {(activeTab === 'inputs' || activeTab === 'catalog') && (
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 md:max-w-md">
            <svg className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="m21 21-4.35-4.35m2.1-5.4a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" /></svg>
            <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search inputs, suppliers, or regions" aria-label="Search input catalog" className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100" />
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs font-semibold uppercase tracking-wide text-slate-400 sm:inline">Filter</span>
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} aria-label="Filter by category" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-cyan-500">
              {categories.map((category) => <option key={category}>{category}</option>)}
            </select>
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">{filteredProducts.length} results</span>
          </div>
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Marketplace lanes</h2>
                <p className="text-sm text-slate-500">The two trade flows powering CreditTrack</p>
              </div>
              <span className="text-xs font-semibold text-emerald-600">Live matching</span>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">Input finance lane</p>
                <h3 className="mt-2 font-semibold text-slate-900">Provider → financed farm</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">Credit-approved farmers receive seed, fertilizer, equipment, or services. Delivery evidence updates the financing record.</p>
                <button type="button" onClick={() => setActiveTab(isProvider ? 'catalog' : 'inputs')} className="mt-4 rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-700">View input supply</button>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Off-taker lane</p>
                <h3 className="mt-2 font-semibold text-slate-900">Buyer → committed harvest</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">Off-takers post demand and commit to forecast harvests, creating revenue visibility for lenders and farmers.</p>
                <button type="button" onClick={() => setActiveTab('demand')} className="mt-4 rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-700">View crop demand</button>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Recent marketplace activity</h2>
            <div className="mt-4 space-y-3">
              {marketplaceOrders.map((order) => (
                <div key={order.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-3"><span className="text-xs font-semibold text-slate-500">{order.id}</span><span className="text-xs font-semibold text-emerald-700">{order.status}</span></div>
                  <p className="mt-2 text-sm font-semibold text-slate-800">{order.item}</p>
                  <p className="mt-1 text-xs text-slate-500">{order.farmer} · {order.quantity} · {order.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {(activeTab === 'inputs' || activeTab === 'catalog') && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div><h2 className="text-lg font-semibold text-slate-900">Input catalog</h2><p className="text-sm text-slate-500">Inputs and services available for finance-backed fulfillment</p></div>
            {isProvider && <button type="button" onClick={() => showNotice('New input listing saved to your catalog.')} className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700">Publish listing</button>}
          </div>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredProducts.map((product) => (
              <div key={product.id} className="group rounded-xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-lg hover:shadow-cyan-100/60">
                <button type="button" onClick={() => setSelectedProduct(product)} className="relative mb-4 block h-36 w-full overflow-hidden rounded-lg bg-slate-100 text-left" aria-label={`View details for ${product.name}`}><img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /><div className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-700 shadow-sm">{product.category}</div><div className="absolute bottom-3 right-3 rounded-full bg-slate-900/80 px-2 py-1 text-[10px] font-semibold text-white">View details</div></button>
                <div className="flex items-start justify-between gap-3"><div className="flex items-start gap-3"><div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${product.color} text-white`}><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7 12 3 4 7m16 0-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M8 5l8 4" /></svg></div><div><span className="text-xs font-semibold uppercase tracking-wide text-cyan-600">{product.category}</span><h3 className="mt-1 font-semibold text-slate-900">{product.name}</h3></div></div><span className="text-sm font-bold text-slate-900">{product.price}</span></div>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs"><span className="rounded-full bg-amber-50 px-2 py-1 font-semibold text-amber-700">★ {product.rating}</span><span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">{product.delivery}</span><span className="rounded-full bg-emerald-50 px-2 py-1 font-semibold text-emerald-700">Finance eligible</span></div>
                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500"><span>Supplier: <strong className="font-medium text-slate-700">{product.supplier}</strong></span><span>Stock: <strong className="font-medium text-slate-700">{product.stock}</strong></span><span>Region: <strong className="font-medium text-slate-700">{product.region}</strong></span><span>Verified supplier</span></div>
                <div className="mt-4 grid grid-cols-[1fr_auto] gap-2"><button type="button" onClick={() => setSelectedProduct(product)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700">Details</button><button type="button" onClick={() => showNotice(`${product.name} added to the order review.`)} className="rounded-lg border border-cyan-300 px-3 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-600 hover:text-white">{isProvider ? 'Manage item' : 'Request input'}</button></div>
              </div>
            ))}
          </div>
          {filteredProducts.length === 0 && <div className="mt-5 rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No catalog items match this search.</div>}
          {isProvider && <div className="mt-6 rounded-lg border border-cyan-200 bg-cyan-50 p-4"><h3 className="font-semibold text-slate-900">Add a catalog item</h3><div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">{[['name', 'Item name'], ['category', 'Category'], ['price', 'Price'], ['stock', 'Available stock']].map(([name, label]) => <input key={name} name={name} value={listing[name]} onChange={handleFieldChange(setListing)} aria-label={label} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" />)}</div></div>}
        </div>
      )}

      {activeTab === 'orders' && isProvider && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-lg font-semibold text-slate-900">Finance-backed input orders</h2><p className="text-sm text-slate-500">Confirm fulfillment so CreditTrack can update the farm record.</p><div className="mt-5 overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-3 py-3">Order</th><th className="px-3 py-3">Farmer</th><th className="px-3 py-3">Input</th><th className="px-3 py-3">Value</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Action</th></tr></thead><tbody>{marketplaceOrders.map((order) => <tr key={order.id} className="border-b border-slate-100"><td className="px-3 py-3 font-semibold">{order.id}</td><td className="px-3 py-3">{order.farmer}</td><td className="px-3 py-3">{order.item}</td><td className="px-3 py-3">{order.value}</td><td className="px-3 py-3 text-emerald-700">{order.status}</td><td className="px-3 py-3"><button type="button" onClick={() => showNotice(`Delivery evidence requested for ${order.id}.`)} className="text-cyan-700 font-semibold hover:underline">Update</button></td></tr>)}</tbody></table></div></div>
      )}

      {activeTab === 'map' && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_1fr]">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between"><div><h2 className="text-lg font-semibold text-slate-900">Input supply map</h2><p className="text-sm text-slate-500">Track supplier locations and finance eligibility by region</p></div><span className="rounded-full bg-cyan-100 px-2.5 py-1 text-xs font-semibold text-cyan-700">31 suppliers mapped</span></div>
            <div className="relative mt-5 h-[360px] overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-cyan-50 via-slate-50 to-amber-50">
              <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'linear-gradient(30deg, transparent 48%, #cbd5e1 49%, transparent 50%), linear-gradient(120deg, transparent 48%, #cbd5e1 49%, transparent 50%)', backgroundSize: '90px 90px' }} />
              <div className="absolute left-[22%] top-[22%] h-[62%] w-[54%] rotate-[12deg] rounded-[45%] border-2 border-slate-300/70 bg-emerald-100/40" />
              {supplyRegions.map((region) => <button key={region.name} type="button" onClick={() => showNotice(`${region.name}: ${region.eligible}% of mapped farms are CreditTrack eligible.`)} className={`absolute ${region.coordinates} z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full bg-white px-2 py-1.5 text-left shadow-md ring-1 ring-slate-200 transition hover:scale-105`}><span className={`h-3 w-3 rounded-full ${region.tone} ring-4 ring-white`} /><span><strong className="block text-xs text-slate-800">{region.name}</strong><small className="block text-[10px] text-slate-500">{region.eligible}% eligible</small></span></button>)}
              <div className="absolute bottom-4 left-4 rounded-lg border border-white/80 bg-white/90 px-3 py-2 text-xs text-slate-600 shadow-sm"><span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-500" />Eligible capacity <span className="ml-3 mr-2 inline-block h-2 w-2 rounded-full bg-amber-500" />Review required</div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-lg font-semibold text-slate-900">Regional eligibility</h2><p className="text-sm text-slate-500">Supply readiness for finance-backed input delivery</p><div className="mt-4 space-y-3">{supplyRegions.map((region) => <div key={region.name} className="rounded-lg border border-slate-200 p-3"><div className="flex items-center justify-between"><div><span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{region.code}</span><h3 className="font-semibold text-slate-800">{region.name}</h3></div><span className="text-lg font-bold text-slate-900">{region.eligible}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${region.tone}`} style={{ width: `${region.eligible}%` }} /></div><div className="mt-2 flex justify-between text-xs text-slate-500"><span>{region.suppliers} suppliers · {region.products} products</span><span>{region.status}</span></div></div>)}</div></div>
        </div>
      )}

      {activeTab === 'demand' && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_1fr]">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="text-lg font-semibold text-slate-900">Off-taker purchase demand</h2><p className="text-sm text-slate-500">Match demand with monitored and financed farms</p></div><span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">{purchaseRequests.length} requests</span></div><div className="mt-5 space-y-3">{purchaseRequests.map((request) => <div key={request.id} className="rounded-lg border border-slate-200 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><span className="text-xs font-semibold uppercase tracking-wide text-amber-700">{request.crop}</span><h3 className="mt-1 font-semibold text-slate-900">{request.buyer}</h3></div><span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">{request.status}</span></div><div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-600"><span>{request.volume}</span><span>{request.price}</span><span>{request.region}</span><span>Due {request.delivery}</span></div><button type="button" onClick={() => setSelectedDemand(request)} className="mt-4 rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-700">View demand details</button></div>)}</div></div>
          {isOfftaker && <div className="rounded-xl border border-amber-200 bg-amber-50 p-5"><h2 className="text-lg font-semibold text-slate-900">Post a purchase request</h2><p className="mt-1 text-sm text-slate-600">Create demand that can support off-taker-backed farm finance.</p><div className="mt-4 space-y-3">{[['crop', 'Crop'], ['volume', 'Required volume'], ['region', 'Delivery region'], ['delivery', 'Delivery date']].map(([name, label]) => <label key={name} className="block text-sm font-medium text-slate-700">{label}<input name={name} value={demand[name]} onChange={handleFieldChange(setDemand)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2" /></label>)}</div><button type="button" onClick={() => showNotice('Purchase demand posted for supplier matching.')} className="mt-4 w-full rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700">Post demand</button></div>}
        </div>
      )}

      {activeTab === 'commitments' && isOfftaker && <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-lg font-semibold text-slate-900">Purchase commitments</h2><p className="text-sm text-slate-500">Commitments give lenders visibility into repayment revenue.</p><div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">{[['Savanna Foods Ltd', 'Rice', '120 tonnes', '92% covered'], ['Golden Harvest Co.', 'Maize', '80 tonnes', '64% covered'], ['FreshRoute Markets', 'Tomato', '35 tonnes', '78% covered']].map(([buyer, crop, volume, coverage]) => <div key={buyer} className="rounded-lg border border-slate-200 p-4"><span className="text-xs font-semibold text-amber-700">{crop}</span><h3 className="mt-1 font-semibold text-slate-900">{buyer}</h3><p className="mt-2 text-sm text-slate-600">{volume}</p><p className="mt-2 text-sm font-semibold text-emerald-700">{coverage}</p><button type="button" onClick={() => showNotice(`${buyer} commitment marked ready for settlement.`)} className="mt-4 w-full rounded-lg border border-amber-300 px-3 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50">Review commitment</button></div>)}</div></div>}

      {selectedDemand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="demand-details-title">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4"><div><span className="text-xs font-bold uppercase tracking-[0.16em] text-amber-600">Demand request #{selectedDemand.id}</span><h2 id="demand-details-title" className="mt-2 text-2xl font-bold text-slate-900">{selectedDemand.buyer}</h2><p className="mt-1 text-sm text-slate-500">Verified off-taker demand for {selectedDemand.crop}</p></div><button type="button" onClick={() => setSelectedDemand(null)} className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-200" aria-label="Close demand details">Close</button></div>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{[['Volume', selectedDemand.volume], ['Offer price', selectedDemand.price], ['Region', selectedDemand.region], ['Delivery', selectedDemand.delivery]].map(([label, value]) => <div key={label} className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-sm font-semibold text-slate-800">{value}</p></div>)}</div>
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4"><div className="flex items-center justify-between"><h3 className="font-semibold text-emerald-900">CreditTrack match</h3><span className="text-lg font-bold text-emerald-700">{selectedDemand.farms}</span></div><p className="mt-2 text-sm leading-6 text-emerald-800">These farms have the crop profile, monitored production signals, and regional input access needed to fulfill this request.</p></div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm"><div className="rounded-lg border border-slate-200 p-3"><p className="text-xs text-slate-500">Quality requirement</p><p className="mt-1 font-semibold text-slate-800">{selectedDemand.quality}</p></div><div className="rounded-lg border border-slate-200 p-3"><p className="text-xs text-slate-500">Commercial terms</p><p className="mt-1 font-semibold text-slate-800">{selectedDemand.terms}</p></div></div>
            <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setSelectedDemand(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Back</button><button type="button" onClick={() => { setSelectedDemand(null); showNotice(`${selectedDemand.buyer} commitment sent for matching.`); }} className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700">Create commitment</button></div>
          </div>
        </div>
      )}

      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="product-details-title">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="relative h-56 overflow-hidden bg-slate-100"><img src={selectedProduct.image} alt={selectedProduct.name} className="h-full w-full object-cover" /><button type="button" onClick={() => setSelectedProduct(null)} className="absolute right-4 top-4 rounded-full bg-slate-900/75 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-900" aria-label="Close product details">Close</button><span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-700">{selectedProduct.category}</span></div>
            <div className="p-6"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><h2 id="product-details-title" className="text-2xl font-bold text-slate-900">{selectedProduct.name}</h2><p className="mt-1 text-sm text-slate-500">Supplied by {selectedProduct.supplier}</p></div><span className="text-xl font-bold text-slate-900">{selectedProduct.price}</span></div>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">{[['Rating', `★ ${selectedProduct.rating}`], ['Available', selectedProduct.stock], ['Delivery', selectedProduct.delivery], ['Region', selectedProduct.region]].map(([label, value]) => <div key={label} className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-sm font-semibold text-slate-800">{value}</p></div>)}</div>
              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4"><div className="flex items-center justify-between"><h3 className="font-semibold text-emerald-900">Finance-backed purchase</h3><span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-emerald-700">Eligible</span></div><p className="mt-2 text-sm leading-6 text-emerald-800">This item can be requested through an approved CreditTrack facility. Delivery evidence will update the financed farm record.</p></div>
              <div className="mt-6 flex flex-wrap justify-end gap-2"><button type="button" onClick={() => setSelectedProduct(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Back to catalog</button><button type="button" onClick={() => { setSelectedProduct(null); showNotice(`${selectedProduct.name} added to the order review.`); }} className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700">{isProvider ? 'Manage listing' : 'Request this item'}</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgroMartModule;
