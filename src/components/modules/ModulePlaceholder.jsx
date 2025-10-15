import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const ModulePlaceholder = ({ title, description }) => {
  const { currentUser } = useAuth();
  
  return (
    <div className="h-full">
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          <div className="flex items-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
              Active
            </span>
          </div>
        </div>
        <p className="text-gray-600 mb-4">{description}</p>
        
        {/* User Role Badge */}
        <div className="inline-flex items-center px-3 py-1 mb-6 rounded text-sm font-medium bg-blue-50 text-blue-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {currentUser?.role.charAt(0).toUpperCase() + currentUser?.role.slice(1)}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center text-center">
        <div className="bg-green-50 rounded-full p-5 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Module Under Development</h3>
        <p className="text-gray-600 mb-6">
          This module is currently being developed and will be available soon. 
          Our team is working hard to bring you the best agricultural technology solutions.
        </p>
        <button className="px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 transition duration-150 ease-in-out">
          Request Early Access
        </button>
      </div>
    </div>
  );
};

export default ModulePlaceholder;