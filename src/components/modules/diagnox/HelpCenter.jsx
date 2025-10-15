import React from 'react';

const HelpCenter = () => {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Help Center</h2>

      <div className="space-y-4 text-sm text-gray-700">
        <div>
          <h3 className="font-semibold text-gray-900">1. How to scan a plant?</h3>
          <p>Navigate to the "Scan & Diagnose" tab, upload a clear image of the affected plant area, and the system will analyze the image for diseases or pests.</p>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900">2. What if I don’t have an image?</h3>
          <p>Use the "Manual Diagnosis" tab to describe the symptoms in detail and receive a suggested diagnosis based on your input.</p>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900">3. Is this tool accurate?</h3>
          <p>The tool uses AI trained on thousands of plant disease samples, but always cross-check with a local agronomist for critical cases.</p>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900">4. How do I report an issue?</h3>
          <p>Contact support through the app’s main Help section or send an email to <a href="mailto:support@loryiai.com" className="text-orange-600 underline">support@loryiai.com</a>.</p>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
