import React from 'react';

const StatsCard = ({ title, value, change, changeType, changeText, icon, iconBg, iconColor }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow flex flex-col h-full">
      <div className="flex items-center">
        <div className={`${iconBg} rounded-full p-3`}>
          <div className={iconColor}>
            {icon}
          </div>
        </div>
        <div className="ml-auto">
          {change !== undefined && (
            <div className={`flex items-center text-sm ${
              changeType === 'increase' ? 'text-green-600' : 'text-red-600'
            }`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 mr-1 ${
                  changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    changeType === 'increase'
                      ? 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
                      : 'M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6'
                  }
                />
              </svg>
              {Math.abs(change)}%
            </div>
          )}
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
        {changeText && (
          <p className="text-xs text-gray-500 mt-2">{changeText}</p>
        )}
      </div>
    </div>
  );
};

export default StatsCard;