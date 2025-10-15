import { useState } from 'react';
import { getPestDiseaseRisk } from './usePestDisease';

export default function PestDiseaseImpact() {
  const [crop, setCrop] = useState('Maize');
  const [region, setRegion] = useState('Eastern');
  const [riskReport, setRiskReport] = useState(null);

  const handleCheck = () => {
    const result = getPestDiseaseRisk(region, crop);
    setRiskReport(result);
  };

  return (
    <div className="bg-white p-4 rounded shadow mt-6">
      <h2 className="text-lg font-bold mb-2">🐛 Pest & Disease Risk Analysis</h2>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <select
          className="border p-2 rounded"
          value={crop}
          onChange={(e) => setCrop(e.target.value)}
        >
          <option value="Maize">Maize</option>
          <option value="Tomato">Tomato</option>
          <option value="Cassava">Cassava</option>
          <option value="Rice">Rice</option>
        </select>

        <select
          className="border p-2 rounded"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        >
          <option value="Eastern">Eastern</option>
          <option value="Volta">Volta</option>
          <option value="Brong Ahafo">Brong Ahafo</option>
          <option value="Northern">Northern</option>
        </select>

        <button
          onClick={handleCheck}
          className="bg-green-700 text-white px-4 py-2 rounded"
        >
          Analyze
        </button>
      </div>

      {riskReport && (
        <div className="text-sm space-y-2 text-gray-800">
          <div>🌿 Crop: <strong>{riskReport.crop}</strong></div>
          <div>📍 Region: <strong>{riskReport.region}</strong></div>
          <div>🦠 Disease Risk: <strong>{riskReport.diseaseRisk}</strong></div>
          <div>🐛 Pest Pressure: <strong>{riskReport.pestRisk}</strong></div>
          <div>💡 Recommendation: <em>{riskReport.advice}</em></div>
        </div>
      )}
    </div>
  );
}
