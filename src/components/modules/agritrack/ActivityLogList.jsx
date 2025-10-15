import React from 'react';
import { activityLogData } from '../agritrack/farmData';

const ActivityLogList = ({ limit }) => {
  // If limit is provided, only show that many activities
  const activities = limit ? activityLogData.slice(0, limit) : activityLogData;

  const getActivityTypeBadgeClass = (type) => {
    switch (type.toLowerCase()) {
      case 'field operation':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-blue-100 text-blue-800';
      case 'treatment':
        return 'bg-purple-100 text-purple-800';
      case 'harvest':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((activity, activityIdx) => (
          <li key={activity.id}>
            <div className="relative pb-8">
              {activityIdx !== activities.length - 1 ? (
                <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
              ) : null}
              <div className="relative flex items-start space-x-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center ring-8 ring-white">
                    {activity.type.toLowerCase() === 'field operation' && (
                      <i className="fas fa-tractor text-green-600"></i>
                    )}
                    {activity.type.toLowerCase() === 'maintenance' && (
                      <i className="fas fa-tools text-blue-600"></i>
                    )}
                    {activity.type.toLowerCase() === 'treatment' && (
                      <i className="fas fa-spray-can text-purple-600"></i>
                    )}
                    {activity.type.toLowerCase() === 'harvest' && (
                      <i className="fas fa-wheat-awn text-yellow-600"></i>
                    )}
                    {!['field operation', 'maintenance', 'treatment', 'harvest'].includes(activity.type.toLowerCase()) && (
                      <i className="fas fa-clipboard-list text-gray-600"></i>
                    )}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">
                        {activity.performedBy}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {activity.date} at {activity.location}
                    </p>
                  </div>
                  <div className="mt-2 text-sm text-gray-700">
                    <p>{activity.description}</p>
                  </div>
                  <div className="mt-2 flex items-center space-x-2">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getActivityTypeBadgeClass(activity.type)}`}>
                      {activity.type}
                    </span>
                    <button className="text-sm text-gray-500 hover:text-gray-700">
                      <i className="fas fa-info-circle mr-1"></i>
                      Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityLogList;