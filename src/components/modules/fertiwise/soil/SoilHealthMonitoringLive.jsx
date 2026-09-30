import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, AlertCircle, MapPin, RefreshCw, Sprout } from 'lucide-react';
import { Cell, Legend, Pie, PieChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useAuth } from '../../../../contexts/AuthContext';
import { api } from '../../../../lib/api';
import { loadFarmProfiles } from '../../geoSense/farmSoilStore';

const emptyForm = {
  soilType: '',
  pH: '',
  moisture: '',
  nitrogen: '',
  phosphorus: '',
  potassium: '',
  organicMatter: '',
  zinc: '',
  iron: '',
  manganese: '',
  copper: '',
};

const toDisplayNumber = (value) => value === '' || value === null || value === undefined || !Number.isFinite(Number(value)) ? null : Number(value);
const formatDate = (value) => {
  if (!value) return 'Date not recorded';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date not recorded' : date.toLocaleString();
};

const normalizeSoilData = (farm, tests) => {
  const latestTest = tests
    .filter((test) => String(test.farmId) === String(farm.id))
    .sort((first, second) => new Date(second.testedAt || second.createdAt || 0) - new Date(first.testedAt || first.createdAt || 0))[0]
    || farm.latestSoilTest
    || null;
  const testData = latestTest?.soilData || latestTest || {};
  const micronutrients = testData.micronutrients || {};
  const firstValue = (...values) => values.find((value) => value !== undefined && value !== null && value !== '');

  return {
    farm,
    latestTest,
    soilType: firstValue(testData.soilType, farm.soilType),
    pH: toDisplayNumber(firstValue(testData.pH, farm.pH)),
    moisture: toDisplayNumber(firstValue(testData.moisture, farm.moisture)),
    organicMatter: toDisplayNumber(firstValue(testData.organicMatter, farm.organicMatter)),
    nitrogen: toDisplayNumber(firstValue(testData.nitrogen, testData.N, testData.nutrients?.N, farm.N)),
    phosphorus: toDisplayNumber(firstValue(testData.phosphorus, testData.P, testData.nutrients?.P, farm.P)),
    potassium: toDisplayNumber(firstValue(testData.potassium, testData.K, testData.nutrients?.K, farm.K)),
    zinc: toDisplayNumber(firstValue(testData.zinc, micronutrients.zinc, micronutrients.Zn)),
    iron: toDisplayNumber(firstValue(testData.iron, micronutrients.iron, micronutrients.Fe)),
    manganese: toDisplayNumber(firstValue(testData.manganese, micronutrients.manganese, micronutrients.Mn)),
    copper: toDisplayNumber(firstValue(testData.copper, micronutrients.copper, micronutrients.Cu)),
    testedAt: latestTest?.testedAt || latestTest?.createdAt || farm.updatedAt || farm.createdAt,
  };
};

