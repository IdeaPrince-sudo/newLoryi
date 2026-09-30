import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { Activity, HeartPulse, MapPin, Radio, Thermometer } from 'lucide-react';

const suggestedHighTemperatures = { Cattle: 39.5, Goat: 40, Sheep: 40, Pig: 40, Poultry: 42.5 };
const animalIcons = { Cattle: '🐄', Goat: '🐐', Sheep: '🐑', Pig: '🐖', Poultry: '🐔' };

function parseHealthThermometer(value) {
  if (value.byteLength < 5) return null;
  const flags = value.getUint8(0);
  const raw = value.getUint32(1, true);
  let mantissa = raw & 0xffffff;
  if (mantissa & 0x800000) mantissa -= 0x1000000;
  let exponent = raw >>> 24;
  if (exponent >= 128) exponent -= 256;
  let temperature = mantissa * (10 ** exponent);
  if (flags & 1) temperature = (temperature - 32) * (5 / 9);
  return Number.isFinite(temperature) ? Math.round(temperature * 100) / 100 : null;
}

function parseEnvironmentTemperature(value) {
  if (value.byteLength < 2) return null;
  return Math.round((value.getInt16(0, true) / 100) * 100) / 100;
}

function parseHeartRate(value) {
  if (value.byteLength < 2) return null;
  const is16Bit = Boolean(value.getUint8(0) & 1);
  return is16Bit && value.byteLength >= 3 ? value.getUint16(1, true) : value.getUint8(1);
}

