import React from 'react';
import TaskList from '../TaskList';

const TaskDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Task Scheduler</h1>
        <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
          <i className="fa-solid fa-plus mr-2"></i> Add New Task
        </button>
      </div>
      
      <div className="flex space-x-4 mb-4">
        <button className="px-4 py-2 bg-green-600 text-white rounded-md">All Tasks</button>
        <button className="px-4 py-2 bg-white text-gray-700 rounded-md border border-gray-300">Pending</button>
        <button className="px-4 py-2 bg-white text-gray-700 rounded-md border border-gray-300">Completed</button>
        <button className="px-4 py-2 bg-white text-gray-700 rounded-md border border-gray-300">Overdue</button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Scheduled Tasks</h2>
        <TaskList />
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Seasonal Planning Calendar</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Jan</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Feb</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Mar</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Apr</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">May</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Jun</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Jul</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Aug</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Sep</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Oct</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Nov</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Dec</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Corn</td>
                <td className="py-4 bg-gray-100"></td>
                <td className="py-4 bg-gray-100"></td>
                <td className="py-4 bg-gray-100"></td>
                <td className="py-4 bg-green-100">Plant</td>
                <td className="py-4 bg-green-100">Plant</td>
                <td className="py-4 bg-blue-100">Grow</td>
                <td className="py-4 bg-blue-100">Grow</td>
                <td className="py-4 bg-blue-100">Grow</td>
                <td className="py-4 bg-amber-100">Harvest</td>
                <td className="py-4 bg-amber-100">Harvest</td>
                <td className="py-4 bg-gray-100"></td>
                <td className="py-4 bg-gray-100"></td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Wheat</td>
                <td className="py-4 bg-blue-100">Grow</td>
                <td className="py-4 bg-blue-100">Grow</td>
                <td className="py-4 bg-blue-100">Grow</td>
                <td className="py-4 bg-blue-100">Grow</td>
                <td className="py-4 bg-blue-100">Grow</td>
                <td className="py-4 bg-amber-100">Harvest</td>
                <td className="py-4 bg-amber-100">Harvest</td>
                <td className="py-4 bg-gray-100"></td>
                <td className="py-4 bg-gray-100"></td>
                <td className="py-4 bg-green-100">Plant</td>
                <td className="py-4 bg-green-100">Plant</td>
                <td className="py-4 bg-blue-100">Grow</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Soybeans</td>
                <td className="py-4 bg-gray-100"></td>
                <td className="py-4 bg-gray-100"></td>
                <td className="py-4 bg-gray-100"></td>
                <td className="py-4 bg-gray-100"></td>
                <td className="py-4 bg-green-100">Plant</td>
                <td className="py-4 bg-green-100">Plant</td>
                <td className="py-4 bg-blue-100">Grow</td>
                <td className="py-4 bg-blue-100">Grow</td>
                <td className="py-4 bg-amber-100">Harvest</td>
                <td className="py-4 bg-amber-100">Harvest</td>
                <td className="py-4 bg-gray-100"></td>
                <td className="py-4 bg-gray-100"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TaskDashboard;