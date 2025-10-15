import React from 'react';
import ActivityLogList from '../ActivityLogList';

const ActivityDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Activity Logs</h1>
        <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
          <i className="fa-solid fa-plus mr-2"></i> Add New Activity
        </button>
      </div>
      
      <div className="flex space-x-4 mb-4">
        <button className="px-4 py-2 bg-green-600 text-white rounded-md">All Activities</button>
        <button className="px-4 py-2 bg-white text-gray-700 rounded-md border border-gray-300">Field Operations</button>
        <button className="px-4 py-2 bg-white text-gray-700 rounded-md border border-gray-300">Maintenance</button>
        <button className="px-4 py-2 bg-white text-gray-700 rounded-md border border-gray-300">Treatments</button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Recent Activities</h2>
        <ActivityLogList />
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Add New Activity Log</h2>
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="activity-date" className="block text-sm font-medium text-gray-700">Date</label>
              <input 
                type="date" 
                id="activity-date" 
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" 
              />
            </div>
            <div>
              <label htmlFor="activity-type" className="block text-sm font-medium text-gray-700">Activity Type</label>
              <select 
                id="activity-type" 
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" 
              >
                <option value="">Select Type</option>
                <option value="field-operation">Field Operation</option>
                <option value="maintenance">Maintenance</option>
                <option value="treatment">Treatment</option>
                <option value="harvest">Harvest</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="activity-description" className="block text-sm font-medium text-gray-700">Activity Description</label>
            <input 
              type="text" 
              id="activity-description" 
              placeholder="Brief description of the activity"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" 
            />
          </div>
          
          <div>
            <label htmlFor="activity-notes" className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea 
              id="activity-notes" 
              rows={3} 
              placeholder="Additional details about the activity"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" 
            ></textarea>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="activity-user" className="block text-sm font-medium text-gray-700">Performed By</label>
              <select 
                id="activity-user" 
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" 
              >
                <option value="">Select User</option>
                <option value="john">John</option>
                <option value="maria">Maria</option>
                <option value="david">David</option>
                <option value="sarah">Sarah</option>
                <option value="mike">Mike</option>
              </select>
            </div>
            <div>
              <label htmlFor="activity-location" className="block text-sm font-medium text-gray-700">Location/Field</label>
              <select 
                id="activity-location" 
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" 
              >
                <option value="">Select Location</option>
                <option value="north">North Field</option>
                <option value="east">East Field</option>
                <option value="south">South Field</option>
                <option value="west">West Field</option>
                <option value="barn">Barn</option>
                <option value="greenhouse">Greenhouse</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button type="button" className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none">
              Save Activity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActivityDashboard;