import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { 
  fertilizerRecommendations, 
  soilTypes, 
  weatherForecast 
} from '../fertiWiseData';
import { useAuth } from '../../../../contexts/AuthContext';
import { api } from '../../../../lib/api';
import { loadFarmProfiles } from '../../geoSense/farmSoilStore';

const normalizeSoilType = (value = '') => {
  const soilName = value.toLowerCase();
  if (soilName.includes('clay')) return 'Clay';
  if (soilName.includes('sand')) return 'Sandy';
  if (soilName.includes('loam')) return 'Loamy';
  if (soilName.includes('silt')) return 'Silt';
  if (soilName.includes('peat')) return 'Peaty';
  return '';
};

const landSizeInHectares = (value) => {
  const size = Number.parseFloat(String(value || '').replace(',', '.'));
  if (!Number.isFinite(size) || size <= 0) return null;
  if (/\bacre|\bac\b/i.test(String(value))) return size * 0.404686;
  return size;
};

const farmCropChoices = (farm) => {
  const suitableCrops = Array.isArray(farm.suitableCrops)
    ? farm.suitableCrops
    : String(farm.suitableCrops || '').split(',');
  return [farm.crop, farm.cropType, ...suitableCrops]
    .map((crop) => String(crop || '').trim())
    .filter((crop) => crop && crop.toLowerCase() !== 'none');
};

const farmPrefillValues = (farm) => ({
  soilType: normalizeSoilType(farm.soilType),
  crop: farmCropChoices(farm)[0] || '',
  landSize: landSizeInHectares(farm.landSize),
  pH: farm.pH !== '' && farm.pH !== null && farm.pH !== undefined && Number.isFinite(Number(farm.pH)) ? Number(farm.pH) : null,
  organicMatter: farm.organicMatter !== '' && farm.organicMatter !== null && farm.organicMatter !== undefined && Number.isFinite(Number(farm.organicMatter)) ? Number(farm.organicMatter) : null,
});

