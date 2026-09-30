import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Check, Fish, Plus, Volume2, Waves } from 'lucide-react';
import { api } from '../../../lib/api';
import RecordInsights from './RecordInsights';

const tabs = [
  { id: 'water', label: 'Water quality' },
  { id: 'sensor', label: 'Water sensor' },
  { id: 'feeding', label: 'Feeding plan' },
  { id: 'health', label: 'Disease management' },
  { id: 'harvest', label: 'Harvest timing' },
];

const stageRates = {
  Fry: 7,
  Fingerling: 4,
  'Grow-out': 2.5,
  Finishing: 1.8,
  Broodstock: 2,
};

const waterMetrics = [
  { key: 'turbidityNtu', label: 'Turbidity (NTU)', uuidKey: 'turbidityUuid', defaultScale: '1' },
  { key: 'dissolvedOxygen', label: 'Dissolved oxygen (mg/L)', uuidKey: 'oxygenUuid', defaultScale: '100' },
  { key: 'temperatureC', label: 'Water temperature (°C)', uuidKey: 'temperatureUuid', defaultScale: '100' },
  { key: 'ph', label: 'pH', uuidKey: 'phUuid', defaultScale: '100' },
  { key: 'conductivityUsCm', label: 'Conductivity (µS/cm)', uuidKey: 'conductivityUuid', defaultScale: '1' },
];

const readBleNumber = (data, format, divisor) => {
  if (format === 'float32-le' && data.byteLength >= 4) return data.getFloat32(0, true);
  if (format === 'int16-le' && data.byteLength >= 2) return data.getInt16(0, true) / divisor;
  if (format === 'uint16-le' && data.byteLength >= 2) return data.getUint16(0, true) / divisor;
  if (format === 'uint32-le' && data.byteLength >= 4) return data.getUint32(0, true) / divisor;
  return null;
};

const dateText = (value) => value
  ? new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
  : 'Not recorded';

const datePlusDays = (value, days) => {
  if (!value || !Number.isFinite(Number(days))) return '';
  const result = new Date(`${value}T12:00:00`);
  result.setDate(result.getDate() + Number(days));
  return result.toISOString().slice(0, 10);
};

const diagnoseWater = (record) => {
  const risks = [];
  const urgent = [];
  const green = record.waterColor === 'Green / dense algae';
  const smell = record.smell === 'Strong / rotten';
  const gasping = record.fishBehavior === 'Gasping at surface';
  const numericReading = (value) => value === '' || value === undefined || value === null ? null : Number(value);
  const oxygen = numericReading(record.dissolvedOxygen);
  const temperature = numericReading(record.temperatureC);
  const ph = numericReading(record.ph);
  const turbidity = numericReading(record.turbidityNtu);

  if ((oxygen !== null && oxygen < 3) || gasping) urgent.push('Low oxygen stress is possible. Increase aeration immediately if available and contact an aquaculture officer.');
  else if (oxygen !== null && oxygen < 5) risks.push('Dissolved oxygen is below a commonly used pond monitoring target; improve circulation and recheck, especially before dawn.');
  if (green && (smell || gasping || (oxygen !== null && oxygen < 5))) risks.push('Dense green water with odor or fish distress may indicate an unstable algal bloom and oxygen swings.');
  else if (green) risks.push('Dense green water can indicate high algae. Monitor oxygen and avoid adding fertilizer until the pond is assessed.');
  if (smell) risks.push('A strong rotten smell can signal decaying organic matter or poor water conditions. Check dead fish, feed waste and pond circulation.');
  if (temperature !== null && temperature > 32) risks.push('High water temperature can increase oxygen stress; check aeration and avoid overfeeding.');
  if (ph !== null && (ph < 6 || ph > 9)) risks.push('The pH reading is outside a typical freshwater pond range. Verify the test and seek local water-quality advice before adjusting it.');
  if (turbidity !== null && Number.isFinite(turbidity) && turbidity > Number(record.turbidityLimitNtu || 50)) risks.push(`Turbidity is above your ${record.turbidityLimitNtu || 50} NTU screening threshold. Check suspended solids, algae, runoff and fish behavior; thresholds depend on species and pond conditions.`);

  if (urgent.length) return { level: 'Urgent pond response', guidance: [...urgent, ...risks, 'Do not apply chemicals or make a sudden large water change without checking that replacement water is suitable.'] };
  if (risks.length) return { level: 'Check pond conditions promptly', guidance: [...risks, 'Reduce or pause feeding while fish show distress, keep aeration running if available, and recheck water conditions.'] };
  return { level: 'No immediate warning from these entries', guidance: ['Continue routine checks, especially dissolved oxygen before dawn and after cloudy or hot weather.', 'This screen cannot detect all water-quality or fish-health problems.'] };
};

const diseaseAdvice = (symptoms) => {
  const signs = symptoms.toLowerCase();
  const urgent = /many dead|mass death|massive mortality|gasping|cannot swim|loss of balance|bleeding/.test(signs);
  const whiteSpots = /white spot|white spots|spots|ich/.test(signs);
  const lethargy = /letharg|not eating|off feed|appetite|inactive/.test(signs);
  const guidance = [];
  if (urgent) guidance.push('Treat this as urgent. Contact an aquatic animal-health officer or fisheries extension service promptly and share water readings and a clear photo if possible.');
  if (whiteSpots) guidance.push('White spots can have several causes and should not be treated by appearance alone. Check water quality, avoid moving fish or sharing equipment, and ask an aquatic-health professional to confirm the cause.');
  if (lethargy) guidance.push('Lethargy or reduced feeding can follow poor oxygen, temperature stress or disease. Check dissolved oxygen, temperature, pH and recent feed changes; remove uneaten feed.');
  if (!guidance.length) guidance.push('Record when the signs started, how many fish are affected and recent water readings. Check oxygen, temperature and pH, then seek local aquaculture advice if signs persist or worsen.');
  guidance.push('Do not use human medicines, mix chemicals, or dose the pond without professional guidance. Keep nets and equipment separate between ponds.');
  return { level: urgent ? 'Urgent: contact fish-health support' : 'Investigate pond conditions', guidance };
};

const FisheriesDashboard = () => {
  const [records, setRecords] = useState([]);
  const [activeTab, setActiveTab] = useState('water');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [spokenRecord, setSpokenRecord] = useState(null);
  const [pondForm, setPondForm] = useState({ pondId: '', pondName: '', species: 'Tilapia', location: '' });
  const [selectedPondId, setSelectedPondId] = useState('');
  const [waterForm, setWaterForm] = useState({ checkedOn: new Date().toISOString().slice(0, 10), waterColor: 'Clear / normal', smell: 'No unusual smell', fishBehavior: 'Swimming normally', temperatureC: '', dissolvedOxygen: '', ph: '', turbidityNtu: '', conductivityUsCm: '' });
  const [feedForm, setFeedForm] = useState({ species: 'Tilapia', stage: 'Grow-out', biomassKg: '', temperatureC: '', feedRatePercent: String(stageRates['Grow-out']) });
  const [healthForm, setHealthForm] = useState({ symptoms: '' });
  const [harvestForm, setHarvestForm] = useState({ species: 'Tilapia', stockedOn: '', cycleDays: '180', expectedWeightKg: '', marketPricePerKg: '', marketRegion: '' });
  const [activeGuidance, setActiveGuidance] = useState(null);
  const [waterSensor, setWaterSensor] = useState({ status: 'disconnected', name: '' });
  const [waterSensorError, setWaterSensorError] = useState('');
  const [waterSensorReadings, setWaterSensorReadings] = useState({});
  const [sensorFishCondition, setSensorFishCondition] = useState('Swimming normally');
  const [turbidityLimitNtu, setTurbidityLimitNtu] = useState('50');
  const [sensorConfig, setSensorConfig] = useState({
    serviceUuid: 'environmental_sensing',
    turbidityUuid: '',
    oxygenUuid: '',
    temperatureUuid: 'temperature',
    phUuid: '',
    conductivityUuid: '',
    format: 'int16-le',
    divisor: '100',
  });
  const waterSensorRef = React.useRef(null);
  const waterCharacteristicsRef = React.useRef([]);

  useEffect(() => {
    api.moduleRecords('fisheries')
      .then((loadedRecords) => {
        setRecords(loadedRecords);
        const firstPond = loadedRecords.find((record) => record.type === 'pond');
        if (firstPond) {
          setSelectedPondId(firstPond.pondId);
          if (firstPond.species && firstPond.species !== 'Other') {
            setFeedForm((current) => ({ ...current, species: firstPond.species }));
            setHarvestForm((current) => ({ ...current, species: firstPond.species }));
          }
        }
      })
      .catch((requestError) => setError(requestError.message || 'Could not load pond records.'))
      .finally(() => setLoading(false));
    return () => window.speechSynthesis?.cancel();
  }, []);

  useEffect(() => () => {
    if (waterSensorRef.current?.gatt?.connected) waterSensorRef.current.gatt.disconnect();
  }, []);

  const ponds = useMemo(() => records.filter((record) => record.type === 'pond'), [records]);
  const selectedPond = ponds.find((pond) => pond.pondId === selectedPondId);
  const waterChecks = useMemo(() => records.filter((record) => record.type === 'waterCheck'), [records]);
  const feedPlans = useMemo(() => records.filter((record) => record.type === 'feedPlan'), [records]);
  const healthNotes = useMemo(() => records.filter((record) => record.type === 'diseaseNote'), [records]);
  const priceHistory = useMemo(() => records.filter((record) => record.type === 'marketPrice').sort((a, b) => (b.observedOn || '').localeCompare(a.observedOn || '')), [records]);
  const harvestPlans = useMemo(() => records.filter((record) => record.type === 'harvestPlan'), [records]);
  const latestWaterCheck = waterChecks[0];
  const latestFeedPlan = feedPlans[0];
  const urgentHealthCount = healthNotes.filter((record) => /urgent/i.test(record.level || '')).length;
  const fisheriesInsights = [];
  if (latestWaterCheck) {
    const dissolvedOxygen = Number(latestWaterCheck.dissolvedOxygen);
    fisheriesInsights.push(dissolvedOxygen < 3
      ? `Latest check for ${latestWaterCheck.pondName || latestWaterCheck.pondId || latestWaterCheck.pond} recorded very low dissolved oxygen (${dissolvedOxygen} mg/L): review aeration and contact an aquaculture officer.`
      : dissolvedOxygen < 5
        ? `Latest check for ${latestWaterCheck.pondName || latestWaterCheck.pondId || latestWaterCheck.pond} recorded dissolved oxygen below 5 mg/L (${dissolvedOxygen} mg/L); recheck promptly, especially before dawn.`
        : `Latest water check for ${latestWaterCheck.pondName || latestWaterCheck.pondId || latestWaterCheck.pond}: dissolved oxygen ${dissolvedOxygen} mg/L, temperature ${latestWaterCheck.temperatureC}°C, pH ${latestWaterCheck.ph}.`);
  }
  if (latestFeedPlan) fisheriesInsights.push(`Most recent ${latestFeedPlan.stage} plan for ${latestFeedPlan.pondName || latestFeedPlan.pondId || latestFeedPlan.pond} estimates ${latestFeedPlan.dailyFeedKg} kg/day at ${latestFeedPlan.temperatureC}°C.`);
  if (urgentHealthCount) fisheriesInsights.push(`${urgentHealthCount} saved fish-health note${urgentHealthCount === 1 ? '' : 's'} was flagged as urgent; follow up with an aquatic-health professional.`);
  if (harvestPlans.length) {
    const nextHarvest = harvestPlans.filter((plan) => plan.expectedHarvestOn).sort((a, b) => a.expectedHarvestOn.localeCompare(b.expectedHarvestOn))[0];
    if (nextHarvest) fisheriesInsights.push(`Nearest planned harvest is ${nextHarvest.species} from ${nextHarvest.pondName || nextHarvest.pondId || nextHarvest.pond}, targeted for ${dateText(nextHarvest.expectedHarvestOn)}.`);
  }
  if (!fisheriesInsights.length && priceHistory.length) fisheriesInsights.push(`${priceHistory.length} local market price observation${priceHistory.length === 1 ? '' : 's'} saved for harvest comparisons.`);

  const saveRecord = async (record) => {
    setError('');
    setNotice('');
    setSaving(true);
    try {
      const saved = await api.createModuleRecord('fisheries', record);
      setRecords((current) => [saved, ...current]);
      setNotice('Pond record saved.');
      return saved;
    } catch (requestError) {
      setError(requestError.message || 'Could not save the record. Check your connection and try again.');
      return null;
    } finally {
      setSaving(false);
    }
  };

  const addPond = async (event) => {
    event.preventDefault();
    const pondId = pondForm.pondId.trim();
    if (ponds.some((pond) => pond.pondId.toLowerCase() === pondId.toLowerCase())) {
      setError(`Pond ID ${pondId} already exists. Choose a unique ID.`);
      return;
    }
    const saved = await saveRecord({ ...pondForm, pondId, pondName: pondForm.pondName.trim(), location: pondForm.location.trim(), type: 'pond' });
    if (saved) {
      setSelectedPondId(saved.pondId);
      if (saved.species !== 'Other') {
        setFeedForm((current) => ({ ...current, species: saved.species }));
        setHarvestForm((current) => ({ ...current, species: saved.species }));
      }
      setPondForm({ pondId: '', pondName: '', species: 'Tilapia', location: '' });
      setNotice(`${saved.pondId} added and selected for pond records.`);
    }
  };

  const selectPond = (pondId) => {
    if (waterSensorRef.current?.gatt?.connected) waterSensorRef.current.gatt.disconnect();
    waterSensorRef.current = null;
    waterCharacteristicsRef.current = [];
    setWaterSensor({ status: 'disconnected', name: '' });
    setWaterSensorReadings({});
    setWaterSensorError('');
    setSelectedPondId(pondId);
    const pond = ponds.find((item) => item.pondId === pondId);
    if (pond?.species && pond.species !== 'Other') {
      setFeedForm((current) => ({ ...current, species: pond.species }));
      setHarvestForm((current) => ({ ...current, species: pond.species }));
    }
  };

  const connectWaterSensor = async () => {
    setWaterSensorError('');
    if (!navigator.bluetooth) {
      setWaterSensorError('Web Bluetooth is unavailable in this browser. Use a supported browser on HTTPS or localhost.');
      return;
    }
    if (!selectedPond) {
      setWaterSensorError('Add and select a pond before connecting its water sensor.');
      return;
    }
    const configuredMetrics = waterMetrics.filter((metric) => sensorConfig[metric.uuidKey].trim());
    if (!sensorConfig.serviceUuid.trim() || !configuredMetrics.length) {
      setWaterSensorError('Enter the sensor GATT service UUID and at least one measurement characteristic UUID.');
      return;
    }

    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [...new Set([sensorConfig.serviceUuid.trim(), 'environmental_sensing'])],
      });
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(sensorConfig.serviceUuid.trim());
      waterSensorRef.current = device;
      waterCharacteristicsRef.current = [];
      setWaterSensor({ status: 'connected', name: device.name || 'BLE water-quality probe' });
      setWaterSensorReadings({ pondId: selectedPond.pondId, capturedAt: new Date().toISOString() });

      let connectedMetrics = 0;
      for (const metric of configuredMetrics) {
        try {
          const characteristic = await service.getCharacteristic(sensorConfig[metric.uuidKey].trim());
          const readValue = async (data) => {
            const divisor = Number(sensorConfig.divisor) || 1;
            const value = readBleNumber(data, sensorConfig.format, divisor);
            if (value === null || !Number.isFinite(value)) return;
            setWaterSensorReadings((current) => ({
              ...current,
              pondId: selectedPond.pondId,
              capturedAt: new Date().toISOString(),
              [metric.key]: Math.round(value * 100) / 100,
            }));
          };
          try {
            await characteristic.startNotifications();
            characteristic.addEventListener('characteristicvaluechanged', (event) => readValue(event.target.value));
          } catch {
            // Some probes only support one-time reads; attempt that below.
          }
          try {
            const value = await characteristic.readValue();
            readValue(value);
          } catch {
            if (!characteristic.properties.notify && !characteristic.properties.indicate) throw new Error('This characteristic cannot be read or notified.');
          }
          waterCharacteristicsRef.current.push(characteristic);
          connectedMetrics += 1;
        } catch {
          setWaterSensorError((current) => `${current}${current ? ' ' : ''}${metric.label} characteristic could not be read; verify its UUID and data format.`);
        }
      }
      if (!connectedMetrics) {
        device.gatt.disconnect();
        setWaterSensor({ status: 'disconnected', name: '' });
        setWaterSensorError('No configured measurement characteristic connected. Check the service and characteristic UUIDs.');
        return;
      }
      device.addEventListener('gattserverdisconnected', () => {
        setWaterSensor({ status: 'disconnected', name: '' });
        waterSensorRef.current = null;
      });
    } catch (connectionError) {
      if (connectionError.name !== 'NotFoundError') setWaterSensorError(connectionError.message || 'Could not connect to this water sensor.');
      setWaterSensor({ status: 'disconnected', name: '' });
    }
  };

  const disconnectWaterSensor = () => {
    if (waterSensorRef.current?.gatt?.connected) waterSensorRef.current.gatt.disconnect();
    waterSensorRef.current = null;
    waterCharacteristicsRef.current = [];
    setWaterSensor({ status: 'disconnected', name: '' });
  };

  const applySensorReadings = () => {
    if (waterSensorReadings.pondId !== selectedPondId) {
      setWaterSensorError('Sensor readings belong to a different pond. Select that pond or capture fresh readings.');
      return;
    }
    setWaterForm((current) => ({
      ...current,
      temperatureC: waterSensorReadings.temperatureC ?? current.temperatureC,
      dissolvedOxygen: waterSensorReadings.dissolvedOxygen ?? current.dissolvedOxygen,
      ph: waterSensorReadings.ph ?? current.ph,
      turbidityNtu: waterSensorReadings.turbidityNtu ?? current.turbidityNtu,
      conductivityUsCm: waterSensorReadings.conductivityUsCm ?? current.conductivityUsCm,
      fishBehavior: sensorFishCondition,
    }));
    setNotice(`Sensor values copied to the water check for ${selectedPond?.pondId}.`);
  };

  const saveSensorAssessment = async () => {
    if (!selectedPond || waterSensorReadings.pondId !== selectedPond.pondId) {
      setWaterSensorError('Select the pond currently connected to this probe before saving.');
      return;
    }
    const assessmentInput = {
      ...waterForm,
      ...waterSensorReadings,
      pondId: selectedPond.pondId,
      pondName: selectedPond.pondName,
      fishBehavior: sensorFishCondition,
      turbidityLimitNtu: Number(turbidityLimitNtu) || 50,
    };
    const diagnostics = diagnoseWater(assessmentInput);
    const saved = await saveRecord({
      ...assessmentInput,
      type: 'waterCheck',
      source: 'BLE water-quality sensor',
      checkedOn: new Date().toISOString().slice(0, 10),
      ...diagnostics,
    });
    if (saved) setActiveGuidance({ type: 'water', level: saved.level, guidance: saved.guidance });
  };

  const submitWaterCheck = async (event) => {
    event.preventDefault();
    const diagnostics = diagnoseWater({ ...waterForm, turbidityLimitNtu: Number(turbidityLimitNtu) || 50 });
    const saved = await saveRecord({ ...waterForm, pondId: selectedPond.pondId, pondName: selectedPond.pondName, type: 'waterCheck', ...diagnostics, temperatureC: Number(waterForm.temperatureC), dissolvedOxygen: Number(waterForm.dissolvedOxygen), ph: Number(waterForm.ph) });
    if (saved) setActiveGuidance({ type: 'water', level: saved.level, guidance: saved.guidance });
  };

  const submitFeedPlan = async (event) => {
    event.preventDefault();
    const biomassKg = Number(feedForm.biomassKg);
    const temperatureC = Number(feedForm.temperatureC);
    const rate = Number(feedForm.feedRatePercent);
    const factor = temperatureC < 20 ? 0.5 : temperatureC < 24 ? 0.75 : temperatureC <= 30 ? 1 : 0.8;
    const adjustedRatePercent = Math.round(rate * factor * 100) / 100;
    const dailyFeedKg = Math.round((biomassKg * adjustedRatePercent / 100) * 100) / 100;
    const temperatureNote = temperatureC < 20
      ? 'Cold water can sharply reduce feeding. This conservative estimate is not species-specific; check fish behavior and local guidance before feeding.'
      : temperatureC < 24
        ? 'Cooler-than-optimal water: use a reduced ration and watch for uneaten feed.'
        : temperatureC <= 30
          ? 'Temperature is within a common warm-water feeding band; split feed into small meals and stop when fish activity drops.'
          : 'Hot water can increase oxygen stress. Reduce feed, check oxygen, and avoid feeding during the hottest part of the day.';
    const saved = await saveRecord({ ...feedForm, pondId: selectedPond.pondId, pondName: selectedPond.pondName, type: 'feedPlan', biomassKg, temperatureC, baseRatePercent: rate, temperatureFactor: factor, adjustedRatePercent, dailyFeedKg, temperatureNote });
    if (saved) setActiveGuidance({ type: 'feed', level: `${saved.dailyFeedKg} kg/day estimated`, guidance: [temperatureNote, 'Treat the result as a starting estimate. Follow the feed label and adjust to observed appetite, dissolved oxygen, species and life stage.'] });
  };

  const submitDiseaseNote = async (event) => {
    event.preventDefault();
    const advice = diseaseAdvice(healthForm.symptoms);
    const saved = await saveRecord({ ...healthForm, pondId: selectedPond.pondId, pondName: selectedPond.pondName, type: 'diseaseNote', ...advice, reportedAt: new Date().toISOString() });
    if (saved) setActiveGuidance({ type: 'disease', level: saved.level, guidance: saved.guidance });
  };

  const submitHarvestPlan = async (event) => {
    event.preventDefault();
    const expectedHarvestOn = datePlusDays(harvestForm.stockedOn, harvestForm.cycleDays);
    const currentPrice = Number(harvestForm.marketPricePerKg);
    const comparablePrices = priceHistory.filter((price) => price.species === harvestForm.species && price.marketRegion.toLowerCase() === harvestForm.marketRegion.trim().toLowerCase());
    const previousPrice = comparablePrices[0] ? Number(comparablePrices[0].pricePerKg) : null;
    const priceChangePercent = previousPrice && currentPrice
      ? Math.round(((currentPrice - previousPrice) / previousPrice) * 1000) / 10
      : null;
    const priceSignal = priceChangePercent === null
      ? 'One price observation saved; add another observation from the same market to compare trends.'
      : priceChangePercent > 0
        ? `Local recorded price is up ${priceChangePercent}% from the previous observation.`
        : priceChangePercent < 0
          ? `Local recorded price is down ${Math.abs(priceChangePercent)}% from the previous observation.`
          : 'Local recorded price is unchanged from the previous observation.';
    const savedPrice = await saveRecord({ type: 'marketPrice', pondId: selectedPond.pondId, pondName: selectedPond.pondName, species: harvestForm.species, marketRegion: harvestForm.marketRegion.trim(), observedOn: new Date().toISOString().slice(0, 10), pricePerKg: currentPrice });
    if (!savedPrice) return;
    const savedPlan = await saveRecord({
      type: 'harvestPlan',
      pondId: selectedPond.pondId,
      pondName: selectedPond.pondName,
      species: harvestForm.species,
      stockedOn: harvestForm.stockedOn,
      cycleDays: Number(harvestForm.cycleDays),
      expectedWeightKg: harvestForm.expectedWeightKg ? Number(harvestForm.expectedWeightKg) : null,
      expectedHarvestOn,
      marketRegion: harvestForm.marketRegion.trim(),
      currentPricePerKg: currentPrice,
      previousPricePerKg: previousPrice,
      priceChangePercent,
      priceSignal,
    });
    if (savedPlan) setActiveGuidance({ type: 'harvest', level: `Target harvest date: ${dateText(expectedHarvestOn)}`, guidance: [priceSignal, 'Compare fish size and condition with buyer requirements before harvesting. This date is based on the cycle length you entered, not an automatic biological maturity assessment.'] });
  };

  const speakGuidance = (record) => {
    if (!window.speechSynthesis) {
      setError('Voice playback is not supported by this browser.');
      return;
    }
    if (spokenRecord === record.type) {
      window.speechSynthesis.cancel();
      setSpokenRecord(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`${record.level}. ${record.guidance.join('. ')}`);
    utterance.onstart = () => setSpokenRecord(record.type);
    utterance.onend = () => setSpokenRecord(null);
    utterance.onerror = () => setSpokenRecord(null);
    window.speechSynthesis.speak(utterance);
  };

  const input = (label, value, onChange, options = {}) => (
    <label className="block text-sm font-medium text-gray-700">{label}<input {...options} value={value} onChange={onChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" /></label>
  );

  const select = (label, value, onChange, options) => (
    <label className="block text-sm font-medium text-gray-700">{label}<select value={value} onChange={onChange} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">{options.map((option) => <option key={option}>{option}</option>)}</select></label>
  );

  const saveButton = (label) => <button type="submit" disabled={saving || !selectedPondId} className="inline-flex items-center gap-2 rounded-md bg-sky-800 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-900 disabled:opacity-60"><Plus size={16} aria-hidden="true" />{saving ? 'Saving…' : label}</button>;

  return (
    <main className="space-y-5">
      <header className="flex flex-col justify-between gap-4 rounded-lg border border-sky-200 bg-sky-50 p-5 sm:flex-row sm:items-center">
        <div><p className="text-xs font-bold uppercase text-sky-800">Farm management / aquaculture</p><h1 className="mt-1 text-2xl font-bold text-gray-950">Pond & fish management</h1><p className="mt-1 text-sm text-gray-700">Monitor water, tune feed, respond to health signs and plan harvests.</p></div>
        <div className="flex gap-5 text-sm"><div><span className="block text-gray-600">Water checks</span><strong className="text-xl text-gray-950">{waterChecks.length}</strong></div><div><span className="block text-gray-600">Health notes</span><strong className="text-xl text-gray-950">{healthNotes.length}</strong></div></div>
      </header>

      {(error || notice) && <div role={error ? 'alert' : 'status'} className={`rounded-md border px-4 py-3 text-sm ${error ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>{error || notice}</div>}

      <section className="grid gap-4 rounded-lg border border-gray-200 bg-white p-4 lg:grid-cols-[1.3fr_1fr]">
        <form onSubmit={addPond} className="space-y-3">
          <div><h2 className="text-base font-semibold text-gray-950">Pond register</h2><p className="text-sm text-gray-600">Add each pond once, then link all checks and plans to its ID.</p></div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {input('Pond ID', pondForm.pondId, (e) => setPondForm({ ...pondForm, pondId: e.target.value }), { required: true, placeholder: 'e.g. P-001' })}
            {input('Pond name', pondForm.pondName, (e) => setPondForm({ ...pondForm, pondName: e.target.value }), { required: true, placeholder: 'e.g. North pond' })}
            {select('Main species', pondForm.species, (e) => setPondForm({ ...pondForm, species: e.target.value }), ['Tilapia', 'Catfish', 'Other'])}
            {input('Location (optional)', pondForm.location, (e) => setPondForm({ ...pondForm, location: e.target.value }), { placeholder: 'Farm block / area' })}
          </div>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-md border border-sky-800 px-4 py-2 text-sm font-semibold text-sky-900 hover:bg-sky-50 disabled:opacity-60"><Plus size={16} aria-hidden="true" />{saving ? 'Saving…' : 'Add pond'}</button>
        </form>
        <div className="border-t border-gray-200 pt-3 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
          <PondReference ponds={ponds} selectedPondId={selectedPondId} onChange={selectPond} />
          {selectedPond ? <p className="mt-2 text-sm text-gray-600">Active: <strong className="text-gray-900">{selectedPond.pondId} · {selectedPond.pondName}</strong> · {selectedPond.species}{selectedPond.location ? ` · ${selectedPond.location}` : ''}</p> : <p className="mt-2 text-sm text-amber-800">Add and select a pond before creating checks, feeding, health or harvest records.</p>}
        </div>
      </section>

      <nav aria-label="Fisheries tools" className="flex gap-1 overflow-x-auto border-b border-gray-300">{tabs.map((tab) => <button type="button" key={tab.id} onClick={() => { setActiveTab(tab.id); setActiveGuidance(null); }} aria-current={activeTab === tab.id ? 'page' : undefined} className={`shrink-0 border-b-2 px-3 py-3 text-sm font-medium ${activeTab === tab.id ? 'border-sky-800 text-sky-900' : 'border-transparent text-gray-600 hover:text-gray-950'}`}>{tab.label}</button>)}</nav>

      {!loading && <RecordInsights items={fisheriesInsights} emptyMessage="Add pond, feeding, health or harvest records to see aquaculture insights." />}

      {loading ? <p className="py-10 text-center text-sm text-gray-600">Loading your pond records…</p> : <>
        {activeTab === 'sensor' && <section className="space-y-5">
          <header><h2 className="text-lg font-semibold text-gray-950">Water sensor & pond condition</h2><p className="text-sm text-gray-600">Connect a BLE probe to capture water quality for the selected pond.</p></header>
          <PondReference ponds={ponds} selectedPondId={selectedPondId} onChange={selectPond} />
          {waterSensorError && <p role="alert" className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">{waterSensorError}</p>}
          <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-semibold text-gray-950">Bluetooth probe connection</h3><p className="text-sm text-gray-600">Enter the GATT service and measurement characteristic UUIDs supplied by your probe manufacturer.</p></div><span className={`rounded-full px-2 py-1 text-xs font-semibold ${waterSensor.status === 'connected' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'}`}>{waterSensor.status === 'connected' ? waterSensor.name : 'Disconnected'}</span></div>
            <label className="block text-sm font-medium text-gray-700">GATT service UUID<input value={sensorConfig.serviceUuid} onChange={(event) => setSensorConfig({ ...sensorConfig, serviceUuid: event.target.value })} disabled={waterSensor.status === 'connected'} placeholder="e.g. environmental_sensing or vendor UUID" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100" /></label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">{waterMetrics.map((metric) => <label key={metric.key} className="block text-sm font-medium text-gray-700">{metric.label} characteristic UUID<input value={sensorConfig[metric.uuidKey]} onChange={(event) => setSensorConfig({ ...sensorConfig, [metric.uuidKey]: event.target.value })} disabled={waterSensor.status === 'connected'} placeholder="Optional; probe-specific" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100" /></label>)}</div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block text-sm font-medium text-gray-700">Raw reading format<select value={sensorConfig.format} onChange={(event) => setSensorConfig({ ...sensorConfig, format: event.target.value })} disabled={waterSensor.status === 'connected'} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm disabled:bg-gray-100"><option value="uint16-le">Unsigned 16-bit little-endian</option><option value="int16-le">Signed 16-bit little-endian</option><option value="uint32-le">Unsigned 32-bit little-endian</option><option value="float32-le">Float 32-bit little-endian</option></select></label>
              <label className="block text-sm font-medium text-gray-700">Divide integer readings by<input type="number" min="0.0001" step="any" value={sensorConfig.divisor} onChange={(event) => setSensorConfig({ ...sensorConfig, divisor: event.target.value })} disabled={waterSensor.status === 'connected' || sensorConfig.format === 'float32-le'} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100" /></label>
            </div>
            <p className="text-xs text-gray-500">All configured characteristics use the selected encoding and divisor. Confirm UUIDs, byte order, units, and scaling with the manufacturer. BLE characteristics are not standardized across most turbidity, dissolved-oxygen, and pH probes.</p>
            <div className="flex flex-wrap gap-2">{waterSensor.status === 'connected' ? <button type="button" onClick={disconnectWaterSensor} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50">Disconnect probe</button> : <button type="button" onClick={connectWaterSensor} disabled={!selectedPond || saving} className="rounded-md bg-sky-800 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-900 disabled:opacity-60">Connect BLE probe</button>}</div>
          </section>
          <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
            <div><h3 className="font-semibold text-gray-950">Latest readings · {selectedPond ? `${selectedPond.pondId} · ${selectedPond.pondName}` : 'No pond selected'}</h3><p className="text-sm text-gray-600">{waterSensorReadings.capturedAt ? `Received ${new Date(waterSensorReadings.capturedAt).toLocaleString()}` : 'Waiting for sensor data.'}</p></div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">{waterMetrics.map((metric) => <div key={metric.key} className="rounded-md border border-gray-200 bg-gray-50 p-3"><p className="text-xs text-gray-600">{metric.label}</p><p className="mt-1 font-semibold text-gray-950">{waterSensorReadings[metric.key] === undefined ? '—' : `${waterSensorReadings[metric.key]}${metric.key === 'temperatureC' ? ' °C' : metric.key === 'dissolvedOxygen' ? ' mg/L' : metric.key === 'ph' ? ' pH' : ''}`}</p></div>)}</div>
            <label className="block max-w-sm text-sm font-medium text-gray-700">Observed fish condition<select value={sensorFishCondition} onChange={(event) => setSensorFishCondition(event.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"><option>Swimming normally</option><option>Gasping at surface</option><option>Unusually inactive</option><option>Not feeding</option><option>Abnormal swimming</option><option>Visible lesions or spots</option></select></label>
            <div className="flex flex-wrap gap-2"><button type="button" onClick={applySensorReadings} disabled={!selectedPond || waterSensorReadings.pondId !== selectedPondId} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-60">Use readings in water check</button><button type="button" onClick={saveSensorAssessment} disabled={!selectedPond || waterSensorReadings.pondId !== selectedPondId || !waterMetrics.some((metric) => waterSensorReadings[metric.key] !== undefined) || saving} className="rounded-md bg-sky-800 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-900 disabled:opacity-60">{saving ? 'Saving…' : 'Save readings & assess pond'}</button></div>
          </section>
          <GuidanceCard record={activeGuidance?.type === 'water' ? activeGuidance : null} speak={speakGuidance} spokenRecord={spokenRecord} />
        </section>}

        {activeTab === 'water' && <section className="space-y-5"><header><h2 className="text-lg font-semibold text-gray-950">Water quality check</h2><p className="text-sm text-gray-600">Record pond observations or assess readings from a connected water sensor for algae and oxygen stress.</p></header>
          <section className="space-y-3 rounded-lg border border-sky-200 bg-sky-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><h3 className="font-semibold text-gray-950">Sensor check · {selectedPond ? `${selectedPond.pondId} · ${selectedPond.pondName}` : 'Select a pond first'}</h3><p className="text-sm text-gray-700">{waterSensor.status === 'connected' ? `Connected: ${waterSensor.name}` : 'Connect a configured BLE probe to read water quality.'}</p></div>
              {waterSensor.status === 'connected'
                ? <button type="button" onClick={disconnectWaterSensor} className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium hover:bg-gray-100">Disconnect probe</button>
                : <button type="button" onClick={connectWaterSensor} disabled={!selectedPond || saving} className="rounded-md bg-sky-800 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-900 disabled:opacity-60">Connect probe</button>}
            </div>
            {waterSensorError && <p role="alert" className="rounded-md border border-amber-300 bg-white p-3 text-sm text-amber-900">{waterSensorError}</p>}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">{waterMetrics.map((metric) => <div key={metric.key} className="rounded-md border border-sky-100 bg-white p-3"><p className="text-xs text-gray-600">{metric.label}</p><p className="mt-1 text-sm font-semibold text-gray-950">{waterSensorReadings.pondId === selectedPondId && waterSensorReadings[metric.key] !== undefined ? `${waterSensorReadings[metric.key]}${metric.key === 'temperatureC' ? ' °C' : metric.key === 'dissolvedOxygen' ? ' mg/L' : metric.key === 'ph' ? ' pH' : ''}` : 'Not measured'}</p></div>)}</div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Observed fish condition<select value={sensorFishCondition} onChange={(event) => setSensorFishCondition(event.target.value)} className="ml-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"><option>Swimming normally</option><option>Gasping at surface</option><option>Unusually inactive</option><option>Not feeding</option><option>Abnormal swimming</option><option>Visible lesions or spots</option></select></label>
              <button type="button" onClick={applySensorReadings} disabled={!selectedPond || waterSensorReadings.pondId !== selectedPondId} className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium hover:bg-gray-100 disabled:opacity-60">Fill check with readings</button>
              <button type="button" onClick={saveSensorAssessment} disabled={!selectedPond || waterSensorReadings.pondId !== selectedPondId || !waterMetrics.some((metric) => waterSensorReadings[metric.key] !== undefined) || saving} className="rounded-md bg-emerald-800 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-900 disabled:opacity-60">{saving ? 'Assessing…' : 'Assess & save sensor check'}</button>
              <button type="button" onClick={() => setActiveTab('sensor')} className="text-sm font-medium text-sky-900 underline">Configure probe</button>
            </div>
            <p className="text-xs text-gray-600">Probe readings must use UUIDs, format, and scaling configured in Water sensor. Fish condition is observed by the farmer; the probe does not identify disease by itself.</p>
          </section>
          <form onSubmit={submitWaterCheck} className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-2 xl:grid-cols-4">
            <PondReference ponds={ponds} selectedPondId={selectedPondId} onChange={selectPond} />
            {input('Check date', waterForm.checkedOn, (e) => setWaterForm({ ...waterForm, checkedOn: e.target.value }), { type: 'date', required: true })}
            {select('Water appearance', waterForm.waterColor, (e) => setWaterForm({ ...waterForm, waterColor: e.target.value }), ['Clear / normal', 'Green / dense algae', 'Unusually cloudy', 'Other'])}
            {select('Smell', waterForm.smell, (e) => setWaterForm({ ...waterForm, smell: e.target.value }), ['No unusual smell', 'Earthy', 'Strong / rotten'])}
            {select('Fish behaviuor', waterForm.fishBehavior, (e) => setWaterForm({ ...waterForm, fishBehavior: e.target.value }), ['Swimming normally', 'Gasping at surface', 'Unusually inactive', 'Not feeding'])}
            {input('Water temperature (°C)', waterForm.temperatureC, (e) => setWaterForm({ ...waterForm, temperatureC: e.target.value }), { type: 'number', min: 0, max: 50, step: '0.1', required: true })}
            {input('Dissolved oxygen (mg/L)', waterForm.dissolvedOxygen, (e) => setWaterForm({ ...waterForm, dissolvedOxygen: e.target.value }), { type: 'number', min: 0, max: 30, step: '0.1', required: true })}
            {input('pH', waterForm.ph, (e) => setWaterForm({ ...waterForm, ph: e.target.value }), { type: 'number', min: 0, max: 14, step: '0.1', required: true })}
            {input('Turbidity (NTU, optional)', waterForm.turbidityNtu, (e) => setWaterForm({ ...waterForm, turbidityNtu: e.target.value }), { type: 'number', min: 0, step: '0.1' })}
            {input('Conductivity (µS/cm, optional)', waterForm.conductivityUsCm, (e) => setWaterForm({ ...waterForm, conductivityUsCm: e.target.value }), { type: 'number', min: 0, step: 'any' })}
            <label className="block text-sm font-medium text-gray-700">Turbidity screening threshold (NTU)<input type="number" min="0" step="any" value={turbidityLimitNtu} onChange={(e) => setTurbidityLimitNtu(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" /><span className="mt-1 block text-xs font-normal text-gray-500">Set using local species and extension guidance; 50 NTU is only a starting screen.</span></label>
            <div className="sm:col-span-2 xl:col-span-4">{saveButton('Assess and save water check')}</div>
          </form>
          <GuidanceCard record={activeGuidance?.type === 'water' ? activeGuidance : null} speak={speakGuidance} spokenRecord={spokenRecord} />
          <RecordSection title="Recent water checks" records={waterChecks} render={(record) => <><strong>{record.pondName || record.pondId || record.pond} · {record.level}</strong><p className="mt-1 text-gray-600">{dateText(record.checkedOn)} · {record.temperatureC}°C · DO {record.dissolvedOxygen} mg/L · pH {record.ph}</p><p className="mt-1 text-gray-700">{record.guidance?.[0]}</p></>} />
        </section>}

        {activeTab === 'feeding' && <section className="space-y-5"><header><h2 className="text-lg font-semibold text-gray-950">Temperature-aware feeding plan</h2><p className="text-sm text-gray-600">Estimate a daily ration using fish biomass, growth stage and measured pond temperature.</p></header>
          <form onSubmit={submitFeedPlan} className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-2 xl:grid-cols-3">
            <PondReference ponds={ponds} selectedPondId={selectedPondId} onChange={selectPond} />
            {select('Species', feedForm.species, (e) => setFeedForm({ ...feedForm, species: e.target.value }), ['Tilapia', 'Catfish', 'Other'])}
            {select('Growth stage', feedForm.stage, (e) => setFeedForm({ ...feedForm, stage: e.target.value, feedRatePercent: String(stageRates[e.target.value]) }), Object.keys(stageRates))}
            {input('Estimated fish biomass (kg)', feedForm.biomassKg, (e) => setFeedForm({ ...feedForm, biomassKg: e.target.value }), { type: 'number', required: true, min: 0.1, step: '0.1' })}
            {input('Water temperature (°C)', feedForm.temperatureC, (e) => setFeedForm({ ...feedForm, temperatureC: e.target.value }), { type: 'number', required: true, min: 0, max: 50, step: '0.1' })}
            {input('Base ration (% biomass/day)', feedForm.feedRatePercent, (e) => setFeedForm({ ...feedForm, feedRatePercent: e.target.value }), { type: 'number', required: true, min: 0.1, max: 15, step: '0.1' })}
            <div className="sm:col-span-2 xl:col-span-3">{saveButton('Calculate and save plan')}</div>
          </form>
          {activeGuidance?.type === 'feed' && <GuidanceCard record={activeGuidance} speak={speakGuidance} spokenRecord={spokenRecord} />}
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">Ration percentages and temperature adjustments are broad starting estimates, not species-specific nutrition advice. Follow feed-label guidance; observe appetite and uneaten feed, and check oxygen before increasing rations.</div>
          <RecordSection title="Saved feed plans" records={feedPlans} render={(record) => <><strong>{record.pondName || record.pondId || record.pond} · {record.species} · {record.stage}</strong><p className="mt-1 text-gray-600">{record.dailyFeedKg} kg/day estimated from {record.biomassKg} kg biomass at {record.temperatureC}°C ({record.adjustedRatePercent}%/day)</p></>} />
        </section>}

        {activeTab === 'health' && <section className="space-y-5"><header><h2 className="text-lg font-semibold text-gray-950">Fish health troubleshooting</h2><p className="text-sm text-gray-600">Describe signs such as white spots, lethargy or reduced feeding for safe first-response steps.</p></header>
          <form onSubmit={submitDiseaseNote} className="space-y-3 rounded-lg border border-gray-200 bg-white p-4"><PondReference ponds={ponds} selectedPondId={selectedPondId} onChange={selectPond} /><label className="block text-sm font-medium text-gray-700">What are you seeing?<textarea required minLength={4} rows={4} value={healthForm.symptoms} onChange={(e) => setHealthForm({ ...healthForm, symptoms: e.target.value })} placeholder="For example: several fish have white spots and are eating less since yesterday" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" /></label>{saveButton('Get response steps')}<p className="text-xs text-gray-500">This is a rule-based first-response guide, not a diagnosis. Do not medicate the pond without advice from an aquatic-health professional.</p></form>
          <GuidanceCard record={activeGuidance?.type === 'disease' ? activeGuidance : null} speak={speakGuidance} spokenRecord={spokenRecord} />
          <RecordSection title="Health notes" records={healthNotes} render={(record) => <><strong>{record.pondName || record.pondId || record.pond} · {record.level}</strong><p className="mt-1 text-gray-600">Reported: {record.symptoms}</p><p className="mt-1 text-gray-700">{record.guidance?.[0]}</p></>} />
        </section>}

        {activeTab === 'harvest' && <section className="space-y-5"><header><h2 className="text-lg font-semibold text-gray-950">Harvest and local price planning</h2><p className="text-sm text-gray-600">Estimate a target date from your stocking cycle and build a price trend from dated local market observations.</p></header>
          <form onSubmit={submitHarvestPlan} className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-2 xl:grid-cols-3">
            <PondReference ponds={ponds} selectedPondId={selectedPondId} onChange={selectPond} />
            {select('Species', harvestForm.species, (e) => setHarvestForm({ ...harvestForm, species: e.target.value }), ['Tilapia', 'Catfish', 'Other'])}
            {input('Stocking date', harvestForm.stockedOn, (e) => setHarvestForm({ ...harvestForm, stockedOn: e.target.value }), { type: 'date', required: true })}
            {input('Expected culture cycle (days)', harvestForm.cycleDays, (e) => setHarvestForm({ ...harvestForm, cycleDays: e.target.value }), { type: 'number', min: 1, max: 1000, required: true })}
            {input('Expected harvest weight (kg, optional)', harvestForm.expectedWeightKg, (e) => setHarvestForm({ ...harvestForm, expectedWeightKg: e.target.value }), { type: 'number', min: 0, step: '0.1' })}
            {input('Current local price (GH₵/kg)', harvestForm.marketPricePerKg, (e) => setHarvestForm({ ...harvestForm, marketPricePerKg: e.target.value }), { type: 'number', min: 0.01, step: '0.01', required: true })}
            {input('Market / region', harvestForm.marketRegion, (e) => setHarvestForm({ ...harvestForm, marketRegion: e.target.value }), { required: true, placeholder: 'e.g. Kumasi' })}
            <div className="sm:col-span-2 xl:col-span-3">{saveButton('Save price and harvest plan')}</div>
          </form>
          {activeGuidance?.type === 'harvest' && <GuidanceCard record={activeGuidance} speak={speakGuidance} spokenRecord={spokenRecord} />}
          <div className="rounded-md border border-sky-200 bg-sky-50 p-3 text-sm text-sky-950">Harvest-date estimates use your entered cycle length. Price trend compares your latest entry with the previous entry for the same species and market; it is farmer-entered cached data, not a live market quote.</div>
          <RecordSection title="Price observations" records={priceHistory} render={(record) => <><strong>{record.species} · {record.marketRegion}</strong><p className="mt-1 text-gray-600">GH₵{Number(record.pricePerKg).toFixed(2)}/kg · {dateText(record.observedOn)}</p></>} />
          <RecordSection title="Harvest plans" records={harvestPlans} render={(record) => <><strong>{record.pondName || record.pondId || record.pond} · {record.species}</strong><p className="mt-1 text-gray-600">Target {dateText(record.expectedHarvestOn)} · GH₵{Number(record.currentPricePerKg).toFixed(2)}/kg in {record.marketRegion}</p><p className="mt-1 text-gray-700">{record.priceSignal}</p></>} />
        </section>}
      </>}
    </main>
  );
};

const GuidanceCard = ({ record, speak, spokenRecord }) => record ? (
  <article className={`rounded-lg border p-4 ${record.level.startsWith('Urgent') ? 'border-red-300 bg-red-50' : 'border-sky-200 bg-sky-50'}`}>
    <div className="flex items-start justify-between gap-3"><div className="flex items-start gap-3"><AlertTriangle className="mt-1 shrink-0 text-sky-800" size={19} aria-hidden="true" /><div><h3 className="font-semibold text-gray-950">{record.level}</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-gray-800">{record.guidance.map((line) => <li key={line}>{line}</li>)}</ul></div></div><button type="button" onClick={() => speak(record)} className="inline-flex shrink-0 items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium hover:bg-gray-100" aria-label={spokenRecord === record.type ? 'Stop speaking guidance' : 'Read guidance aloud'}><Volume2 size={16} aria-hidden="true" />{spokenRecord === record.type ? 'Stop' : 'Listen'}</button></div>
  </article>
) : null;

const RecordSection = ({ title, records, render }) => (
  <section className="space-y-2"><h3 className="text-base font-semibold text-gray-900">{title}</h3>{records.length ? records.slice(0, 12).map((record) => <article key={record.id} className="rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-800">{render(record)}</article>) : <p className="rounded-lg border border-dashed border-gray-300 bg-white p-5 text-sm text-gray-600">No records yet.</p>}</section>
);

const PondReference = ({ ponds, selectedPondId, onChange }) => (
  <label className="block text-sm font-medium text-gray-700">Selected Pond ID
    <select required value={selectedPondId} onChange={(event) => onChange(event.target.value)} disabled={!ponds.length} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm disabled:bg-gray-100">
      <option value="">{ponds.length ? 'Choose a pond' : 'Add a pond first'}</option>
      {ponds.map((pond) => <option key={pond.id} value={pond.pondId}>{pond.pondId} · {pond.pondName}</option>)}
    </select>
  </label>
);

export default FisheriesDashboard;