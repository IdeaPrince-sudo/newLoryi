import React, { useEffect, useState } from 'react';
import { farmTypes, cropTypes, soilTypes, livestockTypes, aquaticTypes } from '../../../data/farm-data/farmTypes';
import { api } from '../../../lib/api';

const NewProject = () => {
  const [registeredFarms, setRegisteredFarms] = useState([]);
  const [farmLoadError, setFarmLoadError] = useState('');
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    farmType: '',
    cropType: '',
    livestockType: '',
    aquaticType: '',
    location: '',
    landSize: '',
    sizeUnit: 'acres',
    soilType: '',
    soilpH: '',
    soilMoisture: '',
    startDate: '',
    expectedHarvestDate: '',
    budget: '',
    expenses: '',
    estimatedYield: '',
    estimatedRevenue: '',
    status: 'planned',
  });
  
  const [step, setStep] = useState(1);
  const [soilTestFile, setSoilTestFile] = useState(null);
  const [isCreated, setIsCreated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimateError, setEstimateError] = useState('');
  const [estimateResult, setEstimateResult] = useState(null);

  useEffect(() => {
    let active = true;
    api.geoSenseFarms()
      .then((farms) => { if (active) setRegisteredFarms(Array.isArray(farms) ? farms : []); })
      .catch((error) => { if (active) setFarmLoadError(error.message || 'Registered farms could not be loaded.'); });
    return () => { active = false; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setEstimateResult(null);
  };

  const handleFileChange = (e) => {
    setSoilTestFile(e.target.files[0]);
  };

  const handleRegisteredFarmChange = (event) => {
    const farmId = event.target.value;
    setSelectedFarmId(farmId);
    const farm = registeredFarms.find((profile) => String(profile.id) === farmId);
    if (!farm) return;

    const farmType = String(farm.farmType || '').toLowerCase();
    const normalizedFarmType = farmType.includes('livestock') ? 'livestock' : farmType.includes('aquatic') ? 'aquatic' : 'crop';
    const suitableCrops = Array.isArray(farm.suitableCrops) ? farm.suitableCrops.join(' ').toLowerCase() : String(farm.suitableCrops || '').toLowerCase();
    const cropType = /corn|maize|wheat|rice|sorghum|millet|grain/.test(suitableCrops) ? 'grain'
      : /bean|pea|lentil|legume/.test(suitableCrops) ? 'legume'
        : /potato|yam|cassava|tuber/.test(suitableCrops) ? 'tuber'
          : /tomato|pepper|vegetable|okra|lettuce/.test(suitableCrops) ? 'vegetable'
            : /banana|plantain|mango|fruit|melon/.test(suitableCrops) ? 'fruit' : suitableCrops ? 'other' : '';
    const registeredSoilType = String(farm.soilType || '').trim();
    const normalizedSoilType = registeredSoilType.toLowerCase().replace(/\s+soil$/, '').trim();
    const matchingSoilType = soilTypes.find((item) => item.id === normalizedSoilType || item.name.toLowerCase().replace(/\s+soil$/, '') === normalizedSoilType);
    const landSizeText = String(farm.landSize || '');
    const landSize = landSizeText.match(/[\d.]+/)?.[0] || '';
    const unitText = landSizeText.replace(/[\d.\s]/g, '').toLowerCase();
    const sizeUnit = unitText.includes('ha') ? 'hectares' : unitText.includes('sqm') || unitText.includes('m2') ? 'sqm' : unitText.includes('plot') ? 'plots' : 'acres';
    const livestockType = String(farm.livestock || '').split(',')[0].trim().toLowerCase();
    const knownLivestock = livestockTypes.find((item) => item.id === livestockType || item.name.toLowerCase() === livestockType);
    const aquaticType = String(farm.aquatic || '').toLowerCase().includes('fish') ? 'fish' : '';

    setFormData((current) => ({
      ...current,
      name: current.name || `${farm.farmName || 'Farm'} project`,
      farmType: normalizedFarmType,
      cropType,
      livestockType: knownLivestock?.id || '',
      aquaticType,
      location: farm.locationDescription || farm.region || farm.farmName || '',
      landSize,
      sizeUnit,
      soilType: matchingSoilType?.id || registeredSoilType,
      soilpH: farm.pH ?? '',
      soilMoisture: farm.moisture === '' || farm.moisture === undefined ? '' : String(farm.moisture),
    }));
    setEstimateResult(null);
  };

  const handleGenerateEstimates = async () => {
    setEstimateError('');
    setEstimateResult(null);
    if (!Number(formData.budget) || !Number(formData.landSize)) {
      setEstimateError('Enter the budget and land size before generating estimates.');
      return;
    }

    setIsEstimating(true);
    try {
      const result = await api.estimateFarmProject(formData);
      setFormData((current) => ({
        ...current,
        expenses: String(result.expenses),
        estimatedYield: String(result.estimatedYield),
        estimatedRevenue: String(result.estimatedRevenue),
      }));
      setEstimateResult(result);
    } catch (error) {
      setEstimateError(error.message || 'AI estimates could not be generated. Please try again.');
    } finally {
      setIsEstimating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError('');
    try {
      await api.createFarmProject({
        ...formData,
        landSize: Number(formData.landSize),
        soilpH: formData.soilpH === '' ? null : Number(formData.soilpH),
        budget: Number(formData.budget),
        expenses: Number(formData.expenses || 0),
        estimatedYield: Number(formData.estimatedYield || 0),
        estimatedRevenue: Number(formData.estimatedRevenue || 0),
        status: formData.status,
        activities: [],
        soilTestFileName: soilTestFile?.name || null,
        registeredFarmId: selectedFarmId || null,
        registeredFarmName: registeredFarms.find((farm) => String(farm.id) === selectedFarmId)?.farmName || null,
      });
      setIsCreated(true);
    } catch (error) {
      setSaveError(error.message || 'The project could not be saved. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const nextStep = () => {
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  const renderFarmTypeSpecificFields = () => {
    if (formData.farmType === 'crop') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Crop Type</label>
            <select 
              name="cropType" 
              value={formData.cropType} 
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Select Crop Type</option>
              {cropTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Soil Type</label>
            <select 
              name="soilType" 
              value={formData.soilType} 
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select Soil Type</option>
              {soilTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
              {formData.soilType && !soilTypes.some((type) => type.id === formData.soilType) && (
                <option value={formData.soilType}>{formData.soilType}</option>
              )}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Soil pH</label>
              <input 
                type="number" 
                name="soilpH" 
                step="0.1"
                min="0"
                max="14"
                value={formData.soilpH} 
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="e.g., 6.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Soil Moisture %</label>
              <input 
                type="text" 
                name="soilMoisture" 
                value={formData.soilMoisture} 
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="e.g., 35%"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Soil Test Results (Optional)</label>
            <input 
              type="file" 
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            <p className="text-xs text-gray-500 mt-1">Upload soil test results in PDF or image format</p>
          </div>
        </div>
      );
    } else if (formData.farmType === 'livestock') {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Livestock Type</label>
          <select 
            name="livestockType" 
            value={formData.livestockType} 
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">Select Livestock Type</option>
            {livestockTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>
      );
    } else if (formData.farmType === 'aquatic') {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Aquatic Farming Type</label>
          <select 
            name="aquaticType" 
            value={formData.aquaticType} 
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">Select Aquatic Type</option>
            {aquaticTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>
      );
    }
    return null;
  };

  if (isCreated) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Project Created Successfully!</h3>
          <p className="mt-2 text-sm text-gray-500">
            Your new farm project "{formData.name}" has been created successfully.
          </p>
          <div className="mt-5">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              onClick={() => setIsCreated(false)}
            >
              Create Another Project
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Create New Farm Project</h2>
      
      <div className="mb-6">
        <div className="flex items-center">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${(step / 3) * 100}%` }}></div>
          </div>
          <span className="ml-4 text-sm font-medium text-gray-700">Step {step} of 3</span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        {saveError && <p role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{saveError}</p>}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label htmlFor="registeredFarm" className="block text-sm font-medium text-gray-700 mb-1">Start from a registered farm</label>
              <select id="registeredFarm" value={selectedFarmId} onChange={handleRegisteredFarmChange} className="w-full p-2 border border-gray-300 rounded-md">
                <option value="">Create project without a farm profile</option>
                {registeredFarms.map((farm) => <option key={farm.id} value={farm.id}>{farm.farmName}{farm.region ? ` · ${farm.region}` : ''}</option>)}
              </select>
              {farmLoadError && <p role="alert" className="mt-1 text-xs text-amber-700">{farmLoadError}</p>}
              {!!registeredFarms.length && <p className="mt-1 text-xs text-gray-500">Selecting a farm fills in its saved location and soil profile. You can edit the project details before saving.</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="e.g., Summer Corn 2024"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Farm Type</label>
              <select 
                name="farmType" 
                value={formData.farmType} 
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select Farm Type</option>
                {farmTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
            
            {formData.farmType && renderFarmTypeSpecificFields()}
            
            <div className="flex justify-end">
              <button
                type="button"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                onClick={nextStep}
              >
                Next
              </button>
            </div>
          </div>
        )}
        
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input 
                type="text" 
                name="location" 
                value={formData.location} 
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="e.g., North Field"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Land Size</label>
                <input 
                  type="number" 
                  name="landSize" 
                  min="0"
                  step="0.01"
                  value={formData.landSize} 
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="e.g., 50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select 
                  name="sizeUnit" 
                  value={formData.sizeUnit} 
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="acres">Acres</option>
                  <option value="hectares">Hectares</option>
                  <option value="sqm">Square Meters</option>
                  <option value="plots">Plots</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                onClick={prevStep}
              >
                Previous
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                onClick={nextStep}
              >
                Next
              </button>
            </div>
          </div>
        )}
        
        {step === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input 
                  type="date" 
                  name="startDate" 
                  value={formData.startDate} 
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Harvest Date</label>
                <input 
                  type="date" 
                  name="expectedHarvestDate" 
                  value={formData.expectedHarvestDate} 
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget Estimate (GHS)</label>
              <input 
                type="number" 
                name="budget" 
                min="0"
                step="0.01"
                value={formData.budget} 
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="e.g., 10000"
                required
              />
              <button
                type="button"
                onClick={handleGenerateEstimates}
                disabled={isEstimating || !formData.budget || !formData.landSize}
                className="mt-2 rounded-md border border-green-700 px-3 py-2 text-sm font-medium text-green-800 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isEstimating ? 'Estimating with Loryi AI…' : 'Generate AI estimates'}
              </button>
              {estimateError && <p role="alert" className="mt-2 text-sm text-red-700">{estimateError}</p>}
              {estimateResult && (
                <div role="status" className="mt-3 rounded-md border border-sky-200 bg-sky-50 p-3 text-sm text-sky-950">
                  <p className="font-medium">Planning suggestions generated · {estimateResult.confidence} confidence</p>
                  <p className="mt-1">{estimateResult.rationale}</p>
                  {estimateResult.assumptions?.length > 0 && (
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      {estimateResult.assumptions.map((assumption, index) => <li key={index}>{assumption}</li>)}
                    </ul>
                  )}
                  <p className="mt-2 text-xs">Review and edit all suggested values. They are planning estimates, not actual expenses or guaranteed returns.</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-gray-700">Current Expenses (GHS)
                <input type="number" name="expenses" min="0" step="0.01" value={formData.expenses} onChange={handleChange} className="mt-1 w-full rounded-md border border-gray-300 p-2" placeholder="0" />
              </label>
              <label className="block text-sm font-medium text-gray-700">Estimated Yield (kg)
                <input type="number" name="estimatedYield" min="0" step="0.01" value={formData.estimatedYield} onChange={handleChange} className="mt-1 w-full rounded-md border border-gray-300 p-2" placeholder="Optional" />
              </label>
              <label className="block text-sm font-medium text-gray-700">Estimated Revenue (GHS)
                <input type="number" name="estimatedRevenue" min="0" step="0.01" value={formData.estimatedRevenue} onChange={handleChange} className="mt-1 w-full rounded-md border border-gray-300 p-2" placeholder="Optional" />
              </label>
              <label className="block text-sm font-medium text-gray-700">Project Status
                <select name="status" value={formData.status} onChange={handleChange} className="mt-1 w-full rounded-md border border-gray-300 p-2">
                  <option value="planned">Planned</option>
                  <option value="active">Active</option>
                </select>
              </label>
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                onClick={prevStep}
              >
                Previous
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-60"
              >
                {isSaving ? 'Saving project…' : 'Create Project'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default NewProject;