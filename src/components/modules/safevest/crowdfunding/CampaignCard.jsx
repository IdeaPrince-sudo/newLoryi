import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const CampaignCard = ({ campaign }) => {
  // ✅ Fallback for missing campaign
  if (!campaign) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
        Campaign data not available.
      </div>
    );
  }

  const { 
    id, 
    title = 'Untitled Campaign', 
    description = 'No description provided.', 
    currentAmount = 0, 
    targetAmount = 1, 
    createdAt, 
    imageUrl, 
    category = 'General',
    daysLeft 
  } = campaign;

  // ✅ Safe progress calculation
  const progressPercentage = Math.min(Math.round((currentAmount / targetAmount) * 100), 100);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full">
      {/* ✅ Campaign Image */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={imageUrl || 'https://via.placeholder.com/400x200?text=Campaign+Image'} 
          alt={title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
          {category}
        </div>
      </div>
      
      {/* ✅ Content */}
      <div className="p-4 flex-grow">
        <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">{title}</h3>
        <p className="text-gray-600 mb-4 text-sm line-clamp-3">{description}</p>
        
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16">
            <CircularProgressbar
              value={progressPercentage}
              text={`${progressPercentage}%`}
              styles={buildStyles({
                pathColor: progressPercentage === 100 ? '#10B981' : '#3B82F6',
                textColor: '#1F2937',
                trailColor: '#E5E7EB',
                textSize: '22px',
              })}
            />
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">Progress</span>
              <span className="font-bold">
                ${currentAmount.toLocaleString()} of ${targetAmount.toLocaleString()}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 h-2 rounded-full">
              <div 
                className="h-full rounded-full" 
                style={{ 
                  width: `${progressPercentage}%`,
                  backgroundColor: progressPercentage === 100 ? '#10B981' : '#3B82F6', 
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* ✅ Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 mt-auto">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Created {formatDate(createdAt)}</span>
          <span className="font-medium text-orange-500">
            {daysLeft !== undefined ? `${daysLeft} days left` : 'No deadline'}
          </span>
        </div>
      </div>
    </div>
  );
};

// ✅ Date formatter with safety
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default CampaignCard;
