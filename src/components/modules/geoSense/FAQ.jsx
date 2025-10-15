import React from "react";

export default function FAQ() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>

      <ul className="list-disc list-inside space-y-3">
        <li>
          <strong>Q:</strong> How do I get accurate soil data?
          <br />
          <strong>A:</strong> Use the Dashboard to fetch your GPS location and get soil data from sensors or labs.
        </li>
        <li>
          <strong>Q:</strong> Can I save my soil test history?
          <br />
          <strong>A:</strong> Yes, soil tests are saved in your browser and displayed in the History page.
        </li>
        <li>
          <strong>Q:</strong> How often should I test my soil?
          <br />
          <strong>A:</strong> Ideally every 6 months or before planting major crops.
        </li>
      </ul>
    </div>
  );
}
