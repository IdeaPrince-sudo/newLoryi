import React, { useState } from 'react';

const crops = ['Tomato', 'Maize', 'Rice'];
const parts = ['Leaf', 'Stem', 'Root', 'Fruit'];
const allSymptoms = {
  Tomato: {
    Leaf: ['Yellow spots', 'Wilting', 'Curling'],
    Stem: ['Dark lesions'],
    Fruit: ['Rotting', 'Discoloration']
  },
  Maize: {
    Leaf: ['Blight', 'Spots'],
    Root: ['Rotting']
  },
  Rice: {
    Leaf: ['Brown tips', 'Yellowing'],
    Stem: ['Weak stalks']
  }
};

const diagnosisRules = [
  {
    crop: 'Tomato',
    part: 'Leaf',
    symptoms: ['Yellow spots', 'Wilting'],
    diagnosis: {
      name: 'Early Blight',
      severity: 'Moderate',
      treatment: 'Apply fungicide (e.g., Mancozeb) and remove affected leaves.',
      prevention: 'Ensure proper spacing and avoid overhead irrigation.',
      image: 'https://example.com/early_blight.jpg'
    }
  },
  {
    crop: 'Tomato',
    part: 'Fruit',
    symptoms: ['Rotting'],
    diagnosis: {
      name: 'Blossom End Rot',
      severity: 'Severe',
      treatment: 'Apply calcium solution and maintain consistent watering.',
      prevention: 'Avoid calcium deficiency and uneven watering.',
      image: 'https://example.com/blossom_end_rot.jpg'
    }
  },
  // Add more rules here...
];

export default function ManualDiagnosis() {
  const [crop, setCrop] = useState('');
  const [part, setPart] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [result, setResult] = useState(null);

  const handleDiagnosis = () => {
    const match = diagnosisRules.find(
      (rule) =>
        rule.crop === crop &&
        rule.part === part &&
        rule.symptoms.every((symptom) => selectedSymptoms.includes(symptom))
    );
    setResult(match?.diagnosis || null);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Manual Diagnosis</h2>

      {/* Crop Selection */}
      <div className="mb-3">
        <label className="block font-medium">Select Crop</label>
        <select
          value={crop}
          onChange={(e) => {
            setCrop(e.target.value);
            setPart('');
            setSelectedSymptoms([]);
            setResult(null);
          }}
          className="border p-2 rounded w-full"
        >
          <option value="">-- Select Crop --</option>
          {crops.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Affected Part Selection */}
      {crop && (
        <div className="mb-3">
          <label className="block font-medium">Select Affected Part</label>
          <select
            value={part}
            onChange={(e) => {
              setPart(e.target.value);
              setSelectedSymptoms([]);
              setResult(null);
            }}
            className="border p-2 rounded w-full"
          >
            <option value="">-- Select Part --</option>
            {Object.keys(allSymptoms[crop]).map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      )}

      {/* Symptom Checkboxes */}
      {part && (
        <div className="mb-4">
          <label className="block font-medium">Select Symptoms</label>
          {allSymptoms[crop][part].map((symptom) => (
            <div key={symptom}>
              <input
                type="checkbox"
                value={symptom}
                checked={selectedSymptoms.includes(symptom)}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setSelectedSymptoms((prev) =>
                    checked ? [...prev, symptom] : prev.filter((s) => s !== symptom)
                  );
                }}
              />
              <span className="ml-2">{symptom}</span>
            </div>
          ))}
        </div>
      )}

      {/* Diagnose Button */}
      {selectedSymptoms.length > 0 && (
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={handleDiagnosis}
        >
          Diagnose
        </button>
      )}

      {/* Diagnosis Result */}
      {result && (
        <div className="mt-6 p-4 border rounded shadow">
          <h3 className="text-lg font-semibold text-red-600">{result.name}</h3>
          <p><strong>Severity:</strong> {result.severity}</p>
          <p><strong>Treatment:</strong> {result.treatment}</p>
          <p><strong>Prevention Tips:</strong> {result.prevention}</p>
          <img src={result.image} alt={result.name} className="mt-3 max-w-xs rounded shadow" />
        </div>
      )}
    </div>
  );
}
