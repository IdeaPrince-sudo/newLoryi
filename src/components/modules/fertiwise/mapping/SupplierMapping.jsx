import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, List, Map, Plus, RefreshCw, ShieldCheck } from 'lucide-react';
import { api } from '../../../../lib/api';

const emptyReport = { productName: '', region: '', severity: 'Medium', description: '' };

const SupplierMapping = () => {
  const [activeTab, setActiveTab] = useState('suppliers');
  const [viewMode, setViewMode] = useState('list');
  const [suppliers, setSuppliers] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [selectedReportId, setSelectedReportId] = useState('');
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportForm, setReportForm] = useState(emptyReport);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadMappingData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [supplierData, reportData] = await Promise.all([api.suppliers(), api.counterfeitReports()]);
      setSuppliers(supplierData);
      setReports(reportData);
    } catch (requestError) {
      setError(requestError.message || 'Supplier mapping data could not be loaded. Check the API connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMappingData(); }, [loadMappingData]);

  const selectedSupplier = suppliers.find((supplier) => String(supplier.id) === String(selectedSupplierId));
  const selectedReport = reports.find((report) => String(report.id) === String(selectedReportId));
  const geocodedCount = activeTab === 'suppliers'
    ? suppliers.filter((supplier) => Number.isFinite(Number(supplier.location?.lat)) && Number.isFinite(Number(supplier.location?.lng))).length
    : reports.filter((report) => Number.isFinite(Number(report.location?.lat)) && Number.isFinite(Number(report.location?.lng))).length;

  const handleSubmitReport = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const report = await api.createCounterfeitReport(reportForm);
      setReports((current) => [report, ...current]);
      setSelectedReportId(String(report.id));
      setActiveTab('counterfeit');
      setShowReportForm(false);
      setReportForm(emptyReport);
      setNotice('Report submitted for review. It is not marked verified.');
    } catch (requestError) {
      setError(requestError.message || 'Counterfeit report could not be submitted.');
    } finally {
      setSaving(false);
    }
  };

  const tabButton = (id, label) => (
    <button
      type="button"
      key={id}
      onClick={() => { setActiveTab(id); setNotice(''); setError(''); }}
      className={`border-b-2 px-3 py-3 text-sm font-semibold transition-colors ${activeTab === id ? id === 'suppliers' ? 'border-emerald-800 text-emerald-900' : 'border-red-700 text-red-800' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
      aria-current={activeTab === id ? 'page' : undefined}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-950">Supplier & Counterfeit Mapping</h1>
          <p className="mt-1 text-sm text-gray-600">Marketplace sellers and community-submitted reports.</p>
        </div>
        <button type="button" onClick={loadMappingData} disabled={loading} title="Refresh directory" aria-label="Refresh directory" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50">
          <RefreshCw size={16} aria-hidden="true" />
        </button>
      </header>

      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 sm:px-5">
          <nav className="flex gap-2" aria-label="Supplier mapping sections">
            {tabButton('suppliers', 'Supplier Directory')}
            {tabButton('counterfeit', 'Counterfeit Reports')}
          </nav>
          <div className="flex items-center gap-2 py-2">
            {activeTab === 'counterfeit' && <button type="button" onClick={() => { setShowReportForm((open) => !open); setError(''); }} className="inline-flex items-center gap-2 rounded-md bg-red-700 px-3 py-2 text-sm font-semibold text-white hover:bg-red-800">
              <Plus size={15} aria-hidden="true" />{showReportForm ? 'Cancel report' : 'Report suspected counterfeit'}
            </button>}
            <div className="inline-flex rounded-md border border-gray-200 bg-gray-50 p-0.5" aria-label="Directory view">
              <button type="button" onClick={() => setViewMode('list')} aria-label="List view" aria-pressed={viewMode === 'list'} title="List view" className={`flex h-8 w-8 items-center justify-center rounded ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}><List size={16} aria-hidden="true" /></button>
              <button type="button" onClick={() => setViewMode('map')} aria-label="Map view" aria-pressed={viewMode === 'map'} title="Map view" className={`flex h-8 w-8 items-center justify-center rounded ${viewMode === 'map' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}><Map size={16} aria-hidden="true" /></button>
            </div>
          </div>
        </header>

        <div className="space-y-4 p-4 sm:p-5">
          {error && <p role="alert" className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800"><AlertCircle size={17} className="mt-0.5 shrink-0" aria-hidden="true" />{error}</p>}
          {notice && <p role="status" className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">{notice}</p>}

          {showReportForm && activeTab === 'counterfeit' && (
            <form onSubmit={handleSubmitReport} className="rounded-md border border-red-200 bg-red-50/50 p-4">
              <h2 className="text-sm font-semibold text-gray-900">Submit a counterfeit concern</h2>
              <p className="mt-1 text-xs text-gray-600">Reports are submitted as “Under Investigation” and are not treated as verified findings.</p>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="text-sm font-medium text-gray-700">Product or brand
                  <input required maxLength={120} value={reportForm.productName} onChange={(event) => setReportForm((current) => ({ ...current, productName: event.target.value }))} className="mt-1.5 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-normal text-gray-900" />
                </label>
                <label className="text-sm font-medium text-gray-700">Region
                  <input required maxLength={100} value={reportForm.region} onChange={(event) => setReportForm((current) => ({ ...current, region: event.target.value }))} placeholder="e.g. Ashanti" className="mt-1.5 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-normal text-gray-900" />
                </label>
                <label className="text-sm font-medium text-gray-700">Severity
                  <select value={reportForm.severity} onChange={(event) => setReportForm((current) => ({ ...current, severity: event.target.value }))} className="mt-1.5 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-normal text-gray-900">
                    <option>Low</option><option>Medium</option><option>High</option>
                  </select>
                </label>
                <label className="text-sm font-medium text-gray-700 sm:col-span-2">What raised your concern?
                  <textarea required maxLength={2000} rows={3} value={reportForm.description} onChange={(event) => setReportForm((current) => ({ ...current, description: event.target.value }))} className="mt-1.5 w-full resize-y rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-normal text-gray-900" />
                </label>
              </div>
              <div className="mt-3 flex justify-end">
                <button type="submit" disabled={saving} className="rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50">{saving ? 'Submitting…' : 'Submit report'}</button>
              </div>
            </form>
          )}

          {viewMode === 'map' ? (
            <div className="rounded-md border border-gray-200 bg-gray-50 px-5 py-10 text-center">
              <Map size={28} className="mx-auto text-gray-400" aria-hidden="true" />
              <h2 className="mt-3 text-sm font-semibold text-gray-900">No mapped locations available</h2>
              <p className="mx-auto mt-1 max-w-lg text-sm text-gray-600">{geocodedCount ? `${geocodedCount} records include coordinates, but the current directory API does not provide map tiles.` : 'The live marketplace and report records do not include coordinates yet. Use List View to inspect available records.'}</p>
            </div>
          ) : loading ? (
            <p role="status" className="rounded-md bg-gray-50 px-4 py-12 text-center text-sm text-gray-600">Loading live marketplace data…</p>
          ) : activeTab === 'suppliers' ? (
            suppliers.length ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-left">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr>
                    <th className="px-4 py-3 font-semibold">Marketplace seller</th><th className="px-4 py-3 font-semibold">Listed regions</th><th className="px-4 py-3 font-semibold">Products</th><th className="px-4 py-3 font-semibold">Certification</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {suppliers.map((supplier) => (
                      <tr key={supplier.id} className={selectedSupplierId === supplier.id ? 'bg-emerald-50/60' : 'hover:bg-gray-50'}>
                        <td className="px-4 py-3.5"><button type="button" onClick={() => setSelectedSupplierId(selectedSupplierId === supplier.id ? '' : supplier.id)} className="text-left text-sm font-semibold text-gray-900 hover:text-emerald-800">{supplier.name}</button>{supplier.ratings !== null && <p className="mt-0.5 text-xs text-gray-500">Rating {supplier.ratings.toFixed(1)} from {supplier.reviewCount} listed product ratings</p>}</td>
                        <td className="px-4 py-3.5 text-sm text-gray-700">{supplier.regions.join(', ') || 'Not listed'}</td>
                        <td className="px-4 py-3.5"><div className="flex flex-wrap gap-1.5">{supplier.productCategories.map((category) => <span key={category} className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">{category}</span>)}<span className="text-xs text-gray-500">{supplier.products.length} listed</span></div></td>
                        <td className="px-4 py-3.5"><span className="inline-flex items-center gap-1 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-900"><ShieldCheck size={13} aria-hidden="true" />{supplier.verificationStatus}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <EmptyState title="No marketplace sellers found" text="Suppliers will appear here when products are listed through the marketplace API." />
          ) : (
            reports.length ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-left">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr>
                    <th className="px-4 py-3 font-semibold">Product</th><th className="px-4 py-3 font-semibold">Region</th><th className="px-4 py-3 font-semibold">Reported</th><th className="px-4 py-3 font-semibold">Severity</th><th className="px-4 py-3 font-semibold">Status</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {reports.map((report) => (
                      <tr key={report.id} className={selectedReportId === report.id ? 'bg-red-50/60' : 'hover:bg-gray-50'}>
                        <td className="px-4 py-3.5"><button type="button" onClick={() => setSelectedReportId(selectedReportId === report.id ? '' : report.id)} className="text-left text-sm font-semibold text-gray-900 hover:text-red-800">{report.productName}</button><p className="mt-0.5 max-w-lg truncate text-xs text-gray-500">{report.description}</p></td>
                        <td className="px-4 py-3.5 text-sm text-gray-700">{report.region || 'Not listed'}</td>
                        <td className="px-4 py-3.5 text-sm text-gray-600">{new Date(report.reportDate || report.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3.5"><SeverityBadge severity={report.severity} /></td>
                        <td className="px-4 py-3.5"><span className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-900">{report.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <EmptyState title="No counterfeit reports yet" text="Submitted concerns will be listed here with an investigation status. Reports are not considered verified until reviewed." />
          )}

          {selectedSupplier && activeTab === 'suppliers' && <section className="rounded-md border border-emerald-200 bg-emerald-50/40 p-4">
            <h2 className="font-semibold text-gray-900">{selectedSupplier.name}</h2><p className="mt-1 text-sm text-gray-600">Certification status: {selectedSupplier.verificationStatus}. Marketplace presence is not proof of certification.</p>
            <ul className="mt-3 divide-y divide-emerald-100">{selectedSupplier.products.map((product) => <li key={product.id} className="flex flex-wrap justify-between gap-x-4 gap-y-1 py-2 text-sm"><span className="font-medium text-gray-800">{product.name} <span className="font-normal text-gray-500">· {product.category}</span></span><span className="text-gray-600">{product.price !== null ? `GH₵ ${product.price}` : 'Price not listed'} · {product.stock || 'Stock not listed'}</span></li>)}</ul>
          </section>}
          {selectedReport && activeTab === 'counterfeit' && <section className="rounded-md border border-red-200 bg-red-50/50 p-4"><h2 className="font-semibold text-gray-900">Report details</h2><p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{selectedReport.description}</p><p className="mt-3 text-xs text-gray-500">Submitted by {selectedReport.reporterType || 'Marketplace user'} · {selectedReport.status}</p></section>}
        </div>
      </section>
    </div>
  );
};

const SeverityBadge = ({ severity }) => {
  const color = severity === 'High' ? 'border-red-200 bg-red-50 text-red-800' : severity === 'Medium' ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-gray-200 bg-gray-50 text-gray-700';
  return <span className={`rounded border px-2 py-1 text-xs font-medium ${color}`}>{severity || 'Medium'}</span>;
};

const EmptyState = ({ title, text }) => <div className="rounded-md border border-gray-200 bg-gray-50 px-5 py-12 text-center"><h2 className="text-sm font-semibold text-gray-900">{title}</h2><p className="mx-auto mt-1 max-w-xl text-sm text-gray-600">{text}</p></div>;

export default SupplierMapping;