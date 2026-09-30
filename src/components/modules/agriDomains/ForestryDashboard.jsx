import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../../../lib/api';
import { AlertTriangle, Check, Mic, MicOff, Plus, TreePine, Volume2 } from 'lucide-react';
import RecordInsights from './RecordInsights';

const tabs = [
  { id: 'trees', label: 'Tree survival' },
  { id: 'guidance', label: 'Agroforestry guidance' },
  { id: 'ntfp', label: 'NTFP reminders' },
  { id: 'erosion', label: 'Erosion alerts' },
];

const regions = [
  'Ahafo', 'Ashanti', 'Bono', 'Bono East', 'Central', 'Eastern', 'Greater Accra',
  'North East', 'Northern', 'Oti', 'Savannah', 'Upper East', 'Upper West', 'Volta', 'Western', 'Western North',
];

const legumeSteps = [
  { title: 'Check local suitability', detail: 'Ask a local extension officer which nitrogen-fixing legume is adapted to your rainfall, soil and tree crop. Examples may include pigeon pea or locally approved Gliricidia; avoid planting unfamiliar species without local advice.' },
  { title: 'Mark the tree rows', detail: 'Mark existing tree and crop rows first. Leave enough room around young trees so the legume does not compete for light, water or nutrients.' },
  { title: 'Plant with reliable moisture', detail: 'Sow at the start of dependable rains. Follow the seed supplier or extension officer guidance for spacing and seed preparation.' },
  { title: 'Prune before shading', detail: 'Watch legume height and shade. Prune where needed, keep cut material as surface mulch, and keep stems clear of tree trunks.' },
  { title: 'Review after establishment', detail: 'Check survival and crop competition after establishment. Adjust spacing or prune more often if trees or crops are being shaded.' },
];

const ntfpOptions = ['Shea nut collection', 'Medicinal bark inspection', 'Medicinal bark harvest', 'Other non-timber product'];
const displayDate = (value) => value ? new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not recorded';
const createdTime = (record) => new Date(record.createdAt || record.recordedOn || 0).getTime();