const LivestockMonitoring = ({ animals, records, saveRecord }) => {
  const [animalTag, setAnimalTag] = useState(animals[0]?.tag || '');
  const [thresholdC, setThresholdC] = useState(String(suggestedHighTemperatures[animals[0]?.species] || 40));
  const [sensor, setSensor] = useState({ status: 'disconnected', name: '' });
  const [latestReading, setLatestReading] = useState(null);
  const [sensorAlert, setSensorAlert] = useState(null);
  const [sensorError, setSensorError] = useState('');
  const [tracking, setTracking] = useState(false);
  const [livePosition, setLivePosition] = useState(null);
  const [locationError, setLocationError] = useState('');
  const sensorRef = useRef(null);
  const mapElementRef = useRef(null);
  const mapRef = useRef(null);
  const bodyCharacteristicRef = useRef(null);
  const environmentCharacteristicRef = useRef(null);
  const heartRateCharacteristicRef = useRef(null);
  const watchIdRef = useRef(null);
  const recordsRef = useRef(records);
  const sessionReadingsRef = useRef([]);
  const liveReadingRef = useRef(null);
  const thresholdRef = useRef(Number(thresholdC));
  const lastSensorSavedRef = useRef(0);
  const lastLocationSavedRef = useRef(0);

  useEffect(() => {
    recordsRef.current = records;
  }, [records]);

  useEffect(() => {
    thresholdRef.current = Number(thresholdC);
  }, [thresholdC]);

  useEffect(() => {
    if (!animals.some((animal) => animal.tag === animalTag) && animals[0]) {
      setAnimalTag(animals[0].tag);
      setThresholdC(String(suggestedHighTemperatures[animals[0].species] || 40));
    }
  }, [animals, animalTag]);

  useEffect(() => () => {
    if (watchIdRef.current !== null) navigator.geolocation?.clearWatch(watchIdRef.current);
    if (sensorRef.current?.gatt?.connected) sensorRef.current.gatt.disconnect();
  }, []);

  const selectedAnimal = animals.find((animal) => animal.tag === animalTag);
  const locations = useMemo(() => animals.map((animal) => {
    const latest = records
      .filter((record) => record.type === 'location' && record.animalTag === animal.tag && Number.isFinite(record.latitude) && Number.isFinite(record.longitude))
      .sort((a, b) => new Date(b.recordedAt || b.createdAt || 0) - new Date(a.recordedAt || a.createdAt || 0))[0];
    const fallback = Number.isFinite(animal.latitude) && Number.isFinite(animal.longitude) ? animal : null;
    const location = latest || fallback;
    return location ? { animal, ...location } : null;
  }).filter(Boolean), [animals, records]);

  const animalSummaries = useMemo(() => animals.map((animal) => {
    const latestReading = records
      .filter((record) => record.type === 'sensorReading' && record.animalTag === animal.tag)
      .sort((a, b) => new Date(b.capturedAt || b.createdAt || 0) - new Date(a.capturedAt || a.createdAt || 0))[0];
    const latestTriage = records
      .filter((record) => record.type === 'triage' && record.animalTag === animal.tag)
      .sort((a, b) => new Date(b.reportedAt || b.createdAt || 0) - new Date(a.reportedAt || a.createdAt || 0))[0];
    const location = locations.find((point) => point.animal.tag === animal.tag);
    const temperature = animal.tag === animalTag && liveReadingRef.current?.bodyTemperatureC !== null
      ? liveReadingRef.current?.bodyTemperatureC
      : latestReading?.bodyTemperatureC;
    const threshold = Number(latestReading?.thresholdC) || suggestedHighTemperatures[animal.species] || 40;
    const highTemperature = Number.isFinite(Number(temperature)) && Number(temperature) >= threshold;
    const healthCondition = highTemperature
      ? 'High temperature alert'
      : latestReading?.unusualChange
        ? 'Unusual temperature change'
        : latestTriage?.urgency || (latestReading ? 'No saved triage alert' : 'No health check recorded');
    return {
      animal,
      latestReading,
      latestTriage,
      location,
      temperature: temperature === undefined || temperature === null ? null : Number(temperature),
      ambientTemperature: latestReading?.ambientTemperatureC,
      heartRate: latestReading?.heartRateBpm,
      highTemperature,
      healthCondition,
    };
  }), [animals, animalTag, locations, records, latestReading]);

  const mapPoints = useMemo(() => animalSummaries.filter((summary) => summary.location), [animalSummaries]);

  const mapPosition = useMemo(() => livePosition
    ? [livePosition.latitude, livePosition.longitude]
    : locations[0]
      ? [locations[0].latitude, locations[0].longitude]
      : [7.95, -1.02], [livePosition, locations]);

  useEffect(() => {
    if (!mapElementRef.current) return undefined;
    const map = L.map(mapElementRef.current).setView([7.95, -1.02], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return undefined;
    if (livePosition || locations.length < 2) map.setView(mapPosition, livePosition || locations.length ? 14 : 7);
    else map.fitBounds(L.latLngBounds(locations.map((point) => [point.latitude, point.longitude])).pad(0.15), { maxZoom: 14 });
    const markerLayer = L.layerGroup().addTo(map);
    const points = animalSummaries.filter((summary) => summary.location || (livePosition && summary.animal.tag === animalTag));
    for (const summary of points) {
      const isLive = Boolean(livePosition && summary.animal.tag === animalTag);
      const position = isLive ? livePosition : summary.location;
      const popup = document.createElement('div');
      const name = document.createElement('strong');
      name.textContent = `${animalIcons[summary.animal.species] || '🐾'} ${summary.animal.name || summary.animal.tag}`;
      popup.append(name, document.createElement('br'));
      popup.append(document.createTextNode(`${summary.animal.species || 'Animal'} · ${summary.animal.tag}`));
      popup.append(document.createElement('br'));
      popup.append(document.createTextNode(`Health: ${summary.healthCondition}`));
      popup.append(document.createElement('br'));
      popup.append(document.createTextNode(`Body: ${summary.temperature === null ? 'No reading' : `${summary.temperature.toFixed(1)} °C${summary.highTemperature ? ' · HIGH' : ''}`}`));
      popup.append(document.createElement('br'));
      popup.append(document.createTextNode(`Ambient: ${summary.ambientTemperature === undefined ? 'No reading' : `${Number(summary.ambientTemperature).toFixed(1)} °C`}`));
      popup.append(document.createElement('br'));
      popup.append(document.createTextNode(`Heart rate: ${summary.heartRate === undefined ? 'Not measured' : `${summary.heartRate} bpm`}`));
      popup.append(document.createElement('br'));
      popup.append(document.createTextNode(`${isLive ? 'Live phone GPS' : `GPS updated ${new Date(position.recordedAt || position.createdAt || 0).toLocaleString()}`} · ${position.latitude.toFixed(5)}, ${position.longitude.toFixed(5)}`));
      const icon = L.divIcon({
        className: '',
        html: `<span style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;border:2px solid ${summary.highTemperature ? '#dc2626' : '#047857'};border-radius:50%;background:white;font-size:21px;box-shadow:0 1px 5px #0005">${animalIcons[summary.animal.species] || '🐾'}</span>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });
      L.marker([position.latitude, position.longitude], { icon }).bindPopup(popup).addTo(markerLayer);
    }
    return () => markerLayer.remove();
  }, [animalSummaries, animalTag, livePosition, locations, mapPosition]);

  const disconnectSensor = () => {
    if (sensorRef.current?.gatt?.connected) sensorRef.current.gatt.disconnect();
    sensorRef.current = null;
    bodyCharacteristicRef.current = null;
    environmentCharacteristicRef.current = null;
    heartRateCharacteristicRef.current = null;
    setSensor({ status: 'disconnected', name: '' });
  };

  const recordMeasurement = (measurement) => {
    const capturedAt = new Date().toISOString();
    const bodyTemperatureC = measurement.bodyTemperatureC ?? liveReadingRef.current?.bodyTemperatureC ?? null;
    const ambientTemperatureC = measurement.ambientTemperatureC ?? liveReadingRef.current?.ambientTemperatureC ?? null;
    const heartRateBpm = measurement.heartRateBpm ?? liveReadingRef.current?.heartRateBpm ?? null;
    const historical = recordsRef.current
      .filter((record) => record.type === 'sensorReading' && record.animalTag === animalTag && Number.isFinite(Number(record.bodyTemperatureC)))
      .map((record) => ({ value: Number(record.bodyTemperatureC), date: record.capturedAt || record.createdAt }));
    const previousReadings = [...historical, ...sessionReadingsRef.current]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
    const baselineC = previousReadings.length >= 3
      ? previousReadings.reduce((sum, reading) => sum + reading.value, 0) / previousReadings.length
      : null;
    const highTemperature = bodyTemperatureC !== null && bodyTemperatureC >= thresholdRef.current;
    const unusualChange = bodyTemperatureC !== null && baselineC !== null && Math.abs(bodyTemperatureC - baselineC) >= 1;
    const nextReading = {
      animalTag,
      bodyTemperatureC,
      ambientTemperatureC,
      heartRateBpm,
      baselineC: baselineC === null ? null : Math.round(baselineC * 100) / 100,
      thresholdC: thresholdRef.current,
      highTemperature,
      unusualChange,
      capturedAt,
    };
    setLatestReading(nextReading);
    if (bodyTemperatureC !== null) sessionReadingsRef.current = [...sessionReadingsRef.current, { value: bodyTemperatureC, date: capturedAt }].slice(-20);

    if (highTemperature || unusualChange) {
      setSensorAlert({
        severity: highTemperature ? 'urgent' : 'warning',
        message: highTemperature
          ? `${selectedAnimal?.name || animalTag} measured ${bodyTemperatureC}°C, at or above the ${thresholdRef.current}°C alert threshold. Check the animal and contact an animal-health worker.`
          : `${selectedAnimal?.name || animalTag} changed by ${Math.abs(bodyTemperatureC - baselineC).toFixed(1)}°C from its recent baseline. Recheck sensor placement and the animal; seek professional advice if the change persists.`,
      });
    } else if (ambientTemperatureC !== null && ambientTemperatureC >= 35) {
      setSensorAlert({ severity: 'warning', message: `Environment temperature is ${ambientTemperatureC}°C. Check shade, airflow and water access for ${selectedAnimal?.name || animalTag}.` });
    } else if (bodyTemperatureC !== null || ambientTemperatureC !== null) {
      setSensorAlert(null);
    }

    liveReadingRef.current = nextReading;
    if (Date.now() - lastSensorSavedRef.current >= 60000) {
      lastSensorSavedRef.current = Date.now();
      saveRecord({ type: 'sensorReading', ...nextReading, sensorName: sensorRef.current?.name || 'BLE sensor' });
    }
  };

  const connectSensor = async () => {
    setSensorError('');
    if (!navigator.bluetooth) {
      setSensorError('Bluetooth sensors are not supported in this browser. Use a supported Chromium browser on HTTPS or localhost.');
      return;
    }
    if (!animalTag) {
      setSensorError('Add and select an animal before connecting a sensor.');
      return;
    }
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['health_thermometer'] }],
        optionalServices: ['environmental_sensing', 'heart_rate'],
      });
      const server = await device.gatt.connect();
      const healthService = await server.getPrimaryService('health_thermometer');
      const bodyCharacteristic = await healthService.getCharacteristic('temperature_measurement');
      bodyCharacteristic.addEventListener('characteristicvaluechanged', (event) => {
        const temperature = parseHealthThermometer(event.target.value);
        if (temperature !== null) recordMeasurement({ bodyTemperatureC: temperature });
      });
      await bodyCharacteristic.startNotifications();
      bodyCharacteristicRef.current = bodyCharacteristic;
      sensorRef.current = device;
      setSensor({ status: 'connected', name: device.name || 'BLE health sensor' });

      try {
        const environmentService = await server.getPrimaryService('environmental_sensing');
        const environmentCharacteristic = await environmentService.getCharacteristic('temperature');
        environmentCharacteristic.addEventListener('characteristicvaluechanged', (event) => {
          const temperature = parseEnvironmentTemperature(event.target.value);
          if (temperature !== null) recordMeasurement({ ambientTemperatureC: temperature });
        });
        await environmentCharacteristic.startNotifications();
        environmentCharacteristicRef.current = environmentCharacteristic;
      } catch {
        setSensorError('Body temperature connected. This sensor does not expose the standard environmental temperature characteristic.');
      }

      try {
        const heartRateService = await server.getPrimaryService('heart_rate');
        const heartRateCharacteristic = await heartRateService.getCharacteristic('heart_rate_measurement');
        heartRateCharacteristic.addEventListener('characteristicvaluechanged', (event) => {
          const heartRateBpm = parseHeartRate(event.target.value);
          if (heartRateBpm !== null) recordMeasurement({ heartRateBpm });
        });
        await heartRateCharacteristic.startNotifications();
        heartRateCharacteristicRef.current = heartRateCharacteristic;
      } catch {
        setSensorError('Sensor connected. It does not expose standard heart-rate readings.');
      }

      device.addEventListener('gattserverdisconnected', () => {
        setSensor({ status: 'disconnected', name: '' });
        sensorRef.current = null;
      });
    } catch (connectionError) {
      if (connectionError.name !== 'NotFoundError') setSensorError(connectionError.message || 'Could not connect to the Bluetooth sensor.');
      setSensor({ status: 'disconnected', name: '' });
    }
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    watchIdRef.current = null;
    setTracking(false);
  };

  const startTracking = () => {
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('Live GPS is not available in this browser.');
      return;
    }
    if (!selectedAnimal) {
      setLocationError('Add and select an animal before starting location tracking.');
      return;
    }
    const trackedAnimal = selectedAnimal;
    setTracking(true);
    watchIdRef.current = navigator.geolocation.watchPosition(({ coords }) => {
      const position = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracyM: Math.round(coords.accuracy),
        recordedAt: new Date().toISOString(),
      };
      setLivePosition(position);
      if (Date.now() - lastLocationSavedRef.current >= 60000) {
        lastLocationSavedRef.current = Date.now();
        saveRecord({
          type: 'location',
          animalTag: trackedAnimal.tag,
          location: `${position.latitude.toFixed(5)}, ${position.longitude.toFixed(5)}`,
          ...position,
          source: 'phone-gps-live',
        });
      }
    }, (geoError) => {
      setTracking(false);
      watchIdRef.current = null;
      setLocationError(geoError.code === geoError.PERMISSION_DENIED
        ? 'Location permission was denied. Allow location access in the browser to track.'
        : 'Could not read live location. Check the device location setting and try again.');
    }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 });
  };

  const handleAnimalChange = (nextTag) => {
    if (tracking) stopTracking();
    setLivePosition(null);
    liveReadingRef.current = null;
    setLatestReading(null);
    setAnimalTag(nextTag);
    const animal = animals.find((item) => item.tag === nextTag);
    setThresholdC(String(suggestedHighTemperatures[animal?.species] || 40));
    setSensorAlert(null);
  };

  return (
    <section className="space-y-5">
      <header>
        <h2 className="text-lg font-semibold text-gray-950">Sensor health & live location</h2>
        <p className="text-sm text-gray-600">Connect a compatible BLE thermometer, monitor changes and view recent GPS positions.</p>
      </header>

      {!animals.length ? <p className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Add an animal to your herd before connecting a sensor or starting tracking.</p> : <>
        <div className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-white p-4 md:grid-cols-3">
          <label className="block text-sm font-medium text-gray-700">Tracked animal<select value={animalTag} disabled={sensor.status === 'connected'} onChange={(event) => handleAnimalChange(event.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm disabled:bg-gray-100">{animals.map((animal) => <option key={animal.id} value={animal.tag}>{animal.name || animal.tag} · {animal.species}</option>)}</select></label>
          <label className="block text-sm font-medium text-gray-700">High body-temperature alert (°C)<input type="number" min="35" max="45" step="0.1" value={thresholdC} onChange={(event) => setThresholdC(event.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" /><span className="mt-1 block text-xs font-normal text-gray-500">Suggested species threshold; verify sensor site and threshold with a veterinarian.</span></label>
          <div className="flex flex-wrap items-end gap-2">
            {sensor.status === 'connected'
              ? <button type="button" onClick={disconnectSensor} className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50"><Radio size={16} aria-hidden="true" />Disconnect sensor</button>
              : <button type="button" onClick={connectSensor} className="inline-flex items-center gap-2 rounded-md bg-emerald-800 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-900"><Radio size={16} aria-hidden="true" />Connect BLE sensor</button>}
            <span className={`rounded-full px-2 py-1 text-xs font-semibold ${sensor.status === 'connected' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'}`}>{sensor.status === 'connected' ? sensor.name : 'Sensor disconnected'}</span>
          </div>
        </div>

        {(sensorError || sensorAlert || locationError) && <div role={sensorAlert ? 'alert' : 'status'} className={`space-y-1 rounded-md border p-3 text-sm ${sensorAlert?.severity === 'urgent' ? 'border-red-300 bg-red-50 text-red-900' : sensorAlert ? 'border-amber-300 bg-amber-50 text-amber-900' : 'border-gray-200 bg-gray-50 text-gray-700'}`}>
          {sensorAlert && <p className="font-semibold">{sensorAlert.message}</p>}{sensorError && <p>{sensorError}</p>}{locationError && <p>{locationError}</p>}
        </div>}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Metric label="Body temperature" value={latestReading?.bodyTemperatureC !== null && latestReading?.bodyTemperatureC !== undefined ? `${latestReading.bodyTemperatureC.toFixed(1)} °C` : 'Waiting for sensor'} icon={Thermometer} />
          <Metric label="Environment temperature" value={latestReading?.ambientTemperatureC !== null && latestReading?.ambientTemperatureC !== undefined ? `${latestReading.ambientTemperatureC.toFixed(1)} °C` : 'Not provided'} icon={Activity} />
          <Metric label="Recent body baseline" value={latestReading?.baselineC !== null && latestReading?.baselineC !== undefined ? `${latestReading.baselineC.toFixed(1)} °C` : 'Building baseline'} icon={Activity} />
        </div>

        {latestReading && <p className="text-xs text-gray-500">Last sensor update: {new Date(latestReading.capturedAt).toLocaleString()}. Baseline-change alerts begin after 3 prior readings have been collected.</p>}

        <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-semibold text-gray-950">Herd location map</h3><p className="text-sm text-gray-600">Showing {mapPoints.length} of {animals.length} animals with GPS coordinates{livePosition ? ` · live phone GPS ±${livePosition.accuracyM} m` : ''}</p></div><button type="button" disabled={!selectedAnimal} onClick={tracking ? stopTracking : startTracking} className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-60"><MapPin size={16} aria-hidden="true" />{tracking ? 'Stop live GPS' : 'Start live GPS'}</button></div>
          <div ref={mapElementRef} role="application" aria-label="Map of animal locations" className="h-[360px] w-full rounded-md" />
          <p className="text-xs text-amber-900">Location is from this device’s GPS, not the BLE thermometer. It tracks the animal only while this phone is carried with it and this page stays open. A collar’s built-in GPS requires that device’s supported location protocol.</p>
        </div>

        <section className="space-y-3">
          <div><h3 className="text-base font-semibold text-gray-950">All livestock · health & vitals</h3><p className="text-sm text-gray-600">Current values come from each animal’s latest saved sensor reading and symptom-triage note.</p></div>
          {animalSummaries.map((summary) => {
            const { animal, latestReading, latestTriage, temperature, ambientTemperature, heartRate, highTemperature, location } = summary;
            return <article key={animal.id} className={`rounded-md border p-4 ${highTemperature || /urgent/i.test(summary.healthCondition) ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3"><span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-2xl">{animalIcons[animal.species] || '🐾'}</span><div><h4 className="font-semibold text-gray-950">{animal.name || animal.tag}</h4><p className="text-xs text-gray-600">{animal.tag} · {animal.species}{animal.breed ? ` · ${animal.breed}` : ''}</p></div></div>
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${highTemperature || /urgent|same-day/i.test(summary.healthCondition) ? 'bg-red-100 text-red-900' : latestTriage ? 'bg-amber-100 text-amber-900' : 'bg-gray-100 text-gray-700'}`}>{summary.healthCondition}</span>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                <Vital label="Body temperature" value={temperature === null ? 'No sensor reading' : `${temperature.toFixed(1)} °C${highTemperature ? ' · HIGH' : ''}`} alert={highTemperature} />
                <Vital label="Environment" value={ambientTemperature === undefined ? 'Not measured' : `${Number(ambientTemperature).toFixed(1)} °C`} />
                <Vital label="Heart rate" value={heartRate === undefined ? 'Not measured' : `${heartRate} bpm`} />
                <Vital label="GPS" value={location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 'No location recorded'} />
              </dl>
              {latestTriage && <p className="mt-3 text-sm text-gray-700"><strong>Latest health note:</strong> {latestTriage.symptoms} <span className="text-gray-500">· {new Date(latestTriage.reportedAt || latestTriage.createdAt).toLocaleDateString()}</span></p>}
              <p className="mt-2 text-xs text-gray-500">Last sensor update: {latestReading ? new Date(latestReading.capturedAt || latestReading.createdAt).toLocaleString() : 'No sensor readings saved'}</p>
            </article>;
          })}
          <p className="text-xs text-gray-500">Only body temperature, ambient temperature and heart rate are displayed when a compatible sensor supplies them. Respiratory rate, blood oxygen and other vitals are not measured by this BLE integration.</p>
        </section>
      </>}

      <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-xs leading-5 text-gray-600">
        BLE compatibility: this page reads the standard Bluetooth Health Thermometer service (body temperature) and, when exposed, Environmental Sensing temperature. Many animal wearables use vendor-specific GATT services and will need their model/protocol added. Sensor thresholds are configurable screening alerts, not a diagnosis.
      </div>

      <section className="space-y-2"><h3 className="text-base font-semibold text-gray-900">Recent sensor readings</h3>{records.filter((record) => record.type === 'sensorReading' && record.animalTag === animalTag).slice(0, 10).map((record) => <article key={record.id} className={`rounded-md border p-3 text-sm ${record.highTemperature || record.unusualChange ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-white'}`}><strong>{record.bodyTemperatureC !== null && record.bodyTemperatureC !== undefined ? `${Number(record.bodyTemperatureC).toFixed(1)} °C body` : 'Environment update'}{record.ambientTemperatureC !== null && record.ambientTemperatureC !== undefined ? ` · ${Number(record.ambientTemperatureC).toFixed(1)} °C ambient` : ''}</strong><p className="mt-1 text-gray-600">{new Date(record.capturedAt || record.createdAt).toLocaleString()}{record.highTemperature ? ' · High temperature alert' : ''}{record.unusualChange ? ' · Unusual baseline change' : ''}</p></article>)}</section>
    </section>
  );
};

const Metric = ({ label, value, icon: Icon }) => (
  <div className="flex items-center gap-3 rounded-md border border-gray-200 bg-white p-4"><Icon size={20} className="text-emerald-800" aria-hidden="true" /><div className="min-w-0"><p className="text-xs text-gray-600">{label}</p><p className="truncate text-sm font-semibold text-gray-950">{value}</p></div></div>
);

const Vital = ({ label, value, alert = false }) => (
  <div><dt className="text-xs text-gray-500">{label}</dt><dd className={`mt-1 font-semibold ${alert ? 'text-red-800' : 'text-gray-900'}`}>{value}</dd></div>
);

export default LivestockMonitoring;