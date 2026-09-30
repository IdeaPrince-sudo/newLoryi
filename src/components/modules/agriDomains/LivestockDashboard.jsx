import React, { useEffect, useMemo, useState } from 'react';
import { Activity, Baby, CalendarDays, HeartPulse, MapPin, PawPrint, Plus, Syringe, Wheat } from 'lucide-react';
import { api } from '../../../lib/api';
import RecordInsights from './RecordInsights';
import LivestockMonitoring from './LivestockMonitoring';

const sections = [
  { id: 'herd', label: 'Herd', icon: PawPrint },
  { id: 'feed', label: 'Feed plan', icon: Wheat },
  { id: 'vaccinations', label: 'Vaccinations', icon: Syringe },
  { id: 'health', label: 'Symptom triage', icon: HeartPulse },
  { id: 'breeding', label: 'Breeding', icon: Baby },
  { id: 'monitoring', label: 'Sensors & tracking', icon: Activity },
];

const gestationDays = { Cattle: 283, Goat: 150, Sheep: 147, Pig: 114, Poultry: 21 };
const feedCosts = { cassavaPeels: 1, groundnutHaulms: 2.5, forage: 0.8, maizeBran: 2.2, mineralMix: 6 };

const dateAfterDays = (date, days) => {
  if (!date) return '';
  const result = new Date(`${date}T12:00:00`);
  result.setDate(result.getDate() + days);
  return result.toISOString().slice(0, 10);
};

const displayDate = (date) => date
  ? new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
  : 'Not recorded';

const triageGuidance = (symptoms) => {
  const text = symptoms.toLowerCase();
  const urgent = /cannot stand|unable to stand|severe breathing|difficulty breathing|bloated|bloat|bleeding heavily|seizure|unable to urinate/.test(text);
  if (urgent) {
    return {
      urgency: 'Urgent veterinary help',
      advice: 'Contact a veterinarian or livestock officer now. Keep the animal calm and separated from the herd if safe. Do not force-feed or give human medicines.',
    };
  }
  if (/udder|milk|mastitis/.test(text)) {
    return {
      urgency: 'Arrange a same-day veterinary check',
      advice: 'A swollen or painful udder can indicate infection. Keep the animal clean, note changes in milk and appetite, and ask a veterinarian before using medicines or selling the milk.',
    };
  }
  if (/appetite|eating|feed|not eating|off-feed/.test(text)) {
    return {
      urgency: 'Monitor closely and contact an animal-health worker',
      advice: 'Offer clean water and the usual feed, keep the animal in a quiet place, and note when it last ate and passed dung. Seek help promptly if it worsens or does not improve.',
    };
  }
  return {
    urgency: 'Observe and seek local advice',
    advice: 'Keep clean water available, reduce stress, and record when the signs began. Contact a veterinarian or livestock officer for assessment, especially if signs worsen or affect more animals.',
  };
};

const emptyFeed = {
  cassavaPeels: '0',
  groundnutHaulms: '0',
  forage: '0',
  maizeBran: '0',
  mineralMix: '0',
};

const LivestockDashboard = () => {
  const [records, setRecords] = useState([]);
  const [activeSection, setActiveSection] = useState('herd');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [animalForm, setAnimalForm] = useState({ tag: '', name: '', species: 'Cattle', breed: '', sex: 'Female', dateOfBirth: '', location: '' });
  const [feedForm, setFeedForm] = useState({ animalTag: '', stage: 'Adult maintenance', ...emptyFeed });
  const [vaccineForm, setVaccineForm] = useState({ animalTag: '', vaccine: '', dueDate: '' });
  const [healthForm, setHealthForm] = useState({ animalTag: '', symptoms: '' });
  const [breedingForm, setBreedingForm] = useState({ animalTag: '', sire: '', matingDate: '', birthDate: '', birthWeightKg: '' });

  const captureAnimalFormLocation = () => {
    setError('');
    setNotice('');
    if (!navigator.geolocation) {
      setError('Location capture is not available in this browser. You can enter a pen or location manually.');
      return;
    }
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      setAnimalForm((current) => ({
        ...current,
        location: `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`,
        latitude: coords.latitude,
        longitude: coords.longitude,
      }));
      setNotice('Current GPS location added to this animal record.');
    }, () => setError('Could not read your location. Allow browser location access or enter a pen manually.'), { enableHighAccuracy: true, timeout: 10000 });
  };

  useEffect(() => {
    api.moduleRecords('livestock')
      .then(setRecords)
      .catch((requestError) => setError(requestError.message || 'Could not load livestock records.'))
      .finally(() => setLoading(false));
  }, []);

  const animals = useMemo(() => records.filter((record) => record.type === 'animal'), [records]);
  const completedVaccinations = useMemo(() => new Set(records.filter((record) => record.type === 'vaccination' && record.status === 'completed').map((record) => record.scheduleId)), [records]);
  const vaccinations = useMemo(() => records.filter((record) => record.type === 'vaccination' && record.status !== 'completed' && !completedVaccinations.has(record.id)), [records, completedVaccinations]);
  const triageRecords = useMemo(() => records.filter((record) => record.type === 'triage'), [records]);
  const feedRecords = useMemo(() => records.filter((record) => record.type === 'feed'), [records]);
  const breedingRecords = useMemo(() => records.filter((record) => record.type === 'breeding'), [records]);
  const today = new Date().toISOString().slice(0, 10);
  const twoWeeksFromNow = dateAfterDays(today, 14);
  const overdueVaccinations = vaccinations.filter((record) => record.dueDate && record.dueDate < today).length;
  const upcomingVaccinations = vaccinations.filter((record) => record.dueDate >= today && record.dueDate <= twoWeeksFromNow).length;
  const urgentTriageCount = triageRecords.filter((record) => /urgent|same-day/i.test(record.urgency || '')).length;
  const livestockInsights = [];
  if (animals.length) {
    const speciesCounts = [...new Set(animals.map((animal) => animal.species))];
    livestockInsights.push(`${animals.length} tagged animal${animals.length === 1 ? '' : 's'} recorded across ${speciesCounts.join(', ')}.`);
  }
  if (overdueVaccinations) livestockInsights.push(`${overdueVaccinations} vaccination or care schedule${overdueVaccinations === 1 ? '' : 's'} is past its due date.`);
  else if (upcomingVaccinations) livestockInsights.push(`${upcomingVaccinations} vaccination or care schedule${upcomingVaccinations === 1 ? '' : 's'} is due within 14 days.`);
  if (urgentTriageCount) livestockInsights.push(`${urgentTriageCount} saved health note${urgentTriageCount === 1 ? '' : 's'} was flagged for urgent or same-day professional attention.`);
  if (!livestockInsights.length && (feedRecords.length || breedingRecords.length)) livestockInsights.push(`${feedRecords.length} feed plan${feedRecords.length === 1 ? '' : 's'} and ${breedingRecords.length} breeding record${breedingRecords.length === 1 ? '' : 's'} saved.`);
  const feedMix = Object.entries(feedForm).filter(([key]) => key in feedCosts);
  const feedTotal = feedMix.reduce((sum, [, amount]) => sum + (Number(amount) || 0), 0);
  const feedCost = feedMix.reduce((sum, [ingredient, amount]) => sum + (Number(amount) || 0) * feedCosts[ingredient], 0);
  const matingAnimal = animals.find((animal) => animal.tag === breedingForm.animalTag);
  const expectedDueDate = breedingForm.matingDate
    ? dateAfterDays(breedingForm.matingDate, gestationDays[matingAnimal?.species] || 150)
    : '';

  const saveRecord = async (record) => {
    setError('');
    setNotice('');
    setSaving(true);
    try {
      const saved = await api.createModuleRecord('livestock', record);
      setRecords((current) => [saved, ...current]);
      setNotice('Livestock record saved.');
      return saved;
    } catch (requestError) {
      setError(requestError.message || 'Could not save this record. Check your connection and try again.');
      return null;
    } finally {
      setSaving(false);
    }
  };

  const addAnimal = async (event) => {
    event.preventDefault();
    const saved = await saveRecord({ type: 'animal', ...animalForm });
    if (saved) setAnimalForm({ tag: '', name: '', species: 'Cattle', breed: '', sex: 'Female', dateOfBirth: '', location: '' });
  };

  const captureLocation = (animal) => {
    setError('');
    setNotice('');
    if (!navigator.geolocation) {
      setError('Location capture is not available in this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const point = `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`;
      const saved = await saveRecord({
        type: 'location',
        animalTag: animal.tag,
        location: point,
        latitude: coords.latitude,
        longitude: coords.longitude,
        recordedAt: new Date().toISOString(),
      });
      if (saved) setNotice(`Location recorded for ${animal.name || animal.tag}.`);
    }, () => setError('Could not read your location. Allow location access and try again.'), { enableHighAccuracy: true, timeout: 10000 });
  };

  const addFeedPlan = async (event) => {
    event.preventDefault();
    const ingredients = Object.fromEntries(feedMix.map(([key, value]) => [key, Number(value) || 0]));
    const saved = await saveRecord({ type: 'feed', ...feedForm, ingredients, totalKgPerDay: feedTotal, estimatedCostPerDay: feedCost });
    if (saved) setFeedForm({ animalTag: '', stage: 'Adult maintenance', ...emptyFeed });
  };

  const addVaccination = async (event) => {
    event.preventDefault();
    const saved = await saveRecord({ type: 'vaccination', ...vaccineForm, status: 'scheduled' });
    if (saved) setVaccineForm({ animalTag: '', vaccine: '', dueDate: '' });
  };

  const markVaccinationDone = async (schedule) => {
    await saveRecord({
      type: 'vaccination',
      status: 'completed',
      scheduleId: schedule.id,
      animalTag: schedule.animalTag,
      vaccine: schedule.vaccine,
      administeredDate: new Date().toISOString().slice(0, 10),
    });
  };

  const submitTriage = async (event) => {
    event.preventDefault();
    const animal = animals.find((item) => item.tag === healthForm.animalTag);
    let guidance;
    setError('');
    setNotice('');
    setSaving(true);
    try {
      guidance = await api.livestockTriage({ species: animal?.species || 'Unknown livestock', symptoms: healthForm.symptoms });
    } catch {
      guidance = { ...triageGuidance(healthForm.symptoms), provider: 'local-fallback', aiAvailable: false };
    } finally {
      setSaving(false);
    }
    const saved = await saveRecord({ type: 'triage', ...healthForm, ...guidance, species: animal?.species, reportedAt: new Date().toISOString() });
    if (saved) setNotice(saved.aiAvailable ? 'AI symptom guidance generated and saved.' : 'AI is unavailable; conservative fallback guidance saved.');
    if (saved) setHealthForm({ animalTag: '', symptoms: '' });
  };

  const saveBreeding = async (event) => {
    event.preventDefault();
    const saved = await saveRecord({
      type: 'breeding',
      ...breedingForm,
      expectedDueDate,
      birthWeightKg: breedingForm.birthWeightKg ? Number(breedingForm.birthWeightKg) : null,
    });
    if (saved) setBreedingForm({ animalTag: '', sire: '', matingDate: '', birthDate: '', birthWeightKg: '' });
  };

  const animalSelect = (value, onChange, label = 'Animal') => (
    <label className="block text-sm font-medium text-gray-700">
      {label}
      <select required value={value} onChange={onChange} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
        <option value="">Choose an animal</option>
        {animals.map((animal) => <option key={animal.id} value={animal.tag}>{animal.name || animal.tag} · {animal.species}</option>)}
      </select>
    </label>
  );

  const textField = (label, value, onChange, options = {}) => (
    <label className="block text-sm font-medium text-gray-700">
      {label}
      <input {...options} value={value} onChange={onChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
    </label>
  );

  const submitButton = (label) => (
    <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-md bg-amber-700 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-800 disabled:opacity-60">
      <Plus size={16} aria-hidden="true" />{saving ? 'Saving…' : label}
    </button>
  );

  const latestLocation = (animal) => records.find((record) => record.type === 'location' && record.animalTag === animal.tag);

  return (
    <main className="space-y-5">
      <header className="flex flex-col justify-between gap-4 rounded-lg border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase text-amber-800">Farm management / livestock</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-950">Herd management</h1>
          <p className="mt-1 text-sm text-gray-700">Animal records, care schedules and practical herd decisions.</p>
        </div>
        <div className="flex gap-5 text-sm">
          <div><span className="block text-gray-600">Animals</span><strong className="text-xl text-gray-950">{animals.length}</strong></div>
          <div><span className="block text-gray-600">Upcoming care</span><strong className="text-xl text-gray-950">{vaccinations.length}</strong></div>
        </div>
      </header>

      {(error || notice) && <div role={error ? 'alert' : 'status'} className={`rounded-md border px-4 py-3 text-sm ${error ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>{error || notice}</div>}

      <nav aria-label="Livestock management" className="flex gap-1 overflow-x-auto border-b border-gray-300">
        {sections.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" onClick={() => setActiveSection(id)} aria-current={activeSection === id ? 'page' : undefined} className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium ${activeSection === id ? 'border-amber-700 text-amber-900' : 'border-transparent text-gray-600 hover:text-gray-950'}`}>
            <Icon size={17} aria-hidden="true" />{label}
          </button>
        ))}
      </nav>

      {!loading && <RecordInsights items={livestockInsights} emptyMessage="Add animal, care, feed or breeding records to see herd insights." />}

      {loading ? <p className="py-10 text-center text-sm text-gray-600">Loading your herd records…</p> : (
        <>
          {activeSection === 'herd' && <section className="space-y-5" aria-labelledby="herd-heading">
            <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 id="herd-heading" className="text-lg font-semibold text-gray-950">Your animals</h2><p className="text-sm text-gray-600">Each animal is identified by a unique tag.</p></div></div>
            <form onSubmit={addAnimal} className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-2 xl:grid-cols-4">
              {textField('Animal tag / ID', animalForm.tag, (e) => setAnimalForm({ ...animalForm, tag: e.target.value }), { required: true, placeholder: 'e.g. C-001' })}
              {textField('Animal name', animalForm.name, (e) => setAnimalForm({ ...animalForm, name: e.target.value }), { placeholder: 'Optional' })}
              <label className="block text-sm font-medium text-gray-700">Species<select value={animalForm.species} onChange={(e) => setAnimalForm({ ...animalForm, species: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">{Object.keys(gestationDays).map((species) => <option key={species}>{species}</option>)}<option>Other</option></select></label>
              {textField('Breed', animalForm.breed, (e) => setAnimalForm({ ...animalForm, breed: e.target.value }), { placeholder: 'Optional' })}
              <label className="block text-sm font-medium text-gray-700">Sex<select value={animalForm.sex} onChange={(e) => setAnimalForm({ ...animalForm, sex: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"><option>Female</option><option>Male</option></select></label>
              {textField('Date of birth', animalForm.dateOfBirth, (e) => setAnimalForm({ ...animalForm, dateOfBirth: e.target.value }), { type: 'date' })}
              <div className="block text-sm font-medium text-gray-700">
                <label htmlFor="animal-location">Current location / pen</label>
                <div className="mt-1 flex gap-2">
                  <input id="animal-location" value={animalForm.location} onChange={(e) => setAnimalForm({ ...animalForm, location: e.target.value, latitude: undefined, longitude: undefined })} placeholder="e.g. North field pen" className="block min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm" />
                  <button type="button" onClick={captureAnimalFormLocation} className="shrink-0 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50">Use current location</button>
                </div>
              </div>
              <div className="flex items-end">{submitButton('Add animal')}</div>
            </form>
            {animals.length ? <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-600"><tr><th className="px-4 py-3">Animal</th><th className="px-4 py-3">Species / breed</th><th className="px-4 py-3">Sex / born</th><th className="px-4 py-3">Last location</th><th className="px-4 py-3">Track</th></tr></thead><tbody className="divide-y divide-gray-200">{animals.map((animal) => { const location = latestLocation(animal); return <tr key={animal.id}><td className="px-4 py-3 font-semibold text-gray-950">{animal.name || animal.tag}<span className="block text-xs font-normal text-gray-500">{animal.tag}</span></td><td className="px-4 py-3 text-gray-700">{animal.species}{animal.breed ? ` · ${animal.breed}` : ''}</td><td className="px-4 py-3 text-gray-700">{animal.sex}<span className="block text-xs text-gray-500">{displayDate(animal.dateOfBirth)}</span></td><td className="px-4 py-3 text-gray-700">{location?.location || animal.location || 'Not recorded'}{location?.recordedAt && <span className="block text-xs text-gray-500">{displayDate(location.recordedAt.slice(0, 10))}</span>}</td><td className="px-4 py-3"><button type="button" onClick={() => captureLocation(animal)} className="inline-flex items-center gap-1 rounded border border-gray-300 px-2 py-1.5 text-xs font-medium hover:bg-gray-50"><MapPin size={14} aria-hidden="true" />Update GPS</button>{location?.latitude && <a className="ml-2 text-xs text-blue-700 underline" href={`https://maps.google.com/?q=${location.latitude},${location.longitude}`} target="_blank" rel="noreferrer">Map</a>}</td></tr>; })}</tbody></table></div> : <p className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-600">Add your first animal to begin tracking the herd.</p>}
          </section>}

          {activeSection === 'feed' && <section className="space-y-5"><header><h2 className="text-lg font-semibold text-gray-950">Daily feed ration</h2><p className="text-sm text-gray-600">Record an affordable mix by ingredient and animal stage.</p></header>
            <form onSubmit={addFeedPlan} className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{animalSelect(feedForm.animalTag, (e) => setFeedForm({ ...feedForm, animalTag: e.target.value }))}<label className="block text-sm font-medium text-gray-700">Nutrition stage<select value={feedForm.stage} onChange={(e) => setFeedForm({ ...feedForm, stage: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">{['Growing', 'Adult maintenance', 'Pregnant', 'Lactating', 'Recovery'].map((stage) => <option key={stage}>{stage}</option>)}</select></label></div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">{feedMix.map(([ingredient, amount]) => <label key={ingredient} className="block text-sm font-medium capitalize text-gray-700">{ingredient.replace(/([A-Z])/g, ' $1')} (kg/day)<input type="number" min="0" step="0.1" value={amount} onChange={(e) => setFeedForm({ ...feedForm, [ingredient]: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" /></label>)}</div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-4"><p className="text-sm text-gray-700">Mix total: <strong>{feedTotal.toFixed(1)} kg/day</strong><span className="mx-2 text-gray-400">|</span>Estimated cost: <strong>GH₵{feedCost.toFixed(2)}/day</strong></p>{submitButton('Save feed plan')}</div>
              <p className="text-xs text-gray-500">Cost uses indicative ingredient prices (GH₵/kg). Confirm local prices and have a livestock nutritionist verify the ration for your animals.</p>
            </form>
            <RecordList records={records.filter((record) => record.type === 'feed')} title="Saved feed plans" render={(record) => <><strong>{record.animalTag}</strong> · {record.stage} · {record.totalKgPerDay} kg/day · GH₵{Number(record.estimatedCostPerDay || 0).toFixed(2)}/day</>} />
          </section>}

          {activeSection === 'vaccinations' && <section className="space-y-5"><header><h2 className="text-lg font-semibold text-gray-950">Vaccination schedule</h2><p className="text-sm text-gray-600">Schedule care and record doses when they are given.</p></header>
            <form onSubmit={addVaccination} className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-2 xl:grid-cols-4">{animalSelect(vaccineForm.animalTag, (e) => setVaccineForm({ ...vaccineForm, animalTag: e.target.value }))}{textField('Vaccine / care', vaccineForm.vaccine, (e) => setVaccineForm({ ...vaccineForm, vaccine: e.target.value }), { required: true, placeholder: 'e.g. Deworming' })}{textField('Due date', vaccineForm.dueDate, (e) => setVaccineForm({ ...vaccineForm, dueDate: e.target.value }), { required: true, type: 'date' })}<div className="flex items-end">{submitButton('Schedule')}</div></form>
            <div className="space-y-2">{vaccinations.map((schedule) => { const completed = records.some((record) => record.type === 'vaccination' && record.status === 'completed' && record.scheduleId === schedule.id); return <div key={schedule.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-gray-200 bg-white p-4"><div><strong className="text-sm text-gray-950">{schedule.vaccine}</strong><p className="text-sm text-gray-600">{schedule.animalTag} · Due {displayDate(schedule.dueDate)}</p></div>{completed ? <span className="text-sm font-semibold text-emerald-700">Given</span> : <button type="button" onClick={() => markVaccinationDone(schedule)} disabled={saving} className="rounded border border-emerald-700 px-3 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-50">Mark given</button>}</div>; })}{!vaccinations.length && <p className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-600">No upcoming vaccinations scheduled.</p>}</div>
          </section>}

          {activeSection === 'health' && <section className="space-y-5"><header><h2 className="text-lg font-semibold text-gray-950">Describe a health concern</h2><p className="text-sm text-gray-600">AI-supported first-response guidance for your animal, with urgent signs escalated to veterinary care.</p></header>
            <form onSubmit={submitTriage} className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">{animalSelect(healthForm.animalTag, (e) => setHealthForm({ ...healthForm, animalTag: e.target.value }))}<label className="block text-sm font-medium text-gray-700">Symptoms<textarea required minLength={4} maxLength={1200} rows={4} value={healthForm.symptoms} onChange={(e) => setHealthForm({ ...healthForm, symptoms: e.target.value })} placeholder="For example: swollen udder since yesterday, eating less than usual" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" /></label>{submitButton('Get AI triage guidance')}<p className="text-xs text-gray-500">Guidance is not a diagnosis or a substitute for a veterinarian. Do not give medicines without professional advice. When server AI is unavailable, the page uses conservative fallback guidance.</p></form>
            <RecordList records={triageRecords} title="Health notes" render={(record) => <><strong>{record.animalTag} · {record.urgency}</strong><span className={`ml-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${record.aiAvailable ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-900'}`}>{record.aiAvailable ? `AI${record.model ? ` · ${record.model}` : ''}` : 'Rule-based fallback'}</span><p className="mt-1 text-gray-600">Reported: {record.symptoms}</p><p className="mt-1">{record.advice}</p></>} />
          </section>}

          {activeSection === 'breeding' && <section className="space-y-5"><header><h2 className="text-lg font-semibold text-gray-950">Breeding and birth records</h2><p className="text-sm text-gray-600">Log mating dates, estimated due dates and newborn weights.</p></header>
            <form onSubmit={saveBreeding} className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-2 xl:grid-cols-3">{animalSelect(breedingForm.animalTag, (e) => setBreedingForm({ ...breedingForm, animalTag: e.target.value }), 'Dam / animal')}{textField('Sire', breedingForm.sire, (e) => setBreedingForm({ ...breedingForm, sire: e.target.value }), { placeholder: 'Name or tag' })}{textField('Mating date', breedingForm.matingDate, (e) => setBreedingForm({ ...breedingForm, matingDate: e.target.value }), { type: 'date' })}<label className="block text-sm font-medium text-gray-700">Expected due date<input readOnly value={expectedDueDate} className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm" /></label>{textField('Birth date (when born)', breedingForm.birthDate, (e) => setBreedingForm({ ...breedingForm, birthDate: e.target.value }), { type: 'date' })}{textField('Birth weight (kg)', breedingForm.birthWeightKg, (e) => setBreedingForm({ ...breedingForm, birthWeightKg: e.target.value }), { type: 'number', min: '0', step: '0.01', placeholder: 'Optional' })}<div className="sm:col-span-2 xl:col-span-3">{submitButton('Save breeding record')}</div></form>
            <RecordList records={records.filter((record) => record.type === 'breeding')} title="Breeding history" render={(record) => <><strong>{record.animalTag}</strong>{record.sire ? ` · Sire: ${record.sire}` : ''}<p className="mt-1 text-gray-600">Mated: {displayDate(record.matingDate)} · Expected: {displayDate(record.expectedDueDate)}</p>{record.birthDate && <p className="mt-1 text-gray-600">Born: {displayDate(record.birthDate)} · Birth weight: {record.birthWeightKg ? `${record.birthWeightKg} kg` : 'Not recorded'}</p>}</>} />
          </section>}

          {activeSection === 'monitoring' && <LivestockMonitoring animals={animals} records={records} saveRecord={saveRecord} />}
        </>
      )}
    </main>
  );
};

const RecordList = ({ records, title, render }) => (
  <section className="space-y-2"><h3 className="text-base font-semibold text-gray-900">{title}</h3>{records.length ? records.map((record) => <article key={record.id} className="rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-800">{render(record)}</article>) : <p className="rounded-lg border border-dashed border-gray-300 bg-white p-5 text-sm text-gray-600">No records yet.</p>}</section>
);

export default LivestockDashboard;