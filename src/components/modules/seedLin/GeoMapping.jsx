import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';

const mockSeedLocations = [
  { id: 1, type: 'Organic', name: 'Heirloom Tomato', lat: 37.7749, lng: -122.4194, supplier: 'EcoSeed Organics', place: 'San Francisco' },
  { id: 2, type: 'GMO', name: 'BT Corn', lat: 40.7128, lng: -74.006, supplier: 'AgriTech Genetics', place: 'New York' },
  { id: 3, type: 'Organic', name: 'Heritage Wheat', lat: 51.5074, lng: -0.1278, supplier: 'Natural Farms Co-op', place: 'London' },
  { id: 4, type: 'GMO', name: 'RR Soybean', lat: 41.8781, lng: -87.6298, supplier: 'GenSeed Technologies', place: 'Chicago' },
  { id: 5, type: 'Organic', name: 'Wild Rice', lat: 48.8566, lng: 2.3522, supplier: 'Traditional Seed Bank', place: 'Paris' },
];

const GeoMapping = () => {
  const [activeLayer, setActiveLayer] = useState('seeds');
  const [viewMode, setViewMode] = useState('map');
  const [searchQuery, setSearchQuery] = useState('');
  const mapElementRef = useRef(null);
  const mapRef = useRef(null);
  const markerLayerRef = useRef(null);
  const tileLayerRef = useRef(null);
  const filteredSeedLocations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return mockSeedLocations;
    return mockSeedLocations.filter((location) =>
      [location.name, location.type, location.supplier, location.place].some((value) => value.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  useEffect(() => {
    if (!mapElementRef.current) return undefined;
    const map = L.map(mapElementRef.current, { scrollWheelZoom: true }).setView([30, -35], 2);
    markerLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    const resizeObserver = typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(() => map.invalidateSize());
    resizeObserver?.observe(mapElementRef.current);
    requestAnimationFrame(() => map.invalidateSize());

    return () => {
      resizeObserver?.disconnect();
      map.remove();
      mapRef.current = null;
      markerLayerRef.current = null;
      tileLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    tileLayerRef.current?.remove();
    const tileLayer = viewMode === 'satellite'
      ? L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri',
        maxZoom: 18,
      })
      : L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      });
    tileLayer.addTo(map);
    tileLayerRef.current = tileLayer;
  }, [viewMode]);

  useEffect(() => {
    const map = mapRef.current;
    const markerLayer = markerLayerRef.current;
    if (!map || !markerLayer) return;
    markerLayer.clearLayers();
    if (activeLayer !== 'seeds') return;

    filteredSeedLocations.forEach((location) => {
      const color = location.type === 'Organic' ? '#16803c' : '#dc2626';
      L.circleMarker([location.lat, location.lng], {
        radius: 9,
        color: '#ffffff',
        weight: 2,
        fillColor: color,
        fillOpacity: 0.95,
      })
        .bindPopup(`<strong>${location.name}</strong><br>${location.type} seed source<br>${location.supplier}<br>${location.place}`)
        .addTo(markerLayer);
    });

    if (filteredSeedLocations.length > 1) {
      map.fitBounds(L.latLngBounds(filteredSeedLocations.map(({ lat, lng }) => [lat, lng])).pad(0.16), { maxZoom: 5 });
    } else if (filteredSeedLocations.length === 1) {
      const [location] = filteredSeedLocations;
      map.setView([location.lat, location.lng], 7);
    }
  }, [activeLayer, filteredSeedLocations]);

  const resetMapView = () => {
    const map = mapRef.current;
    if (!map) return;
    if (activeLayer === 'seeds' && filteredSeedLocations.length > 1) {
      map.fitBounds(L.latLngBounds(filteredSeedLocations.map(({ lat, lng }) => [lat, lng])).pad(0.16), { maxZoom: 5 });
    } else if (activeLayer === 'seeds' && filteredSeedLocations.length === 1) {
      const [location] = filteredSeedLocations;
      map.setView([location.lat, location.lng], 7);
    } else {
      map.setView([30, -35], 2);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">GeoFencing & Mapping</h1>
      <p className="text-gray-600 mb-8">
        Explore seed sources, GMO regulations, and organic seed distribution on our interactive map.
        Use geofencing features to monitor and protect organic growing areas.
      </p>

      {/* Controls and Search */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search */}
          <div className="w-full md:w-1/3">
            <form onSubmit={(event) => event.preventDefault()}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search locations or seeds..."
                  className="w-full border border-gray-300 rounded-full px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <svg className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </form>
          </div>

          {/* Layer Controls */}
          <div className="flex space-x-2">
            <button 
              className={`px-3 py-1 rounded-md ${activeLayer === 'seeds' ? 'bg-green-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              onClick={() => setActiveLayer('seeds')}
            >
              Seeds
            </button>
            <button 
              className={`px-3 py-1 rounded-md ${activeLayer === 'regulations' ? 'bg-green-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              onClick={() => setActiveLayer('regulations')}
            >
              GMO Regulations
            </button>
            <button 
              className={`px-3 py-1 rounded-md ${activeLayer === 'geofences' ? 'bg-green-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              onClick={() => setActiveLayer('geofences')}
            >
              GeoFences
            </button>
          </div>

          {/* View Controls */}
          <div className="flex border rounded-md overflow-hidden">
            <button
              className={`px-4 py-2 ${viewMode === 'map' ? 'bg-green-700 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              onClick={() => setViewMode('map')}
            >
              Map
            </button>
            <button
              className={`px-4 py-2 ${viewMode === 'satellite' ? 'bg-green-700 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              onClick={() => setViewMode('satellite')}
            >
              Satellite
            </button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="relative bg-gray-100" style={{ height: '500px' }}>
          <div ref={mapElementRef} className="h-full w-full" aria-label="Seed source map" />
          {activeLayer !== 'seeds' && (
            <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded bg-white/95 px-4 py-2 text-sm text-gray-700 shadow" role="status">
              {activeLayer === 'regulations'
                ? 'Regulatory boundary data is not connected.'
                : 'No geofence coordinates are recorded yet.'}
            </div>
          )}

          {activeLayer === 'seeds' && filteredSeedLocations.length === 0 && (
            <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded bg-white/95 px-4 py-2 text-sm text-gray-700 shadow" role="status">
              No seed locations match “{searchQuery}”.
            </div>
          )}

          <div className="absolute bottom-4 left-4 rounded-md bg-white/95 p-3 shadow-md">
            <h3 className="mb-2 font-medium text-gray-700">{activeLayer === 'seeds' ? 'Seed sources' : activeLayer === 'regulations' ? 'GMO regulations' : 'GeoFences'}</h3>
            {activeLayer === 'seeds' ? (
              <div className="space-y-2">
                <div className="flex items-center"><span className="mr-2 h-3 w-3 rounded-full bg-green-600" /><span className="text-sm">Organic seeds</span></div>
                <div className="flex items-center"><span className="mr-2 h-3 w-3 rounded-full bg-red-600" /><span className="text-sm">GMO seeds</span></div>
              </div>
            ) : (
              <p className="max-w-52 text-xs text-gray-600">Connect a boundary dataset to display this layer.</p>
            )}
          </div>

          <div className="absolute right-4 top-4 flex flex-col overflow-hidden rounded-md bg-white shadow-md">
            <button type="button" className="p-2 hover:bg-gray-100" aria-label="Zoom in" title="Zoom in" onClick={() => mapRef.current?.zoomIn()}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" /></svg>
            </button>
            <button type="button" className="border-t border-gray-200 p-2 hover:bg-gray-100" aria-label="Zoom out" title="Zoom out" onClick={() => mapRef.current?.zoomOut()}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
            </button>
            <button type="button" className="border-t border-gray-200 p-2 hover:bg-gray-100" aria-label="Reset map view" title="Reset map view" onClick={resetMapView}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
            </button>
          </div>
        </div>

        {/* Seed Data Table */}
        <div className="p-4">
          <h3 className="text-xl font-bold mb-4">Seed Locations</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coordinates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSeedLocations.map((location) => (
                  <tr key={location.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{location.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${location.type === 'Organic' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {location.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{location.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{location.supplier}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button className="text-blue-600 hover:text-blue-800 mr-3">View</button>
                      <button className="text-green-600 hover:text-green-800">Track</button>
                    </td>
                  </tr>
                ))}
                {filteredSeedLocations.length === 0 && (
                  <tr><td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500">No seed locations match your search.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* GeoFencing Controls */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">GeoFencing Controls</h3>
        <p className="text-gray-600 mb-6">
          Create and manage geofences to protect organic growing areas and monitor GMO containment.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-bold text-lg mb-4">Create New GeoFence</h4>
            <form>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">GeoFence Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Organic Farm Perimeter"
                    className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2">Type</label>
                  <select className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option>Organic Protection Zone</option>
                    <option>GMO Containment Area</option>
                    <option>Testing Region</option>
                    <option>Custom Zone</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2">Alert Settings</label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input type="checkbox" id="alert-entry" className="mr-2" />
                      <label htmlFor="alert-entry">Alert on Entry</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="alert-exit" className="mr-2" />
                      <label htmlFor="alert-exit">Alert on Exit</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="alert-gmo" className="mr-2" />
                      <label htmlFor="alert-gmo">Alert on GMO Detection</label>
                    </div>
                  </div>
                </div>
                
                <button className="bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded">
                  Draw GeoFence on Map
                </button>
              </div>
            </form>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Active GeoFences</h4>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded p-4 hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <h5 className="font-medium">Organic Valley Farm</h5>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Active</span>
                </div>
                <p className="text-gray-600 text-sm mt-2">10 acre perimeter, 3 active alerts</p>
                <div className="flex space-x-3 mt-3">
                  <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
                  <button className="text-yellow-600 hover:text-yellow-800 text-sm">Edit</button>
                  <button className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded p-4 hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <h5 className="font-medium">GMO Test Field #12</h5>
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Monitored</span>
                </div>
                <p className="text-gray-600 text-sm mt-2">5 acre perimeter, containment active</p>
                <div className="flex space-x-3 mt-3">
                  <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
                  <button className="text-yellow-600 hover:text-yellow-800 text-sm">Edit</button>
                  <button className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeoMapping;