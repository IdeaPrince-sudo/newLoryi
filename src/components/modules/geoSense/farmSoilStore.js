import { api } from '../../../lib/api';

const FARM_PROFILES_KEY = 'geoSenseFarmProfiles';
const PENDING_SOIL_RESULT_KEY = 'geoSensePendingSoilResult';
const MATCH_RADIUS_METERS = 100;

export const loadFarmProfiles = () => {
  try {
    const stored = localStorage.getItem(FARM_PROFILES_KEY);
    const profiles = stored ? JSON.parse(stored) : [];
    return Array.isArray(profiles) ? profiles : [];
  } catch {
    return [];
  }
};

export const saveFarmProfiles = (profiles) => {
  localStorage.setItem(FARM_PROFILES_KEY, JSON.stringify(profiles));
  window.dispatchEvent(new CustomEvent('geosense:farm-profiles-updated'));
};

export const loadPendingSoilResult = () => {
  try {
    const stored = localStorage.getItem(PENDING_SOIL_RESULT_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const clearPendingSoilResult = () => localStorage.removeItem(PENDING_SOIL_RESULT_KEY);

const distanceMeters = (first, second) => {
  const radians = (degrees) => degrees * (Math.PI / 180);
  const latDistance = radians(second.lat - first.lat);
  const lngDistance = radians(second.lng - first.lng);
  const a = Math.sin(latDistance / 2) ** 2
    + Math.cos(radians(first.lat)) * Math.cos(radians(second.lat)) * Math.sin(lngDistance / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const soilUpdatesFromResult = (result, farm) => {
  const soilData = result?.soilData || {};
  return {
    soilType: soilData.soilType ?? farm.soilType,
    pH: soilData.pH ?? farm.pH,
    moisture: soilData.moisture ?? farm.moisture,
    N: soilData.nutrients?.N ?? farm.N,
    P: soilData.nutrients?.P ?? farm.P,
    K: soilData.nutrients?.K ?? farm.K,
    organicMatter: soilData.organicMatter ?? farm.organicMatter,
    healthStatus: soilData.warning || 'Updated from latest soil test',
    latestSoilTest: result,
  };
};

export const matchOrQueueSoilResult = async ({ coords, soilData, farmerName, farmerId }) => {
  const result = {
    id: Date.now(),
    testedAt: new Date().toISOString(),
    coords: coords && Number.isFinite(coords.lat) && Number.isFinite(coords.lng) ? coords : null,
    soilData,
    farmerName: farmerName || '',
  };
  let profiles;
  let apiAvailable = true;
  try {
    profiles = await api.geoSenseFarms();
  } catch {
    profiles = loadFarmProfiles();
    apiAvailable = false;
  }
  const matchedFarm = result.coords && profiles
    .map((farm) => ({ farm, distance: farm.location ? distanceMeters(result.coords, farm.location) : Infinity }))
    .filter(({ distance }) => distance <= MATCH_RADIUS_METERS)
    .sort((first, second) => first.distance - second.distance)[0];

  if (matchedFarm) {
    const soilUpdates = soilUpdatesFromResult(result, matchedFarm.farm);
    let updatedFarm;
    if (apiAvailable) {
      try {
        updatedFarm = await api.updateGeoSenseFarm(matchedFarm.farm.id, soilUpdates);
      } catch {
        return { status: 'error', farm: matchedFarm.farm };
      }
    } else {
      updatedFarm = { ...matchedFarm.farm, ...soilUpdates };
    }
    const updatedProfiles = profiles.map((farm) => farm.id === matchedFarm.farm.id ? updatedFarm : farm);
    saveFarmProfiles(updatedProfiles);
    return { status: apiAvailable ? 'matched' : 'matched-local', farm: updatedFarm, distanceMeters: Math.round(matchedFarm.distance) };
  }

  localStorage.setItem(PENDING_SOIL_RESULT_KEY, JSON.stringify(result));
  const ownedProfiles = profiles.filter((farm) => farm.ownerId === farmerId || farm.farmerId === farmerId);
  return { status: 'needs-farm', result, farms: ownedProfiles };
};

export const updateFarmWithSoilResult = async (farmId, result, farmerId) => {
  let profiles;
  let apiAvailable = true;
  try {
    profiles = await api.geoSenseFarms();
  } catch {
    profiles = loadFarmProfiles();
    apiAvailable = false;
  }

  const farm = profiles.find((profile) => String(profile.id) === String(farmId)
    && (profile.ownerId === farmerId || profile.farmerId === farmerId));
  if (!farm) return { status: 'error', message: 'That farm could not be found. Refresh the farm list and try again.' };

  let updatedFarm;
  if (apiAvailable) {
    try {
      updatedFarm = await api.updateGeoSenseFarm(farm.id, soilUpdatesFromResult(result, farm));
    } catch {
      return { status: 'error', message: 'The farm could not be updated. Please try again when the server is available.' };
    }
  } else {
    updatedFarm = { ...farm, ...soilUpdatesFromResult(result, farm) };
  }

  const updatedProfiles = profiles.map((profile) => String(profile.id) === String(farm.id) ? updatedFarm : profile);
  saveFarmProfiles(updatedProfiles);
  clearPendingSoilResult();
  return { status: apiAvailable ? 'selected-update' : 'selected-update-local', farm: updatedFarm };
};

export const farmFromPendingSoilResult = (pending, defaults = {}) => {
  const soilData = pending?.soilData || {};
  return {
    ...defaults,
    name: defaults.name || pending?.farmerName || '',
    farmType: defaults.farmType || 'Crop',
    location: pending?.coords || null,
    soilType: soilData.soilType || '',
    pH: soilData.pH ?? '',
    moisture: soilData.moisture ?? '',
    N: soilData.nutrients?.N ?? '',
    P: soilData.nutrients?.P ?? '',
    K: soilData.nutrients?.K ?? '',
    organicMatter: soilData.organicMatter ?? '',
    healthStatus: soilData.warning || (soilData.soilType ? 'Updated from latest soil test' : ''),
    suitableCrops: Array.isArray(soilData.suitableCrops) ? soilData.suitableCrops.join(', ') : '',
    latestSoilTest: pending || null,
  };
};