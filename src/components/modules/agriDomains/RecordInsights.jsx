import React from 'react';
import { Lightbulb } from 'lucide-react';

const RecordInsights = ({ items, emptyMessage = 'Add records to see summaries here.' }) => (
  <section aria-labelledby="record-insights-heading" className="rounded-lg border border-gray-200 bg-white p-4">
    <div className="flex items-start gap-3">
      <Lightbulb className="mt-0.5 shrink-0 text-amber-600" size={19} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h2 id="record-insights-heading" className="text-sm font-semibold text-gray-950">Insights from your records</h2>
          <span className="text-xs text-gray-500">Automatically summarized · not expert diagnosis</span>
        </div>
        {items.length ? (
          <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
            {items.map((item) => (
              <li key={item} className="flex gap-2 text-sm leading-5 text-gray-700">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : <p className="mt-2 text-sm text-gray-600">{emptyMessage}</p>}
      </div>
    </div>
  </section>
);

export default RecordInsights;