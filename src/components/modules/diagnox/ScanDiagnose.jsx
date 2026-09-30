import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { api } from '../../../lib/api';

const ScanDiagnose = () => {
  const [diagnosisMode, setDiagnosisMode] = useState('crop');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [scanError, setScanError] = useState('');
  const [livestockDetails, setLivestockDetails] = useState({ species: '', bodyArea: '' });
  const [searchParams, setSearchParams] = useState({
    cropType: '',
    diseaseName: '',
    severityLevel: 'all'
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    e.target.value = '';
    setScanError('');
    if (!selectedFile) return;
    setFile(null);
    setPreview(null);
    if (!['image/png', 'image/jpeg'].includes(selectedFile.type)) {
      setScanError('Choose a PNG or JPG image.');
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setScanError('Image must be 5MB or smaller.');
      return;
    }
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleScan = async () => {
    if (!file) return;
    setScanning(true);
    setScanError('');
    try {
      const result = diagnosisMode === 'livestock'
        ? await api.analyzeLivestockImage(file, livestockDetails)
        : await api.analyzeCropImage(file);
      setScanResults({ ...result, imageUrl: preview });
    } catch (error) {
      setScanError(error.message || 'Image analysis failed. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  const handleClearScan = () => {
    setFile(null);
    setPreview(null);
    setScanResults(null);
    setScanError('');
  };

  const changeDiagnosisMode = (mode) => {
    setDiagnosisMode(mode);
    handleClearScan();
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams({
      ...searchParams,
      [name]: value
    });
  };

  const handleGeneratePDF = async () => {
    if (!scanResults) return;

    const document = new jsPDF();
    const pageWidth = document.internal.pageSize.getWidth();
    const pageHeight = document.internal.pageSize.getHeight();
    const margin = 18;
    const contentWidth = pageWidth - margin * 2;
    let cursorY = margin;
    let logoDataUrl = null;

    try {
      const response = await fetch('/assets/logo.png');
      if (response.ok) {
        const logoBlob = await response.blob();
        logoDataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(logoBlob);
        });
      }
    } catch {
      logoDataUrl = null;
    }

    const ensureSpace = (height) => {
      if (cursorY + height > pageHeight - margin) {
        document.addPage();
        cursorY = margin;
      }
    };

    const addSectionTitle = (title) => {
      ensureSpace(14);
      cursorY += 3;
      document.setFont('helvetica', 'bold');
      document.setFontSize(12);
      document.setTextColor(35, 45, 35);
      document.text(title, margin, cursorY);
      cursorY += 7;
    };

    const addParagraph = (text, options = {}) => {
      const value = String(text || '').trim() || options.emptyText || 'Not provided';
      document.setFont('helvetica', 'normal');
      document.setFontSize(10);
      document.setTextColor(70, 75, 70);
      const lines = document.splitTextToSize(value, contentWidth);
      const lineHeight = 5;
      for (const line of lines) {
        ensureSpace(lineHeight);
        document.text(line, margin, cursorY);
        cursorY += lineHeight;
      }
      cursorY += 2;
    };

    const addList = (items, emptyText) => {
      if (!items?.length) {
        addParagraph(emptyText);
        return;
      }
      items.forEach((item) => addParagraph(`- ${item}`));
    };

    const scanDate = scanResults.createdAt ? new Date(scanResults.createdAt) : new Date();
    const diagnosed = scanResults.diagnosisIdentified !== false;
    document.setFillColor(252, 250, 241);
    document.rect(0, 0, pageWidth, 54, 'F');
    document.setFillColor(18, 101, 48);
    document.rect(0, 0, 4, 54, 'F');
    if (logoDataUrl) document.addImage(logoDataUrl, 'PNG', margin, 8, 36, 36, undefined, 'FAST');
    document.setFont('helvetica', 'bold');
    document.setFontSize(17);
    document.setTextColor(36, 75, 43);
    const titleX = logoDataUrl ? margin + 44 : margin;
    document.text(diagnosisMode === 'livestock' ? 'DiagnoX Livestock Health Report' : 'DiagnoX Crop Health Report', titleX, 23);
    document.setFont('helvetica', 'normal');
    document.setFontSize(9);
    document.setTextColor(80, 90, 80);
    document.text(`Powered by Loryi AI  |  Generated ${scanDate.toLocaleString()}`, titleX, 32);
    document.setFillColor(18, 101, 48);
    document.rect(margin, 54, contentWidth * 0.72, 1.5, 'F');
    document.setFillColor(242, 184, 35);
    document.rect(margin + contentWidth * 0.72, 54, contentWidth * 0.28, 1.5, 'F');
    cursorY = 66;

    addSectionTitle('Scan Summary');
    if (diagnosisMode === 'livestock') {
      addParagraph(`Animal: ${scanResults.species}`);
      addParagraph(`Affected area: ${scanResults.bodyArea}`);
      addParagraph(`Urgency: ${scanResults.urgency}`);
      addSectionTitle('Visual Assessment');
      addParagraph(scanResults.assessment);
      addSectionTitle('Visible Signs');
      addList(scanResults.visibleSigns, 'No clear signs could be identified from this image.');
      addSectionTitle('Possible Conditions');
      addList(scanResults.possibleConditions, 'No possible condition could be suggested from this image.');
      addSectionTitle('Care Guidance');
      addList(scanResults.careGuidance, 'Keep the animal comfortable and contact a veterinarian for advice.');
      addSectionTitle('Seek Veterinary Care If');
      addList(scanResults.seekVeterinarianIf, 'Seek veterinary help if the animal worsens or appears distressed.');
    } else {
      addParagraph(`Diagnosis: ${scanResults.diseaseName || 'Unable to identify'}`);
      addParagraph(`Scientific name: ${scanResults.scientificName || 'Not identified'}`);
      addParagraph(`Diagnosis confidence: ${Number(scanResults.confidence) || 0}%`);
      addParagraph(`Severity: ${diagnosed ? (scanResults.severity || 'Not assessed') : 'Not assessed'}`);
      addParagraph(`${diagnosed ? 'Affected crops' : 'Crop identified'}: ${(scanResults.affectedCrops || []).join(', ') || 'Not identified'}`);
      addSectionTitle('Description');
      addParagraph(scanResults.description);
      addSectionTitle('Symptoms');
      addList(scanResults.symptoms, 'No symptoms were identified from this image.');
      addSectionTitle('Possible Causes');
      addList(scanResults.causes, 'No cause could be determined from this image.');
      addSectionTitle('Recommended Treatments');
      addList(scanResults.treatments, 'No treatment recommendation is available for this image.');
      addSectionTitle('Prevention Tips');
      addList(scanResults.preventionTips, 'No prevention tips are available for this image.');
    }

    if (scanResults.imageUrl) {
      ensureSpace(90);
      addSectionTitle('Uploaded Image');
      const imageFormat = scanResults.imageUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG';
      document.addImage(scanResults.imageUrl, imageFormat, margin, cursorY, Math.min(contentWidth, 120), 75, undefined, 'FAST');
      cursorY += 80;
    }

    ensureSpace(18);
    document.setFont('helvetica', 'italic');
    document.setFontSize(8);
    document.setTextColor(100, 100, 100);
    document.text(
      document.splitTextToSize(diagnosisMode === 'livestock'
        ? (scanResults.disclaimer || 'This image-based triage is not a veterinary diagnosis. Have a veterinarian or qualified animal-health worker examine the animal.')
        : 'This AI-generated result is an advisory based on visible image evidence, not a laboratory confirmation. Verify uncertain or severe symptoms with a qualified agronomist and follow local product labels and regulations.', contentWidth),
      margin,
      cursorY,
    );

    const pageCount = document.internal.getNumberOfPages();
    for (let page = 1; page <= pageCount; page += 1) {
      document.setPage(page);
      document.setFont('helvetica', 'normal');
      document.setFontSize(8);
      document.setTextColor(110, 110, 110);
      document.text(`Powered by Loryi AI | Copyright (c) ${new Date().getFullYear()} Loryi. All rights reserved.`, margin, pageHeight - 8);
      document.text(`Page ${page} of ${pageCount}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
    }

    const safeName = (diagnosisMode === 'livestock' ? scanResults.species : scanResults.diseaseName || 'crop-diagnosis')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    document.save(`diagnox-${safeName || 'crop-diagnosis'}-${scanDate.toISOString().slice(0, 10)}.pdf`);
  };

  const videoSearchQuery = [scanResults?.diseaseName, scanResults?.affectedCrops?.[0], 'crop treatment']
    .filter((value) => value && value !== 'Unable to identify')
    .join(' ');

  return (
    <div>
      <div className="mb-6 inline-flex rounded-md border border-gray-200 p-1" role="group" aria-label="Diagnosis type">
        {[
          { id: 'crop', label: 'Crop diagnosis' },
          { id: 'livestock', label: 'Livestock diagnosis' },
        ].map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => changeDiagnosisMode(mode.id)}
            aria-pressed={diagnosisMode === mode.id}
            className={`rounded px-4 py-2 text-sm font-medium ${diagnosisMode === mode.id ? 'bg-orange-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            {mode.label}
          </button>
        ))}
      </div>
      {!scanResults ? (
        <div>
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              {diagnosisMode === 'livestock' ? 'Scan & Assess Livestock Health' : 'Scan & Diagnose Crop Disease'}
            </h2>
            <p className="text-gray-600">
              {diagnosisMode === 'livestock'
                ? 'Upload a clear photo of an animal or affected area for visual health triage and guidance on when to contact a veterinarian.'
                : 'Upload an image of your affected crop for AI-powered disease identification and treatment recommendations.'}
            </p>
          </div>
          
          {/* Upload Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="flex flex-col">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                {preview ? (
                  <div className="mb-4 w-full">
                    <img src={preview} alt="Preview" className="max-h-56 mx-auto object-cover rounded" />
                  </div>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-gray-400 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                )}
                
                <label className="flex flex-col items-center justify-center w-full cursor-pointer">
                  <span className="text-sm font-medium text-orange-600 mb-2">
                    {preview ? 'Change image' : 'Upload an image'}
                  </span>
                  <span className="text-xs text-gray-500">PNG, JPG up to 5MB</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/png,image/jpeg"
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              {scanError && (
                <p role="alert" className="mt-3 text-sm text-red-700">{scanError}</p>
              )}
              
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={handleScan}
                  disabled={!file || scanning || (diagnosisMode === 'livestock' && (!livestockDetails.species || !livestockDetails.bodyArea))}
                  className={`px-4 py-2 rounded-md shadow-sm flex-1 flex items-center justify-center ${
                    !file || scanning || (diagnosisMode === 'livestock' && (!livestockDetails.species || !livestockDetails.bodyArea)) ? 'bg-gray-300 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700 text-white'
                  }`}
                >
                  {scanning ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Scanning...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Scan Now
                    </>
                  )}
                </button>
                <button
                  onClick={handleClearScan}
                  disabled={!file || scanning}
                  className={`px-4 py-2 rounded-md shadow-sm ${
                    !file || scanning ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Clear
                </button>
              </div>
            </div>
            
            {/* Search Options */}
            <div>
              {diagnosisMode === 'crop' ? <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-md font-medium text-gray-900 mb-4">Search Disease Database</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="cropType" className="block text-sm font-medium text-gray-700 mb-1">
                      Search by Crop
                    </label>
                    <select
                      id="cropType"
                      name="cropType"
                      value={searchParams.cropType}
                      onChange={handleSearchChange}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="">Select crop type</option>
                      <option value="tomato">Tomato</option>
                      <option value="potato">Potato</option>
                      <option value="corn">Corn</option>
                      <option value="wheat">Wheat</option>
                      <option value="rice">Rice</option>
                      <option value="cucumber">Cucumber</option>
                      <option value="pepper">Pepper</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="diseaseName" className="block text-sm font-medium text-gray-700 mb-1">
                      Search by Disease Name
                    </label>
                    <input
                      type="text"
                      id="diseaseName"
                      name="diseaseName"
                      placeholder="E.g., Powdery Mildew, Rust, Blight"
                      value={searchParams.diseaseName}
                      onChange={handleSearchChange}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="severityLevel" className="block text-sm font-medium text-gray-700 mb-1">
                      Filter by Severity
                    </label>
                    <select
                      id="severityLevel"
                      name="severityLevel"
                      value={searchParams.severityLevel}
                      onChange={handleSearchChange}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="all">All Severities</option>
                      <option value="low">Low</option>
                      <option value="moderate">Moderate</option>
                      <option value="high">High</option>
                      <option value="severe">Severe</option>
                    </select>
                  </div>
                  
                  <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md shadow-sm flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search Database
                  </button>
                </div>
              </div> : <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <h3 className="text-md font-medium text-gray-900">Animal details</h3>
                <div>
                  <label htmlFor="livestockSpecies" className="block text-sm font-medium text-gray-700 mb-1">Animal type</label>
                  <select
                    id="livestockSpecies"
                    value={livestockDetails.species}
                    onChange={(event) => setLivestockDetails({ ...livestockDetails, species: event.target.value })}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Select animal type</option>
                    <option value="Cattle">Cattle</option>
                    <option value="Goat">Goat</option>
                    <option value="Sheep">Sheep</option>
                    <option value="Poultry">Poultry</option>
                    <option value="Pig">Pig</option>
                    <option value="Camel">Camel</option>
                    <option value="Donkey">Donkey</option>
                    <option value="Other livestock">Other livestock</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="livestockBodyArea" className="block text-sm font-medium text-gray-700 mb-1">Affected area</label>
                  <select
                    id="livestockBodyArea"
                    value={livestockDetails.bodyArea}
                    onChange={(event) => setLivestockDetails({ ...livestockDetails, bodyArea: event.target.value })}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Select affected area</option>
                    <option value="Eye">Eye</option>
                    <option value="Skin">Skin</option>
                    <option value="Skin around the eye">Skin around the eye</option>
                    <option value="Mouth">Mouth</option>
                    <option value="Nose">Nose</option>
                    <option value="Hoof or foot">Hoof or foot</option>
                    <option value="Udder">Udder</option>
                    <option value="Feathers">Feathers</option>
                    <option value="Other or whole animal">Other or whole animal</option>
                  </select>
                </div>
                <p className="text-xs text-gray-600">Photo assessment is not a veterinary diagnosis. Urgent or worsening signs need an animal-health professional.</p>
              </div>}
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Tip</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    {diagnosisMode === 'livestock'
                      ? 'Use a clear, well-lit photo of the affected area. Avoid stressing or restraining an unwell animal to take a photo.'
                      : 'For best results, take close-up photos in good lighting. Make sure the affected area is clearly visible and centered in the frame.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                {diagnosisMode === 'livestock' ? 'Livestock Health Assessment' : 'Diagnosis Results'}
              </h2>
              <p className="text-gray-600">Scan completed on {new Date().toLocaleDateString()}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleGeneratePDF}
                className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 transition duration-150 ease-in-out flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Generate PDF
              </button>
              <button
                onClick={handleClearScan}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md shadow-sm hover:bg-gray-200 transition duration-150 ease-in-out"
              >
                New Scan
              </button>
            </div>
          </div>
          
          {diagnosisMode === 'livestock' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-md font-medium text-gray-900">Uploaded Image</h3>
                  </div>
                  <div className="p-4">
                    <img src={scanResults.imageUrl} alt={`${scanResults.species} ${scanResults.bodyArea} submitted for assessment`} className="w-full h-auto rounded-lg" />
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-md font-medium text-gray-900">Assessment Summary</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between gap-4">
                      <span className="text-sm text-gray-600">Animal:</span>
                      <span className="text-sm font-medium text-right">{scanResults.species}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-sm text-gray-600">Affected area:</span>
                      <span className="text-sm font-medium text-right">{scanResults.bodyArea}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-sm text-gray-600">Urgency:</span>
                      <span className={`text-sm font-medium text-right ${scanResults.urgency === 'Emergency' || scanResults.urgency === 'Urgent veterinary care' ? 'text-red-700' : 'text-gray-900'}`}>
                        {scanResults.urgency}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2 space-y-6">
                <section className="bg-white border border-gray-200 rounded-lg shadow p-5">
                  <h3 className="text-md font-medium text-gray-900 mb-3">Visual Assessment</h3>
                  <p className="text-sm text-gray-700">{scanResults.assessment}</p>
                </section>
                <section className="bg-white border border-gray-200 rounded-lg shadow p-5">
                  <h3 className="text-md font-medium text-gray-900 mb-3">Visible Signs</h3>
                  {scanResults.visibleSigns?.length ? (
                    <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                      {scanResults.visibleSigns.map((sign, index) => <li key={index}>{sign}</li>)}
                    </ul>
                  ) : <p className="text-sm text-gray-500">No clear signs could be identified from this image.</p>}
                </section>
                <section className="bg-white border border-gray-200 rounded-lg shadow p-5">
                  <h3 className="text-md font-medium text-gray-900 mb-3">Possible Conditions</h3>
                  {scanResults.possibleConditions?.length ? (
                    <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                      {scanResults.possibleConditions.map((condition, index) => <li key={index}>{condition}</li>)}
                    </ul>
                  ) : <p className="text-sm text-gray-500">No possible condition could be suggested from this image.</p>}
                </section>
                <section className="bg-white border border-gray-200 rounded-lg shadow p-5">
                  <h3 className="text-md font-medium text-gray-900 mb-3">Care Guidance</h3>
                  {scanResults.careGuidance?.length ? (
                    <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                      {scanResults.careGuidance.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                  ) : <p className="text-sm text-gray-500">Keep the animal comfortable and contact a veterinarian for advice.</p>}
                  <h4 className="text-sm font-medium text-gray-900 mt-5 mb-2">Seek Veterinary Care If</h4>
                  {scanResults.seekVeterinarianIf?.length ? (
                    <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                      {scanResults.seekVeterinarianIf.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                  ) : <p className="text-sm text-gray-500">Signs worsen, the animal appears distressed, or several animals are affected.</p>}
                  <p className="mt-5 border-t border-gray-100 pt-3 text-xs text-gray-500">{scanResults.disclaimer}</p>
                </section>
              </div>
            </div>
          ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-md font-medium text-gray-900">Uploaded Image</h3>
                </div>
                <div className="p-4">
                  <img src={scanResults.imageUrl} alt="Scanned Plant" className="w-full h-auto rounded-lg" />
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow mt-6">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-md font-medium text-gray-900">Scan Summary</h3>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Disease:</span>
                    <span className="text-sm font-medium">{scanResults.diseaseName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Scientific Name:</span>
                    <span className="text-sm font-italic">{scanResults.scientificName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Diagnosis confidence:</span>
                    <span className="text-sm font-medium">{scanResults.confidence}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Severity:</span>
                    {scanResults.diagnosisIdentified === false ? (
                      <span className="text-sm font-medium text-gray-500">Not assessed</span>
                    ) : <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                      scanResults.severity === 'Low' ? 'bg-green-100 text-green-800' :
                      scanResults.severity === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                      scanResults.severity === 'High' ? 'bg-orange-100 text-orange-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {scanResults.severity}
                    </span>}
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">
                      {scanResults.diagnosisIdentified === false ? 'Crop identified:' : 'Affected Crops:'}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {(scanResults.affectedCrops || []).map((crop, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {crop}
                        </span>
                      ))}
                      {!scanResults.affectedCrops?.length && <span className="text-sm text-gray-500">Not identified</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-md font-medium text-gray-900">Disease Information</h3>
                </div>
                <div className="p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-sm text-gray-600 mb-4">{scanResults.description}</p>
                  
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Symptoms</h4>
                  {scanResults.symptoms?.length ? (
                    <ul className="list-disc pl-5 text-sm text-gray-600 mb-4">
                      {scanResults.symptoms.map((symptom, index) => <li key={index} className="mb-1">{symptom}</li>)}
                    </ul>
                  ) : <p className="text-sm text-gray-500 mb-4">No symptoms were identified from this image.</p>}
                  
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Causes</h4>
                  {scanResults.causes?.length ? (
                    <ul className="list-disc pl-5 text-sm text-gray-600 mb-4">
                      {scanResults.causes.map((cause, index) => <li key={index} className="mb-1">{cause}</li>)}
                    </ul>
                  ) : <p className="text-sm text-gray-500 mb-4">No cause could be determined from this image.</p>}
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow mt-6">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-md font-medium text-gray-900">Recommended Treatments</h3>
                </div>
                <div className="p-4">
                  {scanResults.treatments?.length ? (
                    <ul className="list-disc pl-5 text-sm text-gray-600 mb-4">
                      {scanResults.treatments.map((treatment, index) => <li key={index} className="mb-1">{treatment}</li>)}
                    </ul>
                  ) : <p className="text-sm text-gray-500 mb-4">No treatment recommendation is available for this image.</p>}
                  
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Prevention Tips</h4>
                  {scanResults.preventionTips?.length ? (
                    <ul className="list-disc pl-5 text-sm text-gray-600">
                      {scanResults.preventionTips.map((tip, index) => <li key={index} className="mb-1">{tip}</li>)}
                    </ul>
                  ) : <p className="text-sm text-gray-500">No prevention tips are available for this image.</p>}
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow mt-6">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-md font-medium text-gray-900">Treatment Videos</h3>
                </div>
                <div className="p-4">
                  {videoSearchQuery ? (
                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(videoSearchQuery)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-orange-700 hover:text-orange-800 underline"
                    >
                      Find videos for {scanResults.diseaseName}
                    </a>
                  ) : (
                    <p className="text-sm text-gray-500">Videos are unavailable until a crop health issue is identified.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScanDiagnose;