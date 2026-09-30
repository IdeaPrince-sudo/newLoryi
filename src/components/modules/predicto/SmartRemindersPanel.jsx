import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';

export default function SmartRemindersPanel({ location = { name: 'Greater Accra' } }) {
    const [reminders, setReminders] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
      api.weather(location)
        .then((weather) => setReminders(weather.reminders))
        .catch((requestError) => setError(requestError.message || 'Unable to load live reminders.'));
    }, [location]);
  
    return (
      <div className="bg-white shadow rounded-lg p-4 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          🔔 <span className="ml-2">Smart Reminders</span>
        </h2>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!error && !reminders.length && <p className="text-sm text-gray-500">Loading live reminders...</p>}
        <ul className="space-y-3">
          {reminders.map((reminder, index) => (
            <li
              key={index}
              className="flex items-start bg-gray-50 p-3 rounded-md border border-gray-100 shadow-sm hover:bg-gray-100 transition"
            >
              <span className="text-xl mr-3">{reminder.icon}</span>
              <span className="text-sm text-gray-700">{reminder.message}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  