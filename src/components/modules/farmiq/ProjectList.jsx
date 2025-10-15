import React, { useState } from 'react';
import { farmProjectsData } from '../../../data/farm-data/mockFarmData';

const ProjectList = () => {
  const [projects, setProjects] = useState(farmProjectsData);
  const [selectedProject, setSelectedProject] = useState(null);
  const [view, setView] = useState('list'); // 'list' or 'detail'
  const [filter, setFilter] = useState('all');

  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(project => project.status === filter);

  const handleViewDetail = (project) => {
    setSelectedProject(project);
    setView('detail');
  };

  const handleBack = () => {
    setSelectedProject(null);
    setView('list');
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'planned':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityStatusClass = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'planned':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateProgress = (project) => {
    const totalActivities = project.activities.length;
    const completedActivities = project.activities.filter(act => act.status === 'completed').length;
    return totalActivities ? Math.round((completedActivities / totalActivities) * 100) : 0;
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (view === 'detail' && selectedProject) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={handleBack} 
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Projects
          </button>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(selectedProject.status)}`}>
            {selectedProject.status.charAt(0).toUpperCase() + selectedProject.status.slice(1)}
          </span>
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-800">{selectedProject.name}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-700">Project Details</h3>
              <div className="mt-2 bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Location</p>
                    <p className="font-medium">{selectedProject.location}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Land Size</p>
                    <p className="font-medium">{selectedProject.landSize} {selectedProject.sizeUnit}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Start Date</p>
                    <p className="font-medium">{formatDate(selectedProject.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Expected Harvest</p>
                    <p className="font-medium">{formatDate(selectedProject.expectedHarvestDate)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Soil Type</p>
                    <p className="font-medium">{selectedProject.soilType}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Soil pH</p>
                    <p className="font-medium">{selectedProject.soilpH}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-700">Financial Overview</h3>
              <div className="mt-2 bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Budget</p>
                    <p className="font-medium">${selectedProject.budget.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Current Expenses</p>
                    <p className="font-medium">${selectedProject.expenses.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Estimated Yield</p>
                    <p className="font-medium">{selectedProject.estimatedYield.toLocaleString()} kg</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Estimated Revenue</p>
                    <p className="font-medium">${selectedProject.estimatedRevenue.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between mb-1 text-sm">
                    <span className="text-gray-500">Budget Usage</span>
                    <span className="font-medium">{Math.round((selectedProject.expenses / selectedProject.budget) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(100, Math.round((selectedProject.expenses / selectedProject.budget) * 100))}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-700">Project Activities</h3>
            <div className="mt-2 space-y-3">
              {selectedProject.activities.map((activity) => (
                <div key={activity.id} className="bg-gray-50 p-3 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{activity.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getActivityStatusClass(activity.status)}`}>
                      {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 text-sm">
                    <div>
                      <p className="text-gray-500">Date</p>
                      <p>{formatDate(activity.startDate)} - {formatDate(activity.endDate)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Cost</p>
                      <p>${activity.cost.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6">
              <button className="w-full flex justify-center items-center py-2 px-4 border border-green-500 text-green-600 rounded-md hover:bg-green-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Activity
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Farm Projects</h2>
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="all">All Projects</option>
            <option value="active">Active</option>
            <option value="planned">Planned</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>
      
      {filteredProjects.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No projects found matching the selected filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProjects.map((project) => (
            <div 
              key={project.id} 
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewDetail(project)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-800">{project.name}</h3>
                  <p className="text-sm text-gray-500">{project.location} • {project.landSize} {project.sizeUnit}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(project.status)}`}>
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </span>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Start Date</p>
                  <p>{formatDate(project.startDate)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Harvest Date</p>
                  <p>{formatDate(project.expectedHarvestDate)}</p>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between mb-1 text-sm">
                  <span className="text-gray-500">Progress</span>
                  <span>{calculateProgress(project)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full" 
                    style={{ width: `${calculateProgress(project)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;