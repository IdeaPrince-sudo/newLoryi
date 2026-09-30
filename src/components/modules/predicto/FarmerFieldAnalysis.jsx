import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';

const initialInputs = {
  farmerId: '',
  fieldId: 'primary-field',
  crop: 'Maize',
  ndvi: 0.55,
  ndviDelta: -0.05,
  soilMoisture: 30,
  rainfall7d: 35,
  nitrogen: 45,
  phosphorus: 40,
  potassium: 42,
};

const severityTone = {
  high: 'border-red-200 bg-red-50 text-red-800',
  medium: 'border-amber-200 bg-amber-50 text-amber-800',
  low: 'border-emerald-200 bg-emerald-50 text-emerald-800',
};

export default function FarmerFieldAnalysis() {
  const [farmers, setFarmers] = useState([]);
  const [inputs, setInputs] = useState(initialInputs);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.credittrackFarmers()
      .then((records) => {
        setFarmers(records);
        const defaultFarmer = records[0];
        if (defaultFarmer) {
          setInputs((current) => ({ ...current, farmerId: defaultFarmer.id }));
          return api.farmerFieldAnalyses(defaultFarmer.id);
        }
        return [];
      })
      .then((analyses) => {
        if (analyses?.[0]) setAnalysis(analyses[0]);
      })
      .catch((requestError) => setError(requestError.message));
  }, []);

  const updateInput = (event) => {
    const { name, value } = event.target;
    setInputs((current) => ({ ...current, [name]: ['farmerId', 'fieldId', 'crop'].includes(name) ? value : Number(value) }));
  };

  const runAnalysis = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      setAnalysis(await api.analyzeFarmerField(inputs));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const selectFarmer = async (event) => {
    const farmerId = event.target.value;
    setInputs((current) => ({ ...current, farmerId }));
    setError('');
    try {
      const analyses = await api.farmerFieldAnalyses(farmerId);
      const latest = analyses[0];
      setAnalysis(latest || null);
      if (latest) {
        setInputs((current) => ({
          ...current,
          farmerId,
          fieldId: latest.fieldId,
          crop: latest.crop,
          ...latest.inputs,
        }));
      }
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">Farmer field intelligence</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">Pest, disease, drought and nutrient scan</h2>
          <p className="mt-1 text-sm text-slate-500">Combine satellite vigor, rainfall, moisture and soil readings for one farmer field.</p>
        </div>
        <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">Early warning advisory</span>
      </div>

      <form onSubmit={runAnalysis} className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
        {farmers.length > 1 ? <label className="text-sm text-slate-700">Farmer<select name="farmerId" value={inputs.farmerId} onChange={selectFarmer} required className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"><option value="">Select farmer</option>{farmers.map((farmer) => <option key={farmer.id} value={farmer.id}>{farmer.name} · {farmer.phone}</option>)}</select></label> : <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-3 text-sm text-cyan-900"><p className="font-semibold">Your farmer profile</p><p className="mt-1">{farmers[0]?.name || 'Loading profile...' }{farmers[0]?.phone ? ` · ${farmers[0].phone}` : ''}</p></div>}
        <label className="text-sm text-slate-700">Field ID<input name="fieldId" value={inputs.fieldId} onChange={updateInput} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
        <label className="text-sm text-slate-700">Crop<select name="crop" value={inputs.crop} onChange={updateInput} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"><option>Maize</option><option>Rice</option><option>Tomato</option><option>Cassava</option></select></label>
        {[
          ['ndvi', 'NDVI', '0.55', '0', '1', '0.01'],
          ['ndviDelta', 'NDVI change', '-0.05', '-1', '1', '0.01'],
          ['soilMoisture', 'Soil moisture (%)', '30', '0', '100', '1'],
          ['rainfall7d', 'Rainfall, last 7 days (mm)', '35', '0', '500', '1'],
          ['nitrogen', 'Nitrogen index', '45', '0', '100', '1'],
          ['phosphorus', 'Phosphorus index', '40', '0', '100', '1'],
          ['potassium', 'Potassium index', '42', '0', '100', '1'],
        ].map(([name, label, placeholder, min, max, step]) => <label key={name} className="text-sm text-slate-700">{label}<input name={name} type="number" value={inputs[name]} onChange={updateInput} placeholder={placeholder} min={min} max={max} step={step} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>)}
        <div className="flex items-end"><button type="submit" disabled={loading || !inputs.farmerId} className="w-full rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50">{loading ? 'Analyzing field...' : 'Analyze field'}</button></div>
      </form>

      {error && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
      {analysis && <div className="mt-5 border-t border-slate-200 pt-5"><div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-semibold text-slate-900">{analysis.summary}</h3><p className="text-xs text-slate-500">{analysis.crop} · field {analysis.fieldId} · {new Date(analysis.createdAt).toLocaleString()}</p></div><span className="text-xs text-slate-500">{analysis.findings.length} finding{analysis.findings.length === 1 ? '' : 's'}</span></div><div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">{analysis.findings.map((finding) => <article key={finding.type} className={`rounded-lg border p-4 ${severityTone[finding.severity] || severityTone.medium}`}><div className="flex items-center justify-between gap-2"><h4 className="font-semibold">{finding.title}</h4><span className="text-xs font-bold uppercase">{finding.severity}</span></div><p className="mt-2 text-sm">Risk score: {Math.round(finding.score * 100)}%</p><ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{finding.evidence.map((item) => <li key={item}>{item}</li>)}</ul><p className="mt-3 text-sm font-medium">Action: {finding.action}</p></article>)}</div>{analysis.findings.length === 0 && <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">No immediate pest, disease, drought, or nutrient risk crossed the advisory threshold.</p>}<p className="mt-4 text-xs text-slate-500">{analysis.disclaimer}</p></div>}
    </section>
  );
}
