import React, { useState } from 'react';
import { resourcesData } from '../../../data/farm-data/mockFarmData';

const ResourceManagement = () => {
  const [resources, setResources] = useState(resourcesData);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [newResource, setNewResource] = useState({
    type: '',
    name: '',
    quantity: '',
    unit: '',
    cost: '',
    purchaseDate: '',
    expiryDate: '',
  });

  const resourceTypes = ['Seeds', 'Fertilizer', 'Pesticide', 'Equipment', 'Other'];
  
  const filteredResources = resources.filter(resource => {
    const matchesFilter = filter === 'all' || resource.type === filter;
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewResource(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newItem = {
      id: resources.length + 1,
      ...newResource,
      cost: parseFloat(newResource.cost),
      quantity: parseFloat(newResource.quantity)
    };
    
    setResources(prev => [...prev, newItem]);
    setNewResource({
      type: '',
      name: '',
      quantity: '',
      unit: '',
      cost: '',
      purchaseDate: '',
      expiryDate: '',
    });
    setIsFormVisible(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const calculateTotalValue = () => {
    return resources.reduce((total, resource) => total + resource.cost, 0);
  };

  const checkExpiry = (expiryDate) => {
    if (!expiryDate) return { status: 'none', class: '' };
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysToExpiry = Math.round((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (daysToExpiry < 0) {
      return { status: 'Expired', class: 'text-red-600' };
    } else if (daysToExpiry <= 30) {
      return { status: `Expires in ${daysToExpiry} days`, class: 'text-amber-600' };
    } else {
      return { status: 'Valid', class: 'text-green-600' };
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Resource Management</h2>
        <button
          onClick={() => setIsFormVisible(!isFormVisible)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          {isFormVisible ? 'Cancel' : 'Add Resource'}
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 space-y-2 md:space-y-0">
        <div className="w-full md:w-1/3">
          <input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Filter by type:</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Types</option>
            {resourceTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>
      
      {isFormVisible && (
        <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Add New Resource</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                name="type"
                value={newResource.type}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select Type</option>
                {resourceTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={newResource.name}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="e.g., Corn Seeds - Hybrid"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                name="quantity"
                min="0"
                step="0.01"
                value={newResource.quantity}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="e.g., 100"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <input
                type="text"
                name="unit"
                value={newResource.unit}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="e.g., kg, liters, pieces"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost ($)</label>
              <input
                type="number"
                name="cost"
                min="0"
                step="0.01"
                value={newResource.cost}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="e.g., 500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
              <input
                type="date"
                name="purchaseDate"
                value={newResource.purchaseDate}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (if applicable)</label>
              <input
                type="date"
                name="expiryDate"
                value={newResource.expiryDate}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Add Resource
            </button>
          </div>
        </form>
      )}
      
      <div className="bg-gray-50 p-3 rounded-md mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-3 rounded-md shadow-sm">
            <p className="text-sm text-gray-500">Total Resources</p>
            <p className="text-xl font-bold">{resources.length}</p>
          </div>
          <div className="bg-white p-3 rounded-md shadow-sm">
            <p className="text-sm text-gray-500">Total Value</p>
            <p className="text-xl font-bold">${calculateTotalValue().toLocaleString()}</p>
          </div>
          <div className="bg-white p-3 rounded-md shadow-sm">
            <p className="text-sm text-gray-500">Resource Types</p>
            <p className="text-xl font-bold">{new Set(resources.map(r => r.type)).size}</p>
          </div>
        </div>
      </div>
      
      {filteredResources.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No resources found matching your filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredResources.map((resource) => {
                const expiry = checkExpiry(resource.expiryDate);
                return (
                  <tr key={resource.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{resource.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{resource.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {resource.quantity} {resource.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${resource.cost.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(resource.purchaseDate)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${expiry.class}`}>
                      {expiry.status}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ResourceManagement;