const FertilizerRecommendations = () => {
  const { currentUser } = useAuth();
  const [farms, setFarms] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [farmLoadMessage, setFarmLoadMessage] = useState('');
  const [selectedSoilType, setSelectedSoilType] = useState('');
  const [selectedCropType, setSelectedCropType] = useState('');
  const [landSize, setLandSize] = useState('');
  const [soilPH, setSoilPH] = useState(6.5);
  const [organicMatter, setOrganicMatter] = useState(3.0);
  const [previousYield, setPreviousYield] = useState('');
  const [weatherCondition, setWeatherCondition] = useState('');
  const [recommendations, setRecommendations] = useState(null);
  const [saveState, setSaveState] = useState({ status: 'idle', message: '' });
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    let active = true;
    const loadFarms = async () => {
      try {
        const profiles = await api.geoSenseFarms();
        if (active) {
          const ownedFarms = profiles.filter((farm) => farm.ownerId === currentUser?.id || farm.farmerId === currentUser?.id);
          setFarms(ownedFarms);
          if (ownedFarms.length === 1) {
            const onlyFarm = ownedFarms[0];
            const values = farmPrefillValues(onlyFarm);
            setSelectedFarmId(String(onlyFarm.id));
            setSelectedSoilType(values.soilType);
            setSelectedCropType(values.crop);
            setLandSize(values.landSize ?? '');
            if (values.pH !== null) setSoilPH(values.pH);
            if (values.organicMatter !== null) setOrganicMatter(values.organicMatter);
          }
          setFarmLoadMessage('');
        }
      } catch {
        if (!active) return;
        const localProfiles = loadFarmProfiles().filter((farm) => farm.ownerId === currentUser?.id || farm.farmerId === currentUser?.id);
        setFarms(localProfiles);
        if (localProfiles.length === 1) {
          const onlyFarm = localProfiles[0];
          const values = farmPrefillValues(onlyFarm);
          setSelectedFarmId(String(onlyFarm.id));
          setSelectedSoilType(values.soilType);
          setSelectedCropType(values.crop);
          setLandSize(values.landSize ?? '');
          if (values.pH !== null) setSoilPH(values.pH);
          if (values.organicMatter !== null) setOrganicMatter(values.organicMatter);
        }
        setFarmLoadMessage(localProfiles.length ? 'Showing farm profiles saved in this browser; server data could not be loaded.' : 'Farm profiles could not be loaded. You can still enter soil details manually.');
      }
    };
    loadFarms();
    return () => { active = false; };
  }, [currentUser?.id]);

  const selectedFarm = farms.find((farm) => String(farm.id) === selectedFarmId);

  const handleFarmChange = (event) => {
    const farmId = event.target.value;
    setSelectedFarmId(farmId);
    setRecommendations(null);
    const farm = farms.find((profile) => String(profile.id) === farmId);
    if (!farm) return;

    const values = farmPrefillValues(farm);
    setSelectedSoilType(values.soilType);
    setSelectedCropType(values.crop);
    setLandSize(values.landSize ?? '');
    if (values.pH !== null) setSoilPH(values.pH);
    if (values.organicMatter !== null) setOrganicMatter(values.organicMatter);
  };

  // Extract unique crop types from recommendations
  const profileCrops = farms.flatMap(farmCropChoices);
  const cropTypes = [...new Set([...fertilizerRecommendations.map((rec) => rec.cropType), ...profileCrops])];
  
  // Get current season from the weather forecast
  const currentSeason = weatherForecast[0].month;

  const handleGenerateRecommendations = () => {
    setSaveState({ status: 'idle', message: '' });
    const errors = {};
    if (!selectedCropType) errors.crop = 'Select a crop to continue.';
    if (!Number.isFinite(Number(landSize)) || Number(landSize) <= 0) errors.landSize = 'Enter a farm size greater than 0 hectares.';
    if (!selectedSoilType) errors.soilType = 'Select a soil type to continue.';
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      return;
    }

    // Find base recommendation
    const baseRecommendation = fertilizerRecommendations.find(
      rec => rec.soilType === selectedSoilType && rec.cropType === selectedCropType
    ) || fertilizerRecommendations.find(
      rec => rec.soilType === selectedSoilType
    );

    if (!baseRecommendation) {
      setRecommendations({
        message: "We don't have specific recommendations for this combination. Please consult with an agricultural expert.",
        fertilizers: []
      });
      return;
    }

    // Adjust based on land size
    const adjustedFertilizers = baseRecommendation.recommendedFertilizers.map(fert => {
      const baseDosage = parseFloat(fert.dosage.replace(/[^\d.-]/g, ''));
      const unit = fert.dosage.replace(/[\d.-]/g, '');
      const adjustedDosage = (baseDosage * landSize).toFixed(2);
      
      return {
        ...fert,
        dosage: fert.dosage,
        totalAmount: `${adjustedDosage} ${unit.includes('/') ? unit.split('/')[0] : unit}`
      };
    });

    // Adjust based on soil pH
    let phAdjustment = "";
    if (soilPH < 5.5) {
      phAdjustment = "Consider applying lime to raise soil pH before fertilizer application.";
    } else if (soilPH > 7.5) {
      phAdjustment = "Consider applying sulfur to lower soil pH before fertilizer application.";
    }

    // Adjust based on weather conditions
    let weatherAdjustment = "";
    if (weatherCondition === 'Heavy Rainfall') {
      weatherAdjustment = "Use slow-release fertilizers to minimize leaching due to heavy rainfall.";
    } else if (weatherCondition === 'Drought') {
      weatherAdjustment = "Consider fertigation or split application to optimize nutrient uptake during drought conditions.";
    }

    setRecommendations({
      message: `Fertilizer recommendations for ${selectedCropType} on ${selectedSoilType} soil:`,
      seasonalNote: `Current season: ${currentSeason}. ${weatherForecast.find(f => f.month === currentSeason)?.recommendedFertilizerAdjustments || ''}`,
      fertilizers: adjustedFertilizers,
      soilTypeInfo: soilTypes.find(st => st.type === selectedSoilType),
      phAdjustment,
      weatherAdjustment,
      farm: selectedFarm ? {
        id: selectedFarm.id,
        name: selectedFarm.farmName,
        soilType: selectedFarm.soilType,
        pH: selectedFarm.pH,
        moisture: selectedFarm.moisture,
        N: selectedFarm.N,
        P: selectedFarm.P,
        K: selectedFarm.K,
        organicMatter: selectedFarm.organicMatter,
        landSize: selectedFarm.landSize,
      } : null
    });
  };

  const handleSaveRecommendations = async () => {
    if (!selectedCropType || !Number.isFinite(Number(landSize)) || Number(landSize) <= 0 || !recommendations?.fertilizers?.length) return;
    setSaveState({ status: 'saving', message: '' });
    try {
      await api.createFertilizerPlan({
        farmId: recommendations.farm?.id || null,
        cropType: selectedCropType,
        soilType: selectedSoilType,
        landSizeHectares: Number(landSize),
        previousYield: previousYield === '' ? null : Number(previousYield),
        weatherCondition: weatherCondition || null,
        soilProfile: recommendations.farm ? {
          soilType: recommendations.farm.soilType,
          pH: recommendations.farm.pH,
          moisture: recommendations.farm.moisture,
          nitrogen: recommendations.farm.N,
          phosphorus: recommendations.farm.P,
          potassium: recommendations.farm.K,
          organicMatter: recommendations.farm.organicMatter,
        } : null,
        recommendations: recommendations.fertilizers.map(({ name, dosage, totalAmount, effectiveness }) => ({ name, ratePerHectare: dosage, totalAmount, effectiveness })),
        seasonalNote: recommendations.seasonalNote,
        phAdjustment: recommendations.phAdjustment || null,
        weatherAdjustment: recommendations.weatherAdjustment || null,
        generatedAt: new Date().toISOString(),
      });
      setSaveState({ status: 'saved', message: 'Recommendation saved to your FertiWise plans.' });
    } catch (error) {
      setSaveState({ status: 'error', message: error.message || 'Could not save this recommendation. Please try again.' });
    }
  };

  const handlePrintRecommendations = () => {
    if (!recommendations?.fertilizers?.length) return;
    window.print();
  };

  const handleDownloadPdf = () => {
    if (!recommendations?.fertilizers?.length) return;

    const document = new jsPDF();
    const pageWidth = document.internal.pageSize.getWidth();
    const generatedDate = new Date().toLocaleDateString();
    document.setTextColor(20, 83, 45);
    document.setFontSize(19);
    document.text('FertiWise Fertilizer Plan', 14, 20);
    document.setTextColor(75, 85, 99);
    document.setFontSize(9);
    document.text(`Generated ${generatedDate}`, 14, 27);
    document.setDrawColor(22, 101, 52);
    document.line(14, 31, pageWidth - 14, 31);

    const details = [
      ['Farm', recommendations.farm?.name || 'Manual entry'],
      ['Crop', selectedCropType],
      ['Farm size', `${landSize} hectares`],
      ['Soil type', recommendations.farm?.soilType || selectedSoilType],
      ['Soil pH', String(recommendations.farm?.pH ?? soilPH)],
      ['Organic matter', `${recommendations.farm?.organicMatter ?? organicMatter}%`],
      ['Soil N-P-K', recommendations.farm ? [recommendations.farm.N, recommendations.farm.P, recommendations.farm.K].map((value) => value ?? 'Not recorded').join(' / ') : 'Not recorded'],
    ];
    document.autoTable({
      startY: 36,
      head: [['Farm and soil details', 'Value']],
      body: details,
      theme: 'grid',
      headStyles: { fillColor: [22, 101, 52] },
      styles: { fontSize: 9, cellPadding: 2.5 },
      columnStyles: { 0: { cellWidth: 48, fontStyle: 'bold' } },
    });

    const dosageStartY = document.lastAutoTable.finalY + 8;
    document.setTextColor(31, 41, 55);
    document.setFontSize(12);
    document.text('Recommended fertilizer dosage', 14, dosageStartY);
    document.autoTable({
      startY: dosageStartY + 4,
      head: [['Fertilizer', 'Rate per hectare', `Total for ${landSize} ha`, 'Effectiveness']],
      body: recommendations.fertilizers.map((fertilizer) => [
        fertilizer.name,
        fertilizer.dosage,
        fertilizer.totalAmount,
        `${fertilizer.effectiveness}%`,
      ]),
      theme: 'grid',
      headStyles: { fillColor: [22, 101, 52] },
      styles: { fontSize: 9, cellPadding: 2.5 },
    });

    let notesY = document.lastAutoTable.finalY + 9;
    const addNote = (label, note) => {
      if (!note) return;
      const lines = document.splitTextToSize(`${label}: ${note}`, pageWidth - 28);
      if (notesY + lines.length * 4.5 > document.internal.pageSize.getHeight() - 15) {
        document.addPage();
        notesY = 18;
      }
      document.setFontSize(9);
      document.setTextColor(55, 65, 81);
      document.text(lines, 14, notesY);
      notesY += lines.length * 4.5 + 3;
    };
    addNote('Seasonal guidance', recommendations.seasonalNote);
    addNote('pH guidance', recommendations.phAdjustment);
    addNote('Weather guidance', recommendations.weatherAdjustment);
    addNote('Soil considerations', recommendations.soilTypeInfo?.fertilizerConsiderations);
    addNote('Important', 'Dosage rates are reference recommendations. Confirm rates with local agricultural guidance and current soil-test units before application.');

    const farmSlug = (recommendations.farm?.name || selectedCropType).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    document.save(`fertiwise-${farmSlug || 'recommendation'}-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const handleReset = () => {
    setSelectedSoilType('');
    setSelectedCropType('');
    setLandSize('');
    setSoilPH(6.5);
    setOrganicMatter(3.0);
    setPreviousYield('');
    setWeatherCondition('');
    setSelectedFarmId('');
    setRecommendations(null);
    setSaveState({ status: 'idle', message: '' });
    setFieldErrors({});
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">AI-Driven Fertilizer Recommendations</h1>
      
      <div className="fertiwise-recommendation-inputs bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Enter Farm Details</h2>

        <div className="mb-6 rounded-md border border-green-200 bg-green-50/70 p-4">
          <label htmlFor="fertilizer-farm" className="block text-sm font-semibold text-gray-800">Use a registered farm profile</label>
          <p className="mt-1 text-xs text-gray-600">Selecting a farm fills its soil type, test pH, organic matter, suitable crop, and area.</p>
          <select id="fertilizer-farm" value={selectedFarmId} onChange={handleFarmChange} className="mt-3 w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-700/15">
            <option value="">Enter details manually</option>
            {farms.map((farm) => <option key={farm.id} value={farm.id}>{farm.farmName} · {farm.region || 'Region not set'}</option>)}
          </select>
          {farmLoadMessage && <p className="mt-2 text-xs text-gray-600" role="status">{farmLoadMessage}</p>}
          {selectedFarm && (
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-green-200 pt-3 text-xs text-gray-700 sm:grid-cols-4">
              <span>Soil: <strong>{selectedFarm.soilType || 'Not recorded'}</strong></span>
              <span>pH: <strong>{selectedFarm.pH ?? 'Not recorded'}</strong></span>
              <span>N-P-K: <strong>{[selectedFarm.N, selectedFarm.P, selectedFarm.K].map((value) => value ?? '—').join(' / ')}</strong></span>
              <span>Organic matter: <strong>{selectedFarm.organicMatter === '' || selectedFarm.organicMatter === undefined ? 'Not recorded' : `${selectedFarm.organicMatter}%`}</strong></span>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="fertilizer-soil-type" className="block text-sm font-medium text-gray-700 mb-1">Soil Type</label>
            <select
              id="fertilizer-soil-type"
              value={selectedSoilType}
              required
              aria-invalid={Boolean(fieldErrors.soilType)}
              aria-describedby={fieldErrors.soilType ? 'fertilizer-soil-error' : undefined}
              onChange={(e) => { setSelectedSoilType(e.target.value); setFieldErrors((current) => ({ ...current, soilType: '' })); }}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
            >
              <option value="">Select Soil Type</option>
              {soilTypes.map(soil => (
                <option key={soil.type} value={soil.type}>{soil.type}</option>
              ))}
            </select>
            {fieldErrors.soilType && <p id="fertilizer-soil-error" className="mt-1 text-xs text-red-700">{fieldErrors.soilType}</p>}
          </div>
          
          <div>
            <label htmlFor="fertilizer-crop-type" className="block text-sm font-medium text-gray-700 mb-1">Crop Type <span className="text-red-700" aria-hidden="true">*</span></label>
            <select
              id="fertilizer-crop-type"
              value={selectedCropType}
              required
              aria-invalid={Boolean(fieldErrors.crop)}
              aria-describedby={fieldErrors.crop ? 'fertilizer-crop-error' : undefined}
              onChange={(e) => { setSelectedCropType(e.target.value); setFieldErrors((current) => ({ ...current, crop: '' })); }}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
            >
              <option value="">Select Crop Type</option>
              {cropTypes.map(crop => (
                <option key={crop} value={crop}>{crop}</option>
              ))}
            </select>
            {fieldErrors.crop && <p id="fertilizer-crop-error" className="mt-1 text-xs text-red-700">{fieldErrors.crop}</p>}
          </div>
          
          <div>
            <label htmlFor="fertilizer-land-size" className="block text-sm font-medium text-gray-700 mb-1">Farm Size (hectares) <span className="text-red-700" aria-hidden="true">*</span></label>
            <input
              id="fertilizer-land-size"
              type="number"
              required
              value={landSize}
              min={0.1}
              step={0.1}
              aria-invalid={Boolean(fieldErrors.landSize)}
              aria-describedby={fieldErrors.landSize ? 'fertilizer-land-size-error' : undefined}
              onChange={(e) => { setLandSize(e.target.value === '' ? '' : Number(e.target.value)); setFieldErrors((current) => ({ ...current, landSize: '' })); }}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
            />
            {fieldErrors.landSize && <p id="fertilizer-land-size-error" className="mt-1 text-xs text-red-700">{fieldErrors.landSize}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Soil pH</label>
            <input
              type="range"
              min={4.0}
              max={9.0}
              step={0.1}
              value={soilPH}
              onChange={(e) => setSoilPH(parseFloat(e.target.value))}
              className="w-full accent-green-500"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>4.0 (Acidic)</span>
              <span>{soilPH}</span>
              <span>9.0 (Alkaline)</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Organic Matter (%)</label>
            <input
              type="number"
              value={organicMatter}
              min={0}
              max={10}
              step={0.1}
              onChange={(e) => setOrganicMatter(parseFloat(e.target.value))}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Previous Yield (ton/ha)</label>
            <input
              type="number"
              value={previousYield}
              onChange={(e) => setPreviousYield(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
              placeholder="Optional"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Weather Conditions</label>
            <select
              value={weatherCondition}
              onChange={(e) => setWeatherCondition(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
            >
              <option value="">Select Weather Condition</option>
              <option value="Normal">Normal</option>
              <option value="Heavy Rainfall">Heavy Rainfall</option>
              <option value="Drought">Drought</option>
              <option value="Cold">Cold Season</option>
            </select>
          </div>
        </div>
        
        <div className="mt-6 flex space-x-4">
          <button
            onClick={handleGenerateRecommendations}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Generate Recommendations
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
      
      {recommendations && (
        <div className="fertiwise-print-report bg-white p-6 rounded-lg shadow-sm">
          <div className="hidden print:block print-report-header">
            <p>FertiWise · Smart fertilizer management</p>
            <h1>Fertilizer Recommendation Plan</h1>
            <p>Generated {new Date().toLocaleDateString()}</p>
          </div>
          <h2 className="text-lg font-medium text-gray-800 mb-4">Fertilizer Recommendations</h2>
          
          <div className="bg-green-50 border border-green-100 rounded-md p-4 mb-6">
            <p className="font-medium">{recommendations.message}</p>
            {recommendations.farm && (
              <p className="mt-2 text-sm text-gray-700">
                Based on <strong>{recommendations.farm.name}</strong>: {recommendations.farm.soilType || selectedSoilType} soil, pH {recommendations.farm.pH ?? soilPH}, for {landSize} ha.
                <span className="mt-1 block text-xs text-gray-600">Farm N-P-K readings: {[recommendations.farm.N, recommendations.farm.P, recommendations.farm.K].map((value) => value ?? 'not recorded').join(' / ')}. Current rate references are scaled to area; NPK values have no recorded test units for calibrated rate corrections.</span>
              </p>
            )}
            <p className="text-sm mt-2 text-gray-600">{recommendations.seasonalNote}</p>
            
            {recommendations.phAdjustment && (
              <p className="text-sm mt-2 text-amber-700">
                <span className="font-medium">pH Adjustment:</span> {recommendations.phAdjustment}
              </p>
            )}
            
            {recommendations.weatherAdjustment && (
              <p className="text-sm mt-2 text-blue-700">
                <span className="font-medium">Weather Adjustment:</span> {recommendations.weatherAdjustment}
              </p>
            )}
          </div>
          
          {recommendations.soilTypeInfo && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-800 mb-2">Soil Type Information</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p><span className="font-medium">Texture:</span> {recommendations.soilTypeInfo.characteristics.texture}</p>
                <p><span className="font-medium">Drainage:</span> {recommendations.soilTypeInfo.characteristics.drainage}</p>
                <p><span className="font-medium">Nutrient Retention:</span> {recommendations.soilTypeInfo.characteristics.nutrientRetention}</p>
                <p className="text-sm mt-2 text-gray-600">{recommendations.soilTypeInfo.fertilizerConsiderations}</p>
              </div>
            </div>
          )}
          
          <div className="mt-4">
            <h3 className="font-medium text-gray-800 mb-2">Recommended Fertilizers</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fertilizer</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate per hectare</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total for {landSize} ha</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Effectiveness</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recommendations.fertilizers.map((fert, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{fert.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fert.dosage}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fert.totalAmount}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="relative w-full h-2 bg-gray-200 rounded">
                            <div 
                              className="absolute h-full bg-green-500 rounded" 
                              style={{ width: `${fert.effectiveness}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-xs text-gray-600">{fert.effectiveness}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="mt-6 border-t border-gray-100 pt-4">
            <h3 className="font-medium text-gray-800 mb-2">Application Guidelines</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
              <li>Apply base fertilizers before planting or at the beginning of the growing season.</li>
              <li>Split nitrogen applications to increase efficiency and reduce leaching.</li>
              <li>Avoid applying fertilizers when heavy rain is expected in the next 24 hours.</li>
              <li>Ensure uniform distribution for broadcast application methods.</li>
              <li>Consider soil testing every 2-3 years to refine future recommendations.</li>
            </ul>
          </div>
          
          <div className="mt-6 flex justify-center">
            <div className="fertiwise-report-actions flex flex-wrap justify-center gap-3">
              <button type="button" onClick={handleDownloadPdf} disabled={!recommendations.fertilizers.length} className="inline-flex items-center gap-2 rounded-md bg-emerald-800 px-4 py-2 font-medium text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50">
                <Download size={16} aria-hidden="true" />Download PDF
              </button>
              <button type="button" onClick={handlePrintRecommendations} disabled={!recommendations.fertilizers.length} className="rounded-md border border-gray-300 bg-white px-4 py-2 font-medium text-gray-800 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
                Print recommendation
              </button>
              <button type="button" onClick={handleSaveRecommendations} disabled={saveState.status === 'saving' || !recommendations.fertilizers.length} className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 transition-colors disabled:cursor-not-allowed disabled:opacity-50">
                {saveState.status === 'saving' ? 'Saving…' : saveState.status === 'saved' ? 'Saved' : 'Save Recommendations'}
              </button>
            </div>
          </div>
          {saveState.message && <p role={saveState.status === 'error' ? 'alert' : 'status'} className={`fertiwise-save-message mt-3 text-center text-sm ${saveState.status === 'error' ? 'text-red-700' : 'text-green-800'}`}>{saveState.message}</p>}
        </div>
      )}
    </div>
  );
};

export default FertilizerRecommendations;