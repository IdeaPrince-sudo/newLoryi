import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { api } from '../../../lib/api';

const tabs = [
  { id: 'qrScanner', label: 'QR/Barcode Scanner' },
  { id: 'batchNumber', label: 'Batch Number' },
  { id: 'blockchain', label: 'Blockchain Lookup' },
];

const SeedVerification = () => {
  const [activeTab, setActiveTab] = useState('qrScanner');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [qrInput, setQrInput] = useState('');
  const [batchInput, setBatchInput] = useState('');
  const [blockchainInput, setBlockchainInput] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);

  const verifySeed = useCallback(async (method, value) => {
    const code = String(value || '').trim();
    if (!code) {
      setVerificationResult({ verified: false, message: 'Enter a code to look up.' });
      return;
    }
    setIsVerifying(true);
    setVerificationResult(null);
    try {
      const record = await api.lookupSeedVerification(code);
      setVerificationResult({
        verified: true,
        seedType: record.seedType || record.seedName || record.crop || 'Seed record',
        supplier: record.supplier || 'Not provided',
        batchNumber: record.batchNumber || record.seedId || code,
        certifications: Array.isArray(record.certifications) ? record.certifications : [],
        plantingRegions: Array.isArray(record.plantingRegions) ? record.plantingRegions : [],
        lastVerifiedDate: record.lastVerifiedDate || (record.createdAt ? new Date(record.createdAt).toLocaleDateString() : 'Not recorded'),
        blockchainId: record.blockchainId || 'No blockchain ID recorded',
        matchedBy: method,
      });
    } catch (error) {
      setVerificationResult({ verified: false, message: error.message || 'No seed record matched that code.' });
    } finally {
      setIsVerifying(false);
    }
  }, []);

  useEffect(() => {
    if (!isCameraActive || activeTab !== 'qrScanner' || !videoRef.current) return undefined;
    let cancelled = false;
    let controls;
    const reader = new BrowserMultiFormatReader();
    reader.decodeFromVideoDevice(undefined, videoRef.current, (result) => {
      if (!result || cancelled) return;
      const scannedCode = result.getText();
      cancelled = true;
      controls?.stop();
      setIsCameraActive(false);
      setQrInput(scannedCode);
      verifySeed('qr/barcode', scannedCode);
    }).then((scannerControls) => {
      controls = scannerControls;
      if (cancelled) controls.stop();
    }).catch((error) => {
      if (cancelled) return;
      setIsCameraActive(false);
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setCameraError('Allow camera access in your browser settings, then try again.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setCameraError('No camera was found on this device.');
      } else {
        setCameraError(error.message || 'The camera could not be started.');
      }
    });

    return () => {
      cancelled = true;
      controls?.stop();
    };
  }, [activeTab, isCameraActive, verifySeed]);

  const changeTab = (tab) => {
    setActiveTab(tab);
    setIsCameraActive(false);
    setCameraError('');
    setVerificationResult(null);
  };

  const activateCamera = () => {
    setCameraError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera access requires HTTPS or localhost in a supported browser.');
      return;
    }
    setIsCameraActive(true);
  };

  const submitLookup = (method, value) => (event) => {
    event.preventDefault();
    verifySeed(method, value);
  };

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Seed Verification</h1>
      <p className="mb-8 text-gray-600">
        Verify seed records using QR codes, barcodes, batch numbers, or blockchain IDs.
      </p>

      <section className="overflow-hidden rounded-lg shadow-md">
        <div className="flex overflow-x-auto border-b" role="tablist" aria-label="Verification methods">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`whitespace-nowrap px-6 py-3 text-lg font-medium ${activeTab === tab.id ? 'border-b-2 border-green-700 bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'}`}
              onClick={() => changeTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'qrScanner' && (
            <div>
              <h2 className="mb-4 text-xl font-bold">QR/Barcode Scanner</h2>
              <div className="mb-6 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-100 p-6">
                {isCameraActive ? (
                  <div className="w-full max-w-xl">
                    <video ref={videoRef} className="max-h-80 w-full rounded bg-black object-contain" autoPlay muted playsInline aria-label="Camera preview for QR and barcode scanning" />
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="text-sm text-gray-600">Point the camera at a QR code or barcode.</p>
                      <button type="button" className="rounded bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800" onClick={() => setIsCameraActive(false)}>Stop camera</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <svg className="mb-4 h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="mb-4 text-gray-600">Use camera to scan QR code or barcode</p>
                    <button type="button" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700" onClick={activateCamera}>Activate Camera</button>
                  </>
                )}
                {cameraError && <p className="mt-3 text-sm text-red-700" role="alert">{cameraError}</p>}
              </div>

              <p className="mb-4 text-gray-600">Or enter the QR/barcode manually:</p>
              <form onSubmit={submitLookup('qr/barcode', qrInput)}>
                <div className="flex">
                  <input
                    type="text"
                    value={qrInput}
                    onChange={(event) => setQrInput(event.target.value)}
                    placeholder="Enter QR/barcode value"
                    aria-label="QR or barcode value"
                    className="min-w-0 flex-1 rounded-l border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button type="submit" disabled={isVerifying} className="flex items-center justify-center rounded-r bg-green-700 px-6 py-2 text-white hover:bg-green-800 disabled:opacity-60">
                    {isVerifying ? 'Looking up...' : 'Verify'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'batchNumber' && (
            <div>
              <h2 className="mb-4 text-xl font-bold">Batch Number Verification</h2>
              <p className="mb-6 text-gray-600">Enter the batch number printed on the seed package to find its verification record.</p>
              <form onSubmit={submitLookup('batch', batchInput)} className="space-y-4">
                <label htmlFor="batchNumber" className="block text-gray-700">
                  Batch Number
                  <input id="batchNumber" type="text" value={batchInput} onChange={(event) => setBatchInput(event.target.value)} placeholder="e.g. ECO-2025-07-A12" className="mt-2 w-full rounded border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </label>
                <button type="submit" disabled={isVerifying} className="w-full rounded bg-green-700 px-6 py-3 font-medium text-white hover:bg-green-800 disabled:opacity-60">
                  {isVerifying ? 'Looking up...' : 'Verify Batch Number'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'blockchain' && (
            <div>
              <h2 className="mb-4 text-xl font-bold">Blockchain Lookup</h2>
              <p className="mb-6 text-gray-600">Enter a blockchain ID or hash associated with a seed verification record.</p>
              <form onSubmit={submitLookup('blockchain', blockchainInput)} className="space-y-4">
                <label htmlFor="blockchainId" className="block text-gray-700">
                  Blockchain ID / Hash
                  <input id="blockchainId" type="text" value={blockchainInput} onChange={(event) => setBlockchainInput(event.target.value)} placeholder="Enter blockchain ID or hash" className="mt-2 w-full rounded border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </label>
                <button type="submit" disabled={isVerifying} className="w-full rounded bg-green-700 px-6 py-3 font-medium text-white hover:bg-green-800 disabled:opacity-60">
                  {isVerifying ? 'Looking up...' : 'Look Up Blockchain Record'}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>

      {verificationResult && (
        <section className={`mt-8 rounded-lg border-2 p-6 ${verificationResult.verified ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`} aria-live="polite">
          {verificationResult.verified ? (
            <>
              <h2 className="mb-4 text-xl font-bold text-green-800">Seed Record Found</h2>
              <dl className="grid gap-4 md:grid-cols-2">
                <div><dt className="font-medium">Seed type</dt><dd>{verificationResult.seedType}</dd></div>
                <div><dt className="font-medium">Supplier</dt><dd>{verificationResult.supplier}</dd></div>
                <div><dt className="font-medium">Batch number</dt><dd>{verificationResult.batchNumber}</dd></div>
                <div><dt className="font-medium">Record date</dt><dd>{verificationResult.lastVerifiedDate}</dd></div>
                <div className="md:col-span-2"><dt className="font-medium">Blockchain ID</dt><dd className="break-all font-mono text-sm">{verificationResult.blockchainId}</dd></div>
              </dl>
              {verificationResult.certifications.length > 0 && (
                <div className="mt-5">
                  <h3 className="mb-2 font-medium">Certifications</h3>
                  <ul className="flex flex-wrap gap-2">{verificationResult.certifications.map((item) => <li key={item} className="rounded bg-green-100 px-3 py-1 text-sm text-green-800">{item}</li>)}</ul>
                </div>
              )}
              {verificationResult.plantingRegions.length > 0 && (
                <div className="mt-5">
                  <h3 className="mb-2 font-medium">Planting regions</h3>
                  <ul className="flex flex-wrap gap-2">{verificationResult.plantingRegions.map((item) => <li key={item} className="rounded bg-blue-100 px-3 py-1 text-sm text-blue-800">{item}</li>)}</ul>
                </div>
              )}
              <p className="mt-5 border-t border-green-200 pt-4 text-sm text-gray-700">Matched by {verificationResult.matchedBy}. This result confirms a matching record in Loryi; it does not independently validate an external blockchain.</p>
            </>
          ) : (
            <>
              <h2 className="mb-2 text-xl font-bold text-red-800">No Matching Record</h2>
              <p className="text-red-700">{verificationResult.message}</p>
            </>
          )}
        </section>
      )}
    </div>
  );
};

export default SeedVerification;