const SoilHealthMonitoringLive = () => {
  const { currentUser } = useAuth();
  const [farms, setFarms] = useState([]);
  const [soilTests, setSoilTests] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadSoilRecords = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [farmProfiles, tests] = await Promise.all([api.geoSenseFarms(), api.soilTests()]);
      const ownFarms = farmProfiles.filter((farm) => farm.ownerId === currentUser?.id || farm.farmerId === currentUser?.id);
      setFarms(ownFarms);
      setSoilTests(tests.filter((test) => test.ownerId === currentUser?.id));
      setSelectedFarmId((currentId) => ownFarms.some((farm) => String(farm.id) === currentId)
        ? currentId
        : ownFarms.length === 1 ? String(ownFarms[0].id) : '');
    } catch (requestError) {
      const cachedFarms = loadFarmProfiles().filter((farm) => farm.ownerId === currentUser?.id || farm.farmerId === currentUser?.id);
      setFarms(cachedFarms);
      setSoilTests([]);
      setSelectedFarmId((currentId) => cachedFarms.some((farm) => String(farm.id) === currentId)
        ? currentId
        : cachedFarms.length === 1 ? String(cachedFarms[0].id) : '');
      setError(`${requestError.message || 'Live farm soil data could not be loaded.'}${cachedFarms.length ? ' Showing cached farm profiles; reconnect to load soil-test history.' : ''}`);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    loadSoilRecords();
  }, [loadSoilRecords]);

  const selectedFarm = farms.find((farm) => String(farm.id) === selectedFarmId);
  const selectedFarmerData = useMemo(
    () => selectedFarm ? normalizeSoilData(selectedFarm, soilTests) : null,
    [selectedFarm, soilTests],
  );
  const hasSoilValues = selectedFarmerData && [
    selectedFarmerData.pH,
    selectedFarmerData.moisture,
    selectedFarmerData.organicMatter,
    selectedFarmerData.nitrogen,
    selectedFarmerData.phosphorus,
    selectedFarmerData.potassium,
  ].some((value) => value !== null);
  const phLevelData = selectedFarmerData?.pH === null || selectedFarmerData?.pH === undefined
    ? []
    : [{
      name: selectedFarmerData.pH < 6.5 ? 'Acidic' : selectedFarmerData.pH <= 7.5 ? 'Neutral' : 'Alkaline',
      value: 1,
      color: selectedFarmerData.pH < 6.5 ? '#ef4444' : selectedFarmerData.pH <= 7.5 ? '#10b981' : '#3b82f6',
    }];
  const nutrientData = selectedFarmerData ? [
    { subject: 'N', value: selectedFarmerData.nitrogen === null ? null : Math.min(selectedFarmerData.nitrogen / 100 * 10, 10) },
    { subject: 'P', value: selectedFarmerData.phosphorus === null ? null : Math.min(selectedFarmerData.phosphorus / 50 * 10, 10) },
    { subject: 'K', value: selectedFarmerData.potassium === null ? null : Math.min(selectedFarmerData.potassium / 300 * 10, 10) },
    { subject: 'OM', value: selectedFarmerData.organicMatter === null ? null : Math.min(selectedFarmerData.organicMatter / 5 * 10, 10) },
    { subject: 'Zn', value: selectedFarmerData.zinc === null ? null : Math.min(selectedFarmerData.zinc / 1 * 10, 10) },
    { subject: 'Fe', value: selectedFarmerData.iron === null ? null : Math.min(selectedFarmerData.iron / 10 * 10, 10) },
  ].filter((nutrient) => nutrient.value !== null) : [];

  useEffect(() => {
    if (!selectedFarm) return;
    setForm((current) => ({ ...emptyForm, soilType: selectedFarm.soilType || current.soilType }));
  }, [selectedFarmId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    if (!selectedFarm) {
      setError('Select one of your registered farms before saving soil results.');
      return;
    }
    const numericFields = ['pH', 'moisture', 'nitrogen', 'phosphorus', 'potassium', 'organicMatter', 'zinc', 'iron', 'manganese', 'copper'];
    const readings = Object.fromEntries(numericFields
      .filter((field) => form[field] !== '')
      .map((field) => [field, Number(form[field])]));
    if (!form.soilType.trim() && Object.keys(readings).length === 0) {
      setError('Enter at least one soil reading or a soil type.');
      return;
    }

    setSaving(true);
    try {
      const record = await api.createSoilTest({
        farmerId: currentUser?.id,
        farmId: selectedFarm.id,
        soilType: form.soilType.trim() || selectedFarm.soilType || '',
        ...readings,
        N: readings.nitrogen,
        P: readings.phosphorus,
        K: readings.potassium,
        micronutrients: {
          ...(readings.zinc !== undefined ? { zinc: readings.zinc } : {}),
          ...(readings.iron !== undefined ? { iron: readings.iron } : {}),
          ...(readings.manganese !== undefined ? { manganese: readings.manganese } : {}),
          ...(readings.copper !== undefined ? { copper: readings.copper } : {}),
        },
        source: 'fertiwise-soil-monitoring',
      });
      setSoilTests((current) => [record, ...current]);
      setFarms((current) => current.map((farm) => String(farm.id) === String(selectedFarm.id)
        ? {
          ...farm,
          soilType: form.soilType.trim() || farm.soilType,
          ...(readings.pH !== undefined ? { pH: readings.pH } : {}),
          ...(readings.moisture !== undefined ? { moisture: readings.moisture } : {}),
          ...(readings.nitrogen !== undefined ? { N: readings.nitrogen } : {}),
          ...(readings.phosphorus !== undefined ? { P: readings.phosphorus } : {}),
          ...(readings.potassium !== undefined ? { K: readings.potassium } : {}),
          ...(readings.organicMatter !== undefined ? { organicMatter: readings.organicMatter } : {}),
          latestSoilTest: record,
        }
        : farm));
      setForm(emptyForm);
      setShowEntryForm(false);
      setNotice(`Soil test saved and linked to ${selectedFarm.farmName}.`);
    } catch (requestError) {
      setError(requestError.message || 'Soil test could not be saved. Check the API connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const phColor = selectedFarmerData?.pH === null || selectedFarmerData?.pH === undefined
    ? 'text-gray-400'
    : selectedFarmerData.pH < 5.5 ? 'text-red-700' : selectedFarmerData.pH < 6.5 ? 'text-amber-700' : selectedFarmerData.pH <= 7.5 ? 'text-emerald-700' : 'text-blue-700';

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Soil Health Monitoring</h1>
          <p className="mt-1 text-sm text-gray-600">Farm profiles and soil tests from your account.</p>
        </div>
        <button type="button" onClick={loadSoilRecords} disabled={loading} className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
          <RefreshCw size={15} aria-hidden="true" />Refresh
        </button>
      </header>

      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-4 sm:px-5">
          <div>
            <h2 className="font-semibold text-gray-900">Soil Test Results</h2>
            <p className="mt-1 text-sm text-gray-500">Select a registered farm to review its soil profile and latest test.</p>
          </div>
          <button type="button" onClick={() => { setShowEntryForm((visible) => !visible); setError(''); setNotice(''); }} disabled={!farms.length} className="rounded-md bg-emerald-800 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50">
            {showEntryForm ? 'Cancel' : 'Add soil test'}
          </button>
        </header>

        <div className="space-y-4 p-4 sm:p-5">
          {error && <p role="alert" className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800"><AlertCircle size={17} className="mt-0.5 shrink-0" aria-hidden="true" />{error}</p>}
          {notice && <p role="status" className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">{notice}</p>}

          <div className="max-w-xl">
            <label htmlFor="soil-farm" className="mb-1 block text-sm font-medium text-gray-700">Select farm</label>
            <select id="soil-farm" value={selectedFarmId} onChange={(event) => { setSelectedFarmId(event.target.value); setNotice(''); }} disabled={loading || !farms.length} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/15 disabled:bg-gray-50">
              <option value="">{loading ? 'Loading your farms…' : farms.length ? 'Select a farm' : 'No registered farms'}</option>
              {farms.map((farm) => <option key={farm.id} value={farm.id}>{farm.farmName || 'Unnamed farm'} · {farm.name || currentUser?.name || 'Farmer'} · {farm.region || 'Region not set'}</option>)}
            </select>
          </div>

          {showEntryForm && (
            <form onSubmit={handleSubmit} className="rounded-md border border-gray-200 bg-gray-50 p-4">
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900">Enter soil test readings</h3>
                <p className="mt-1 text-xs text-gray-600">Saved to this farm and reflected in its profile and latest test.</p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <label className="text-sm font-medium text-gray-700">Soil type
                  <input value={form.soilType} onChange={(event) => updateField('soilType', event.target.value)} placeholder="e.g. Loamy" className="mt-1.5 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-normal text-gray-900" />
                </label>
                <label className="text-sm font-medium text-gray-700">Soil pH
                  <input type="number" min="0" max="14" step="0.1" value={form.pH} onChange={(event) => updateField('pH', event.target.value)} placeholder="e.g. 6.5" className="mt-1.5 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-normal text-gray-900" />
                </label>
                <label className="text-sm font-medium text-gray-700">Moisture (%)
                  <input type="number" min="0" max="100" step="0.1" value={form.moisture} onChange={(event) => updateField('moisture', event.target.value)} className="mt-1.5 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-normal text-gray-900" />
                </label>
                <label className="text-sm font-medium text-gray-700">Nitrogen (N)
                  <input type="number" min="0" step="0.1" value={form.nitrogen} onChange={(event) => updateField('nitrogen', event.target.value)} className="mt-1.5 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-normal text-gray-900" />
                </label>
                <label className="text-sm font-medium text-gray-700">Phosphorus (P)
                  <input type="number" min="0" step="0.1" value={form.phosphorus} onChange={(event) => updateField('phosphorus', event.target.value)} className="mt-1.5 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-normal text-gray-900" />
                </label>
                <label className="text-sm font-medium text-gray-700">Potassium (K)
                  <input type="number" min="0" step="0.1" value={form.potassium} onChange={(event) => updateField('potassium', event.target.value)} className="mt-1.5 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-normal text-gray-900" />
                </label>
                <label className="text-sm font-medium text-gray-700">Organic matter (%)
                  <input type="number" min="0" step="0.1" value={form.organicMatter} onChange={(event) => updateField('organicMatter', event.target.value)} className="mt-1.5 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-normal text-gray-900" />
                </label>
                {['zinc', 'iron', 'manganese', 'copper'].map((nutrient) => (
                  <label key={nutrient} className="text-sm font-medium capitalize text-gray-700">{nutrient} (mg/kg)
                    <input type="number" min="0" step="0.1" value={form[nutrient]} onChange={(event) => updateField(nutrient, event.target.value)} className="mt-1.5 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-normal text-gray-900" />
                  </label>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <button type="submit" disabled={saving || !selectedFarm} className="rounded-md bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50">
                  {saving ? 'Saving…' : 'Save soil test'}
                </button>
              </div>
            </form>
          )}

          {selectedFarmerData ? (
            hasSoilValues ? (
              <div className="space-y-5 border-t border-gray-100 pt-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedFarm.farmName}</h3>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-600"><MapPin size={15} aria-hidden="true" />{selectedFarm.locationDescription || selectedFarm.region || 'Location not recorded'}{selectedFarm.landSize ? ` · ${selectedFarm.landSize}` : ''}</p>
                  </div>
                  <p className="text-xs text-gray-500">Latest test: {formatDate(selectedFarmerData.testedAt)}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  <Metric label="Soil type" value={selectedFarmerData.soilType || 'Not recorded'} />
                  <Metric label="Soil pH" value={selectedFarmerData.pH ?? 'Not recorded'} valueClass={phColor} />
                  <Metric label="Moisture" value={selectedFarmerData.moisture === null ? 'Not recorded' : `${selectedFarmerData.moisture}%`} />
                  <Metric label="Organic matter" value={selectedFarmerData.organicMatter === null ? 'Not recorded' : `${selectedFarmerData.organicMatter}%`} />
                  <Metric label="Nitrogen (N)" value={selectedFarmerData.nitrogen ?? 'Not recorded'} />
                  <Metric label="Phosphorus (P)" value={selectedFarmerData.phosphorus ?? 'Not recorded'} />
                  <Metric label="Potassium (K)" value={selectedFarmerData.potassium ?? 'Not recorded'} />
                  <Metric label="Soil health" value={selectedFarm.healthStatus || selectedFarmerData.latestTest?.healthStatus || 'Not assessed'} />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <section className="rounded-md border border-gray-200 bg-gray-50 p-4">
                    <h4 className="text-sm font-semibold text-gray-900">Soil pH</h4>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <p className={`text-2xl font-bold ${phColor}`}>{selectedFarmerData.pH ?? '—'}</p>
                      {phLevelData.length > 0 && <div className="h-28 w-36" aria-label={`Soil pH classification: ${phLevelData[0].name}`}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={phLevelData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={28} outerRadius={43} stroke="none">
                              {phLevelData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                            </Pie>
                            <Tooltip formatter={(_value, name) => [selectedFarmerData.pH, name]} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>}
                    </div>
                    <div className="mt-2 flex justify-between text-[11px] text-gray-500"><span>Acidic</span><span>Neutral</span><span>Alkaline</span></div>
                  </section>

                  <section className="rounded-md border border-gray-200 bg-gray-50 p-4">
                    <h4 className="text-sm font-semibold text-gray-900">Organic matter</h4>
                    <div className="mt-4 flex items-baseline gap-1"><span className="text-2xl font-bold text-gray-900">{selectedFarmerData.organicMatter ?? '—'}</span>{selectedFarmerData.organicMatter !== null && <span className="text-sm text-gray-500">%</span>}</div>
                    <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-gray-200" role="img" aria-label={selectedFarmerData.organicMatter === null ? 'Organic matter not recorded' : `Organic matter ${selectedFarmerData.organicMatter}% on a 0 to 10 percent scale`}>
                      {selectedFarmerData.organicMatter !== null && <div className="h-full rounded-full bg-emerald-600 transition-[width]" style={{ width: `${Math.min(Math.max(selectedFarmerData.organicMatter / 10 * 100, 0), 100)}%` }} />}
                    </div>
                    <div className="mt-1 flex justify-between text-[11px] text-gray-500"><span>0%</span><span>5%</span><span>10%</span></div>
                  </section>

                  <section className="rounded-md border border-gray-200 bg-gray-50 p-4">
                    <h4 className="text-sm font-semibold text-gray-900">Micronutrients</h4>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-gray-700">
                      <span>Zinc: <strong>{selectedFarmerData.zinc ?? 'Not recorded'}</strong></span>
                      <span>Iron: <strong>{selectedFarmerData.iron ?? 'Not recorded'}</strong></span>
                      <span>Manganese: <strong>{selectedFarmerData.manganese ?? 'Not recorded'}</strong></span>
                      <span>Copper: <strong>{selectedFarmerData.copper ?? 'Not recorded'}</strong></span>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">Values and units are shown as provided by the soil record.</p>
                  </section>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <section className="rounded-md border border-gray-200 bg-gray-50 p-4">
                    <h4 className="text-sm font-semibold text-gray-900">Nutrient profile</h4>
                    {nutrientData.length ? <>
                      <div className="mt-2 h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={nutrientData} outerRadius="72%">
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#4b5563' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fontSize: 10, fill: '#6b7280' }} />
                            <Radar name="Recorded readings" dataKey="value" stroke="#16803c" fill="#16803c" fillOpacity={0.38} />
                            <Tooltip formatter={(value, _name, item) => [`${value.toFixed(1)} / 10 reference scale`, item.payload.subject]} />
                            <Legend />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                      <p className="text-xs text-gray-500">Comparative reference scale for visualization only, not a lab sufficiency rating.</p>
                    </> : <p className="py-12 text-center text-sm text-gray-500">No nutrient readings recorded for this farm.</p>}
                  </section>

                  <section className="rounded-md border border-gray-200 bg-gray-50 p-4">
                    <h4 className="text-sm font-semibold text-gray-900">Macro nutrient readings</h4>
                    <div className="mt-4 space-y-5">
                      {[
                        { label: 'Nitrogen (N)', value: selectedFarmerData.nitrogen, max: 100, color: 'bg-emerald-600' },
                        { label: 'Phosphorus (P)', value: selectedFarmerData.phosphorus, max: 50, color: 'bg-blue-600' },
                        { label: 'Potassium (K)', value: selectedFarmerData.potassium, max: 300, color: 'bg-amber-500' },
                      ].map((nutrient) => (
                        <div key={nutrient.label}>
                          <div className="mb-1 flex justify-between gap-2 text-sm"><span className="font-medium text-gray-800">{nutrient.label}</span><span className="text-gray-600">{nutrient.value ?? 'Not recorded'}</span></div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200" role="img" aria-label={`${nutrient.label}: ${nutrient.value ?? 'not recorded'}; comparative scale maximum ${nutrient.max}`}>
                            {nutrient.value !== null && <div className={`h-full rounded-full ${nutrient.color}`} style={{ width: `${Math.min(Math.max(nutrient.value / nutrient.max * 100, 0), 100)}%` }} />}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="mt-4 text-xs text-gray-500">Relative display scale only. Reported readings are shown above without assumed units.</p>
                  </section>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <section className="rounded-md border border-emerald-200 bg-emerald-50/60 p-4">
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900"><Sprout size={16} aria-hidden="true" />Farm soil profile</h4>
                    <p className="mt-2 text-sm text-gray-700">Farmer: {selectedFarm.name || currentUser?.name || 'Not recorded'}</p>
                    <p className="mt-1 text-sm text-gray-700">Region: {selectedFarm.region || 'Not recorded'}</p>
                    <p className="mt-1 text-sm text-gray-700">Suitable crops: {Array.isArray(selectedFarm.suitableCrops) ? selectedFarm.suitableCrops.join(', ') || 'Not recorded' : selectedFarm.suitableCrops || 'Not recorded'}</p>
                  </section>
                </div>
              </div>
            ) : (
              <div className="rounded-md border border-gray-200 bg-gray-50 p-6 text-center">
                <h3 className="font-medium text-gray-900">No soil test recorded for {selectedFarm.farmName}</h3>
                <p className="mt-1 text-sm text-gray-600">Add test results to update this farm’s soil profile.</p>
              </div>
            )
          ) : (
            <div className="rounded-md border border-gray-200 bg-gray-50 p-6 text-center">
              <h3 className="font-medium text-gray-900">{farms.length ? 'Select a farm to view its soil details' : 'No registered farms found'}</h3>
              <p className="mt-1 text-sm text-gray-600">{farms.length ? 'Choose a farm profile above to view the latest soil readings.' : 'Add a farm profile first, then link soil test results to it.'}</p>
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-gray-200 pt-5">
        <h2 className="text-lg font-semibold text-gray-900">Soil Health Tips</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Tip title="Soil Testing Frequency" tone="blue">For optimal results, test your soil every 2-3 years. More frequent testing may be needed for intensive cropping systems or when addressing specific nutrient deficiencies.</Tip>
          <Tip title="Improving Organic Matter" tone="green">Increase organic matter by incorporating crop residues, applying compost, using cover crops, and practicing crop rotation. Each 1% increase can improve water holding capacity by up to 25,000 gallons per acre.</Tip>
          <Tip title="pH Management" tone="yellow">Most crops perform best in soil with pH between 6.0 and 7.0. Use lime to raise pH in acidic soils and sulfur to lower pH in alkaline soils. Apply amendments 3-6 months before planting for best results.</Tip>
        </div>
      </section>
    </div>
  );
};

const Metric = ({ label, value, valueClass = 'text-gray-950' }) => (
  <div className="min-w-0 rounded-md border border-gray-200 bg-white p-3">
    <p className="text-xs font-medium text-gray-500">{label}</p>
    <p className={`mt-1 break-words text-lg font-semibold ${valueClass}`}>{value}</p>
  </div>
);

const Tip = ({ title, tone, children }) => {
  const toneClasses = {
    blue: 'border-blue-200 bg-blue-50 text-blue-900',
    green: 'border-green-200 bg-green-50 text-green-900',
    yellow: 'border-amber-200 bg-amber-50 text-amber-900',
  };
  return (
    <article className={`rounded-md border p-4 ${toneClasses[tone]}`}>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-gray-700">{children}</p>
    </article>
  );
};

export default SoilHealthMonitoringLive;
