import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';

const practiceOptions = [
  ['agroforestry', 'Agroforestry or tree planting'],
  ['cover_crop', 'Cover crops and soil cover'],
  ['compost', 'Compost or manure application'],
  ['conservation_tillage', 'Conservation tillage'],
  ['water_management', 'Water-saving farm management'],
];

export default function CarbonCreditRewards({ selectedLocation }) {
  const [viewer, setViewer] = useState(null);
  const [farmers, setFarmers] = useState([]);
  const [selectedFarmerId, setSelectedFarmerId] = useState('');
  const [pendingActivities, setPendingActivities] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewHasMore, setReviewHasMore] = useState(false);
  const [summary, setSummary] = useState(null);
  const [practice, setPractice] = useState('agroforestry');
  const [acres, setAcres] = useState('1');
  const [evidence, setEvidence] = useState('');
  const [redeemUnits, setRedeemUnits] = useState('10');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadSummary = (farmerId = selectedFarmerId) => {
    setLoading(true);
    api.carbonCredits(farmerId)
      .then(setSummary)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  };

  const loadReviewQueue = (reset = false) => {
    const offset = reset ? 0 : pendingActivities.length;
    setReviewLoading(true);
    api.pendingCarbonCredits(5, offset)
      .then((result) => {
        setPendingActivities((current) => reset ? result.items : [...current, ...result.items]);
        setReviewHasMore(result.hasMore);
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setReviewLoading(false));
  };

  useEffect(() => {
    api.me()
      .then((user) => {
        setViewer(user);
        if (user.role === 'admin') loadReviewQueue(true);
        if (user.role === 'agronomist') return api.credittrackFarmers().then((records) => { setFarmers(records); setSelectedFarmerId(records[0]?.id || ''); return records[0]?.id || ''; });
        return '';
      })
      .then((farmerId) => loadSummary(farmerId))
      .catch((requestError) => { setError(requestError.message); setLoading(false); });
  }, []);

  useEffect(() => {
    if (viewer?.role === 'agronomist' && selectedFarmerId) loadSummary(selectedFarmerId);
  }, [selectedFarmerId]);

  const reviewActivity = async (activityId, approved) => {
    setSaving(true);
    setError('');
    try {
      await api.verifyCarbonPractice(activityId, approved, approved ? 'Approved after admin MRV review' : 'Rejected during admin MRV review');
      setPendingActivities((current) => current.filter((activity) => activity.id !== activityId));
      setReviewHasMore(true);
      setMessage(approved ? 'Carbon activity approved and units released to the farmer.' : 'Carbon activity rejected and kept out of the redeemable balance.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const submitPractice = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const result = await api.recordCarbonPractice({ farmerId: selectedFarmerId || undefined, practice, acres: Number(acres), evidence, location: selectedLocation?.latitude ? { latitude: selectedLocation.latitude, longitude: selectedLocation.longitude, placeName: selectedLocation.placeName || selectedLocation.name } : null });
      setSummary((current) => ({ ...current, account: result.account, activities: [result.activity, ...(current?.activities || [])] }));
      setEvidence('');
      setMessage(`Reported ${result.activity.units} carbon units. They will become redeemable after MRV verification.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const redeem = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const result = await api.redeemCarbonCredits(Number(redeemUnits));
      setSummary((current) => ({ ...current, account: { ...current.account, balance: result.carbonBalance, redeemed: (current.account.redeemed || 0) + result.carbonUnits } }));
      setMessage(`${result.platformCredits} platform credit${result.platformCredits === 1 ? '' : 's'} added to your account.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Farmer climate rewards</p>
          <h2 className="mt-1 text-xl font-semibold text-emerald-950">Accumulate Carbon Credits</h2>
          <p className="mt-1 text-sm text-emerald-800">Record climate-smart farm practices, build verified carbon units, and redeem them for platform credits.</p>
        </div>
        <div className="rounded-lg bg-white px-4 py-3 text-right shadow-sm">
          <p className="text-xs text-slate-500">Carbon balance</p>
          <p className="text-2xl font-bold text-emerald-700">{loading ? '...' : `${summary?.account?.balance || 0} units`}</p>
          {!loading && <p className="text-xs text-amber-700">{summary?.account?.pendingBalance || 0} pending review</p>}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <form onSubmit={submitPractice} className="rounded-lg bg-white p-4 shadow-sm">
          <h3 className="font-semibold text-slate-900">Log a climate practice</h3>
          {viewer?.role === 'agronomist' && <label className="mt-3 block text-sm text-slate-700">Monitored farmer<select value={selectedFarmerId} onChange={(event) => setSelectedFarmerId(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" required><option value="">Select monitored farmer</option>{farmers.map((farmer) => <option key={farmer.id} value={farmer.id}>{farmer.name} · {farmer.phone}</option>)}</select></label>}
          <label className="mt-3 block text-sm text-slate-700">Practice<select value={practice} onChange={(event) => setPractice(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">{practiceOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label className="mt-3 block text-sm text-slate-700">Farm area (acres)<input type="number" min="0.1" max="10000" step="0.1" value={acres} onChange={(event) => setAcres(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
          <label className="mt-3 block text-sm text-slate-700">Evidence note (optional)<textarea value={evidence} onChange={(event) => setEvidence(event.target.value)} placeholder="e.g. planted 40 shade trees around the maize plot" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" rows="2" /></label>
          <button disabled={saving || loading} className="mt-4 w-full rounded-lg bg-emerald-700 px-4 py-2.5 font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">{saving ? 'Saving...' : 'Add carbon activity'}</button>
        </form>

        <form onSubmit={redeem} className="rounded-lg bg-white p-4 shadow-sm">
          <h3 className="font-semibold text-slate-900">Redeem your reward</h3>
          <p className="mt-2 text-sm text-slate-600">Only verified units can be redeemed. Every 10 verified units become 1 platform credit.</p>
          <label className="mt-4 block text-sm text-slate-700">Carbon units to redeem<input type="number" min="10" step="10" value={redeemUnits} onChange={(event) => setRedeemUnits(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
          <button disabled={saving || loading || !summary?.account?.balance} className="mt-4 w-full rounded-lg bg-slate-900 px-4 py-2.5 font-semibold text-white hover:bg-slate-800 disabled:opacity-50">Redeem carbon reward</button>
          <p className="mt-3 text-xs text-slate-500">Redeemed so far: {summary?.account?.redeemed || 0} units</p>
        </form>
      </div>

      {message && <p className="mt-4 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm text-emerald-800" role="status">{message}</p>}
      {error && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">{error}</p>}

      <div className="mt-4 rounded-lg bg-white p-4 shadow-sm">
        <h3 className="font-semibold text-slate-900">Recent activities</h3>
        {!summary?.activities?.length && <p className="mt-2 text-sm text-slate-500">No activities recorded yet.</p>}
        <div className="mt-2 space-y-2">{summary?.activities?.slice(0, 5).map((activity) => <div key={activity.id} className="flex flex-wrap justify-between gap-2 border-b border-slate-100 py-2 text-sm"><span className="text-slate-700">{activity.practiceLabel} · {activity.acres} acres <span className="ml-1 text-xs text-slate-500">{activity.status}</span></span><strong className={activity.status === 'verified' ? 'text-emerald-700' : 'text-amber-700'}>+{activity.units} units</strong></div>)}</div>
      </div>

      {viewer?.role === 'admin' && <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div><h3 className="font-semibold text-amber-950">Admin MRV review queue</h3><p className="text-sm text-amber-800">Approve valid farmer reports to release carbon units, or reject incomplete evidence.</p></div>
          <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-amber-800">{pendingActivities.length} pending</span>
        </div>
        {reviewLoading && !pendingActivities.length && <p className="mt-3 text-sm text-amber-800">Loading pending activities...</p>}
        {!reviewLoading && !pendingActivities.length && <p className="mt-3 text-sm text-amber-800">No pending carbon activities.</p>}
        <div className="mt-3 space-y-3">{pendingActivities.map((activity) => <article key={activity.id} className="rounded-lg border border-amber-200 bg-white p-3">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold text-slate-900">{activity.farmer?.name || 'Unknown farmer'} · {activity.farmer?.phone || activity.farmerId}</p><p className="text-sm text-slate-700">{activity.practiceLabel} · {activity.acres} acres · {activity.units} carbon units</p><p className="mt-1 text-xs text-slate-500">Reported {new Date(activity.createdAt).toLocaleString()} by {activity.userId}</p></div><span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">Reported</span></div>
          <p className="mt-2 text-sm text-slate-600">Evidence: {activity.evidence || 'No evidence note provided.'}</p>
          <p className="mt-1 text-xs text-slate-500">Measured area: {activity.mrv?.measured?.acres || activity.acres} acres · Location: {activity.mrv?.measured?.location?.placeName || 'Not supplied'}</p>
          <div className="mt-3 flex gap-2"><button type="button" onClick={() => reviewActivity(activity.id, true)} disabled={saving} className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">Approve</button><button type="button" onClick={() => reviewActivity(activity.id, false)} disabled={saving} className="rounded-lg bg-red-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">Reject</button></div>
        </article>)}</div>
        {reviewHasMore && <button type="button" onClick={() => loadReviewQueue()} disabled={reviewLoading} className="mt-3 rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-semibold text-amber-900 disabled:opacity-50">{reviewLoading ? 'Loading...' : 'Load more pending activities'}</button>}
      </div>}

      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
        <h3 className="font-semibold text-slate-900">How MRV applies</h3>
        <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
          <p><strong>Measure:</strong> record acres, practice, date, and location.</p>
          <p><strong>Report:</strong> submit an evidence note and activity record.</p>
          <p><strong>Verify:</strong> an authorized reviewer checks field evidence before release.</p>
        </div>
        <p className="mt-2 text-xs text-slate-500">This workspace uses a demo verifier workflow. Real carbon-market issuance still requires an approved methodology, monitoring report, independent validation/verification body, and registry process.</p>
      </div>
    </section>
  );
}
