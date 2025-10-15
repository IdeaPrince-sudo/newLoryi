import React, { useState } from 'react';
import { farmTypes, cropTypes, soilTypes, livestockTypes, aquaticTypes } from '../../../data/farm-data/farmTypes';

const NewProject = () => {
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
  });
  
  const [step, setStep] = useState(1);
  const [soilTestFile, setSoilTestFile] = useState(null);
  const [isCreated, setIsCreated] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setSoilTestFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, save to database
    console.log('Submitting project:', formData);
    console.log('Soil test file:', soilTestFile);
    setIsCreated(true);
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
        {step === 1 && (
          <div className="space-y-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget Estimate ($)</label>
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
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Create Project
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default NewProject;