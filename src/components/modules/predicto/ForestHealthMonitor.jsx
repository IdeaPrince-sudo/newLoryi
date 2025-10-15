import { useState } from 'react';

import { analyzeForestHealth } from './useForestHealth';

export default function ForestHealthMonitor() {
  const [region, setRegion] = useState('Ahafo');
  const [report, setReport] = useState(null);
  const [detectedLocation, setDetectedLocation] = useState(null); // { latitude, longitude }
  const [locationName, setLocationName] = useState(null); // { city, state }
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [error, setError] = useState(null);

  // Use browser geolocation to get lat/lon
  const handleUseMyLocation = () => {
    setError(null);
    setLoadingLocation(true);
    setLocationName(null);
    setReport(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setDetectedLocation({ latitude, longitude });
        setLoadingLocation(false);
        fetchAddressFromCoords(latitude, longitude);
      },
      () => {
        setError('Unable to retrieve your location.');
        setLoadingLocation(false);
      }
    );
  };

  // Reverse geocode lat/lon to get region
  const fetchAddressFromCoords = async (lat, lon) => {
    setLoadingAddress(true);
    setError(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );
      const json = await res.json();

      if (json.address) {
        const city =
          json.address.city ||
          json.address.town ||
          json.address.village ||
          'Unknown town';
        // Pick the region/state from returned address data
        const state = json.address.state || json.address.region || 'Unknown region';

        setLocationName({ city, state });

        // Auto-set the region dropdown to detected state if it matches known regions
        const knownRegions = ['Ahafo', 'Ashanti', 'Upper West', 'Savannah'];
        if (knownRegions.includes(state)) {
          setRegion(state);
        } else {
          setRegion('Ahafo'); // fallback default
        }
      } else {
        setLocationName({ city: 'Unknown town', state: 'Unknown region' });
        setRegion('Ahafo');
      }
    } catch {
      setLocationName({ city: 'Unknown town', state: 'Unknown region' });
      setRegion('Ahafo');
    }
    setLoadingAddress(false);
  };

  const handleCheck = () => {
    setError(null);
    if (!region) {
      setError('Please select a region.');
      return;
    }
    const result = analyzeForestHealth(region);
    setReport(result);
  };

  // Color helper as before
  const getStatusColor = (status) => {
    const s = status.toLowerCase();
    if (s.includes('good') || s.includes('low')) return 'bg-green-100 text-green-800';
    if (s.includes('moderate')) return 'bg-yellow-100 text-yellow-800';
    if (
      s.includes('poor') ||
      s.includes('high') ||
      s.includes('severe') ||
      s.includes('sparse') ||
      s.includes('declining')
    )
      return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white p-8 rounded shadow mt-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
        <span role="img" aria-label="tree">
          🌳
        </span>
        <span>Forest & Land Health Monitoring</span>
      </h2>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <select
          className="border border-green-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-lg flex-1"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          aria-label="Select Region"
          disabled={loadingLocation}
        >
          <option value="Ahafo">Ahafo</option>
          <option value="Ashanti">Ashanti</option>
          <option value="Upper West">Upper West</option>
          <option value="Savannah">Savannah</option>
        </select>

        <button
          onClick={handleUseMyLocation}
          disabled={loadingLocation}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded text-lg font-semibold transition-colors"
        >
          {loadingLocation ? 'Detecting Location...' : 'Use My Location'}
        </button>
      </div>

      {detectedLocation && (
        <div className="mb-2 text-green-800 text-lg font-semibold">
          📍 Detected Coordinates:{' '}
          <span>
            Lat: {detectedLocation.latitude.toFixed(4)}, Lon: {detectedLocation.longitude.toFixed(4)}
          </span>
        </div>
      )}

      {loadingAddress && <p className="mb-2 text-green-600">Resolving address...</p>}

      {locationName && (
        <div className="mb-6 text-green-900 text-lg font-semibold">
          🏙️ Location Name: <span>{locationName.city}</span>, <span>{locationName.state}</span>
        </div>
      )}

      <button
        onClick={handleCheck}
        disabled={!region}
        className="bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded w-full text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Analyze Forest Health
      </button>

      {error && (
        <p className="mt-4 text-red-600 font-semibold text-lg" role="alert">
          ⚠️ {error}
        </p>
      )}

      {report && (
        <div className="bg-green-50 border border-green-300 rounded p-6 text-green-900 space-y-6 mt-8 text-lg">
          <div>
            <strong>🛰️ Forest Cover Status:</strong>{' '}
            <span className={`inline-block px-3 py-1 rounded-full font-semibold ${getStatusColor(report.coverStatus)}`}>
              {report.coverStatus}
            </span>
            <p className="mt-2 text-green-800 max-w-prose">
              Indicates the current density and health of forest cover in the selected region. A <em>good</em> status
              suggests robust tree density, supporting biodiversity and climate regulation. Poor or declining status
              warns of deforestation or degradation risks.
            </p>
          </div>

          <div>
            <strong>🔥 Wildfire Risk:</strong>{' '}
            <span className={`inline-block px-3 py-1 rounded-full font-semibold ${getStatusColor(report.fireRisk)}`}>
              {report.fireRisk}
            </span>
            <p className="mt-2 text-green-800 max-w-prose">
              Reflects the likelihood of wildfires. Lower wildfire risk indicates safer environmental conditions, while
              higher risk demands urgent prevention and preparedness to protect ecosystems and communities.
            </p>
          </div>

          <div>
            <strong>🌊 Soil Salinity/Erosion:</strong>{' '}
            <span className={`inline-block px-3 py-1 rounded-full font-semibold ${getStatusColor(report.soilRisk)}`}>
              {report.soilRisk}
            </span>
            <p className="mt-2 text-green-800 max-w-prose">
              Represents soil quality and stability. Low salinity and erosion levels contribute to fertile land and
              sustainable agriculture. Elevated levels may signal environmental stress and reduced land productivity.
            </p>
          </div>

          <div>
            <strong>🌱 Degradation Alerts:</strong>{' '}
            <span className={`inline-block px-3 py-1 rounded-full font-semibold ${getStatusColor(report.degradationLevel)}`}>
              {report.degradationLevel}
            </span>
            <p className="mt-2 text-green-800 max-w-prose">
              Indicates the severity of land degradation, including loss of vegetation, soil fertility, and ecosystem
              services. Prompt interventions can help restore land health and prevent desertification.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