const ForestryDashboard = () => {
  const [records, setRecords] = useState([]);
  const [activeTab, setActiveTab] = useState('trees');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const [plantingForm, setPlantingForm] = useState({ species: 'Shea', block: '', plantedOn: '', plantedCount: '', spacing: '' });
  const [survivalForm, setSurvivalForm] = useState({ plantingId: '', checkedOn: new Date().toISOString().slice(0, 10), survivingCount: '', note: '' });
  const [ntfpForm, setNtfpForm] = useState({ activity: ntfpOptions[0], dueDate: '', block: '', guidance: '' });
  const [erosionForm, setErosionForm] = useState({ region: 'Ashanti', block: '', slope: 'Gentle', groundCover: 'Covered' });
  const [forecastCheck, setForecastCheck] = useState(null);

  useEffect(() => {
    api.moduleRecords('forestry')
      .then(setRecords)
      .catch((requestError) => setError(requestError.message || 'Could not load forestry records.'))
      .finally(() => setLoading(false));
    return () => window.speechSynthesis?.cancel();
  }, []);

  const plantings = useMemo(() => records.filter((record) => record.type === 'planting'), [records]);
  const reminders = useMemo(() => records.filter((record) => record.type === 'ntfpReminder').sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || '')), [records]);
  const newestSurvival = (planting) => records
    .filter((record) => record.type === 'survivalCheck' && record.plantingId === planting.id)
    .sort((a, b) => createdTime(b) - createdTime(a))[0];
  const checkedPlantings = plantings.filter((planting) => newestSurvival(planting));
  const totalSurviving = checkedPlantings.reduce((sum, planting) => sum + Number(newestSurvival(planting).survivingCount || 0), 0);
  const totalChecked = checkedPlantings.reduce((sum, planting) => sum + Number(planting.plantedCount || 0), 0);
  const survivalRate = totalChecked ? Math.round((totalSurviving / totalChecked) * 100) : null;
  const uninspectedGroups = plantings.filter((planting) => !newestSurvival(planting)).length;
  const today = new Date().toISOString().slice(0, 10);
  const openReminders = reminders.filter((reminder) => !records.some((record) => record.type === 'ntfpReminder' && record.status === 'completed' && record.reminderId === reminder.id));
  const overdueReminders = openReminders.filter((reminder) => reminder.dueDate < today).length;
  const latestErosionCheck = records.find((record) => record.type === 'erosionCheck');
  const forestryInsights = [];
  if (plantings.length) {
    forestryInsights.push(survivalRate === null
      ? `${plantings.length} planting group${plantings.length === 1 ? '' : 's'} recorded; no survival checks saved yet.`
      : `Latest survival counts cover ${checkedPlantings.length} of ${plantings.length} planting groups, with ${survivalRate}% survival across checked trees.`);
  }
  if (uninspectedGroups) forestryInsights.push(`${uninspectedGroups} planting group${uninspectedGroups === 1 ? '' : 's'} still need an initial survival check.`);
  if (overdueReminders) forestryInsights.push(`${overdueReminders} NTFP reminder${overdueReminders === 1 ? '' : 's'} is past its scheduled date.`);
  if (latestErosionCheck?.flaggedDays?.length) forestryInsights.push(`The latest erosion check flagged ${latestErosionCheck.flaggedDays.length} heavy-rain or thunderstorm day${latestErosionCheck.flaggedDays.length === 1 ? '' : 's'} for ${latestErosionCheck.region}.`);

  const saveRecord = async (record) => {
    setError('');
    setNotice('');
    setSaving(true);
    try {
      const saved = await api.createModuleRecord('forestry', record);
      setRecords((current) => [saved, ...current]);
      setNotice('Forestry record saved.');
      return saved;
    } catch (requestError) {
      setError(requestError.message || 'Could not save this record. Check your connection and try again.');
      return null;
    } finally {
      setSaving(false);
    }
  };

  const addPlanting = async (event) => {
    event.preventDefault();
    const saved = await saveRecord({ ...plantingForm, type: 'planting', plantedCount: Number(plantingForm.plantedCount) });
    if (saved) setPlantingForm({ species: 'Shea', block: '', plantedOn: '', plantedCount: '', spacing: '' });
  };

  const addSurvivalCheck = async (event) => {
    event.preventDefault();
    const planting = plantings.find((item) => item.id === survivalForm.plantingId);
    if (!planting || Number(survivalForm.survivingCount) > Number(planting.plantedCount)) {
      setError('Surviving trees cannot exceed the number originally planted.');
      return;
    }
    const saved = await saveRecord({ ...survivalForm, type: 'survivalCheck', survivingCount: Number(survivalForm.survivingCount) });
    if (saved) setSurvivalForm({ plantingId: '', checkedOn: new Date().toISOString().slice(0, 10), survivingCount: '', note: '' });
  };

  const addNtfpReminder = async (event) => {
    event.preventDefault();
    const saved = await saveRecord({ ...ntfpForm, type: 'ntfpReminder', status: 'scheduled' });
    if (saved) setNtfpForm({ activity: ntfpOptions[0], dueDate: '', block: '', guidance: '' });
  };

  const completeReminder = async (reminder) => {
    await saveRecord({ type: 'ntfpReminder', status: 'completed', reminderId: reminder.id, activity: reminder.activity, dueDate: reminder.dueDate, block: reminder.block, completedOn: new Date().toISOString().slice(0, 10) });
  };

  const runRainfallCheck = async (event, coordinates = null) => {
    event?.preventDefault();
    setError('');
    setNotice('');
    setForecastCheck(null);
    setSaving(true);
    try {
      const weather = await api.weather(coordinates
        ? { ...coordinates, name: 'Current location' }
        : erosionForm.region);
      const flaggedDays = weather.forecast.filter((day) => day.rain >= 20 || day.condition.toLowerCase().includes('thunder'));
      const cautionDays = weather.forecast.filter((day) => day.rain >= 5);
      const exposed = erosionForm.groundCover === 'Bare soil';
      const steep = erosionForm.slope === 'Steep';
      const priority = flaggedDays.length && (exposed || steep) ? 'Act before forecast heavy rain' : flaggedDays.length ? 'Heavy rain forecast: inspect vulnerable areas' : cautionDays.length && (exposed || steep) ? 'Erosion watch: rainfall and exposed ground' : 'No heavy-rain erosion alert in this forecast';
      const recommendations = flaggedDays.length || cautionDays.length
        ? ['Keep soil covered with mulch or a suitable cover crop.', 'Plan any planting or barriers along the true contour, not straight downslope.', 'Use locally adapted deep-rooted trees or shrubs in suitable strips; confirm species and spacing with an extension officer.', 'Keep drainage outlets stable and inspect after rainfall.']
        : ['Maintain ground cover and inspect slopes after rain.', 'Mark contour lines before establishing new tree rows.'];
      const result = {
        type: 'erosionCheck',
        ...erosionForm,
        location: weather.city,
        locationSource: coordinates ? 'gps' : 'region',
        ...(coordinates ? { latitude: coordinates.latitude, longitude: coordinates.longitude } : {}),
        forecast: weather.forecast,
        flaggedDays,
        cautionDays,
        priority,
        recommendations,
        checkedAt: new Date().toISOString(),
      };
      setForecastCheck(result);
      const saved = await saveRecord(result);
      if (saved) setNotice('Seven-day rainfall and erosion check saved.');
    } catch (requestError) {
      setError(requestError.message || 'Could not retrieve the regional rainfall forecast.');
    } finally {
      setSaving(false);
    }
  };

  const checkCurrentLocation = () => {
    setError('');
    if (!navigator.geolocation) {
      setError('Live location is not available in this browser. Use the region-based rainfall check instead.');
      return;
    }
    setSaving(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => runRainfallCheck(null, { latitude: coords.latitude, longitude: coords.longitude }),
      (locationError) => {
        setSaving(false);
        const message = locationError.code === locationError.PERMISSION_DENIED
          ? 'Location permission was denied. Allow access in your browser or use the region-based rainfall check.'
          : locationError.code === locationError.TIMEOUT
            ? 'Your location could not be determined in time. Try again or use the region-based check.'
            : 'Could not determine your location. Use the region-based rainfall check instead.';
        setError(message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 },
    );
  };

  const readGuidance = () => {
    if (!window.speechSynthesis) {
      setError('Voice playback is not supported by this browser.');
      return;
    }
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(legumeSteps.map((step, index) => `Step ${index + 1}. ${step.title}. ${step.detail}`).join('. '));
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const labelInput = (label, value, onChange, options = {}) => (
    <label className="block text-sm font-medium text-gray-700">{label}<input {...options} value={value} onChange={onChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" /></label>
  );

  const selectInput = (label, value, onChange, options) => (
    <label className="block text-sm font-medium text-gray-700">{label}<select value={value} onChange={onChange} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">{options.map((option) => <option key={option}>{option}</option>)}</select></label>
  );

  const submitButton = (label) => <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-md bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-900 disabled:opacity-60"><Plus size={16} aria-hidden="true" />{saving ? 'Saving…' : label}</button>;

  return (
    <main className="space-y-5">
      <header className="flex flex-col justify-between gap-4 rounded-lg border border-emerald-200 bg-emerald-50 p-5 sm:flex-row sm:items-center">
        <div><p className="text-xs font-bold uppercase text-emerald-800">Farm management / forestry</p><h1 className="mt-1 text-2xl font-bold text-gray-950">Trees & agroforestry</h1><p className="mt-1 text-sm text-gray-700">Track survival, plan tree-crop systems and prepare slopes for rain.</p></div>
        <div className="flex gap-5 text-sm"><div><span className="block text-gray-600">Planting groups</span><strong className="text-xl text-gray-950">{plantings.length}</strong></div><div><span className="block text-gray-600">Checked survival</span><strong className="text-xl text-gray-950">{survivalRate === null ? '—' : `${survivalRate}%`}</strong></div></div>
      </header>

      {(error || notice) && <div role={error ? 'alert' : 'status'} className={`rounded-md border px-4 py-3 text-sm ${error ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>{error || notice}</div>}

      <nav aria-label="Forestry tools" className="flex gap-1 overflow-x-auto border-b border-gray-300">{tabs.map((tab) => <button type="button" key={tab.id} onClick={() => setActiveTab(tab.id)} aria-current={activeTab === tab.id ? 'page' : undefined} className={`shrink-0 border-b-2 px-3 py-3 text-sm font-medium ${activeTab === tab.id ? 'border-emerald-800 text-emerald-900' : 'border-transparent text-gray-600 hover:text-gray-950'}`}>{tab.label}</button>)}</nav>

      {!loading && <RecordInsights items={forestryInsights} emptyMessage="Add tree, harvest reminder or erosion-check records to see forestry insights." />}

      {loading ? <p className="py-10 text-center text-sm text-gray-600">Loading your forestry records…</p> : <>
        {activeTab === 'trees' && <section className="space-y-5"><header><h2 className="text-lg font-semibold text-gray-950">Tree planting and survival</h2><p className="text-sm text-gray-600">Record planting groups, then count surviving trees during each field check.</p></header>
          <form onSubmit={addPlanting} className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-2 xl:grid-cols-5">
            {selectInput('Tree type', plantingForm.species, (e) => setPlantingForm({ ...plantingForm, species: e.target.value }), ['Shea', 'Cocoa shade', 'Baobab', 'Other'])}
            {labelInput('Block / plot', plantingForm.block, (e) => setPlantingForm({ ...plantingForm, block: e.target.value }), { required: true, placeholder: 'e.g. East boundary' })}
            {labelInput('Planting date', plantingForm.plantedOn, (e) => setPlantingForm({ ...plantingForm, plantedOn: e.target.value }), { required: true, type: 'date' })}
            {labelInput('Number planted', plantingForm.plantedCount, (e) => setPlantingForm({ ...plantingForm, plantedCount: e.target.value }), { required: true, type: 'number', min: 1, step: 1 })}
            {labelInput('Spacing (optional)', plantingForm.spacing, (e) => setPlantingForm({ ...plantingForm, spacing: e.target.value }), { placeholder: 'e.g. 8 m × 8 m' })}
            <div className="sm:col-span-2 xl:col-span-5">{submitButton('Add planting group')}</div>
          </form>
          {plantings.length > 0 && <form onSubmit={addSurvivalCheck} className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-2 xl:grid-cols-4">
            <label className="block text-sm font-medium text-gray-700">Planting group<select required value={survivalForm.plantingId} onChange={(e) => setSurvivalForm({ ...survivalForm, plantingId: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"><option value="">Choose a group</option>{plantings.map((planting) => <option key={planting.id} value={planting.id}>{planting.species} · {planting.block} · {planting.plantedCount} planted</option>)}</select></label>
            {labelInput('Check date', survivalForm.checkedOn, (e) => setSurvivalForm({ ...survivalForm, checkedOn: e.target.value }), { required: true, type: 'date' })}
            {labelInput('Trees alive', survivalForm.survivingCount, (e) => setSurvivalForm({ ...survivalForm, survivingCount: e.target.value }), { required: true, type: 'number', min: 0, step: 1, max: plantings.find((planting) => planting.id === survivalForm.plantingId)?.plantedCount })}
            {labelInput('Field notes', survivalForm.note, (e) => setSurvivalForm({ ...survivalForm, note: e.target.value }), { placeholder: 'Optional' })}
            <div className="sm:col-span-2 xl:col-span-4">{submitButton('Save survival check')}</div>
          </form>}
          {plantings.length ? <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-600"><tr><th className="px-4 py-3">Species / block</th><th className="px-4 py-3">Planted</th><th className="px-4 py-3">Last count</th><th className="px-4 py-3">Survival</th></tr></thead><tbody className="divide-y divide-gray-200">{plantings.map((planting) => { const check = newestSurvival(planting); const rate = check ? Math.round((check.survivingCount / planting.plantedCount) * 100) : null; return <tr key={planting.id}><td className="px-4 py-3 font-semibold text-gray-950">{planting.species}<span className="block font-normal text-gray-600">{planting.block}{planting.spacing ? ` · ${planting.spacing}` : ''}</span></td><td className="px-4 py-3">{planting.plantedCount}<span className="block text-xs text-gray-500">{displayDate(planting.plantedOn)}</span></td><td className="px-4 py-3">{check ? `${check.survivingCount} alive` : 'Not checked'}{check && <span className="block text-xs text-gray-500">{displayDate(check.checkedOn)}</span>}</td><td className="px-4 py-3">{rate === null ? '—' : `${rate}%`}</td></tr>; })}</tbody></table></div> : <p className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-600">Add Shea, cocoa shade, Baobab or other planting groups to begin survival tracking.</p>}
        </section>}

        {activeTab === 'guidance' && <section className="space-y-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold text-gray-950">Legumes between tree rows</h2><p className="text-sm text-gray-600">A practical checklist for establishing nitrogen-fixing plants in agroforestry plots.</p></div><button type="button" onClick={readGuidance} className="inline-flex items-center gap-2 rounded-md border border-emerald-800 px-3 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-50" aria-label={speaking ? 'Stop voice guidance' : 'Read guidance aloud'}>{speaking ? <MicOff size={16} aria-hidden="true" /> : <Volume2 size={16} aria-hidden="true" />}{speaking ? 'Stop reading' : 'Read aloud'}</button></div>
          <ol className="divide-y divide-gray-200 border-y border-gray-200 bg-white">{legumeSteps.map((step, index) => <li key={step.title} className="flex gap-4 py-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-900">{index + 1}</span><div><h3 className="font-semibold text-gray-900">{step.title}</h3><p className="mt-1 text-sm leading-6 text-gray-700">{step.detail}</p></div></li>)}</ol>
          <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Species suitability, spacing and pruning schedules depend on local conditions. Confirm choices with a local extension officer before planting.</p>
        </section>}

        {activeTab === 'ntfp' && <section className="space-y-5"><header><h2 className="text-lg font-semibold text-gray-950">Seasonal non-timber forest product reminders</h2><p className="text-sm text-gray-600">Schedule Shea nut collection or sustainable medicinal bark checks for a specific block.</p></header>
          <form onSubmit={addNtfpReminder} className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-2 xl:grid-cols-4">{selectInput('Activity', ntfpForm.activity, (e) => setNtfpForm({ ...ntfpForm, activity: e.target.value }), ntfpOptions)}{labelInput('Reminder date', ntfpForm.dueDate, (e) => setNtfpForm({ ...ntfpForm, dueDate: e.target.value }), { required: true, type: 'date' })}{labelInput('Block / location', ntfpForm.block, (e) => setNtfpForm({ ...ntfpForm, block: e.target.value }), { required: true, placeholder: 'e.g. Shea grove' })}{labelInput('Sustainable harvest note', ntfpForm.guidance, (e) => setNtfpForm({ ...ntfpForm, guidance: e.target.value }), { placeholder: 'Optional' })}<div className="sm:col-span-2 xl:col-span-4">{submitButton('Set reminder')}</div></form>
          <div className="space-y-2">{reminders.filter((reminder) => reminder.status !== 'completed' || !records.some((record) => record.type === 'ntfpReminder' && record.status === 'completed' && record.reminderId === reminder.id)).map((reminder) => { const due = reminder.dueDate < new Date().toISOString().slice(0, 10); return <article key={reminder.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-gray-200 bg-white p-4"><div><span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${due ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'}`}>{due ? 'Due' : 'Scheduled'}</span><h3 className="mt-1 text-sm font-semibold text-gray-950">{reminder.activity}</h3><p className="text-sm text-gray-600">{reminder.block} · {displayDate(reminder.dueDate)}</p>{reminder.guidance && <p className="mt-1 text-sm text-gray-600">{reminder.guidance}</p>}</div><button type="button" onClick={() => completeReminder(reminder)} disabled={saving} className="inline-flex items-center gap-1 rounded border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"><Check size={15} aria-hidden="true" />Mark done</button></article>; })}{!reminders.length && <p className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-600">No harvest reminders scheduled.</p>}</div>
          <p className="text-xs text-gray-500">These are in-app reminders, not background push notifications. Harvest only in the locally permitted season and use sustainable methods approved for your area.</p>
        </section>}

        {activeTab === 'erosion' && <section className="space-y-5"><header><h2 className="text-lg font-semibold text-gray-950">Rainfall and erosion check</h2><p className="text-sm text-gray-600">Use your current location to check local rainfall and flag exposed or sloping ground before heavy rain.</p></header>
          <form onSubmit={runRainfallCheck} className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-2 xl:grid-cols-4">{selectInput('Region fallback', erosionForm.region, (e) => setErosionForm({ ...erosionForm, region: e.target.value }), regions)}{labelInput('Block / slope location', erosionForm.block, (e) => setErosionForm({ ...erosionForm, block: e.target.value }), { placeholder: 'e.g. Upper east field' })}{selectInput('Slope', erosionForm.slope, (e) => setErosionForm({ ...erosionForm, slope: e.target.value }), ['Gentle', 'Moderate', 'Steep'])}{selectInput('Ground cover', erosionForm.groundCover, (e) => setErosionForm({ ...erosionForm, groundCover: e.target.value }), ['Covered', 'Partly covered', 'Bare soil'])}<div className="flex flex-wrap gap-3 sm:col-span-2 xl:col-span-4"><button type="button" onClick={checkCurrentLocation} disabled={saving} className="inline-flex items-center gap-2 rounded-md bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-900 disabled:opacity-60"><TreePine size={16} aria-hidden="true" />{saving ? 'Checking location…' : 'Use current location & check'}</button><button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60"><AlertTriangle size={16} aria-hidden="true" />Check selected region</button></div><p className="text-xs text-gray-500 sm:col-span-2 xl:col-span-4">GPS permission is requested only when you choose the current-location check. If unavailable, select your region and use the fallback check.</p></form>
          {forecastCheck && <article className={`rounded-lg border p-4 ${forecastCheck.flaggedDays.length && (forecastCheck.slope === 'Steep' || forecastCheck.groundCover === 'Bare soil') ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-white'}`}><div className="flex items-start gap-3"><TreePine className="mt-1 text-emerald-800" size={20} aria-hidden="true" /><div className="min-w-0 flex-1"><h3 className="font-semibold text-gray-950">{forecastCheck.priority}</h3><p className="mt-1 text-sm text-gray-600">{forecastCheck.location}{forecastCheck.block ? ` · ${forecastCheck.block}` : ''} · checked {displayDate(forecastCheck.checkedAt)}</p>{forecastCheck.locationSource === 'gps' && <p className="mt-1 text-xs text-gray-500">GPS {forecastCheck.latitude.toFixed(5)}, {forecastCheck.longitude.toFixed(5)}</p>}<ul className="mt-3 space-y-1 text-sm text-gray-800">{forecastCheck.recommendations.map((recommendation) => <li key={recommendation}>• {recommendation}</li>)}</ul><div className="mt-3 flex flex-wrap gap-2">{forecastCheck.forecast.map((day) => <span key={`${day.day}-${day.date}`} className={`rounded border px-2 py-1 text-xs ${day.rain >= 20 || day.condition.toLowerCase().includes('thunder') ? 'border-amber-300 bg-white font-semibold text-amber-900' : 'border-gray-200 bg-white text-gray-700'}`}>{day.day} · {day.rain} mm</span>)}</div></div></div></article>}
          <p className="text-xs text-gray-500">Forecasts can change and do not replace official local warnings or field inspection. The rainfall flag uses 20 mm/day or thunderstorm conditions as a screening threshold, not a formal hazard warning.</p>
          {records.filter((record) => record.type === 'erosionCheck').length > 0 && <section className="space-y-2"><h3 className="text-base font-semibold text-gray-900">Past checks</h3>{records.filter((record) => record.type === 'erosionCheck').map((record) => <article key={record.id} className="rounded-md border border-gray-200 bg-white p-4 text-sm"><strong>{record.priority}</strong><p className="text-gray-600">{record.region} · {record.block || 'No block specified'} · {displayDate(record.checkedAt)}</p></article>)}</section>}
        </section>}
      </>}
    </main>
  );
};

export default ForestryDashboard;