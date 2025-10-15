import React, { useState } from 'react';
import { useAuth } from  "../../../../contexts/AuthContext"

const institutionTypes = [
  "Bank",
  "Microfinance",
  "Insurance",
  "Credit Union",
  "Government Program",
];

const filterOptions = {
  type: [...institutionTypes],
  services: [
    "Farm Loans", "Equipment Financing", "Crop Insurance", "Livestock Insurance",
    "Savings", "Weather Index Insurance", "Group Lending"
  ],
  region: ["Eastern Region", "Central Region", "Western District", "Northern Province", "Southern Plains", "All Regions"]
};

function InstitutionForm({ onSave, initialData, onCancel }) {
  const [formData, setFormData] = useState(
    initialData || {
      name: '',
      type: 'Bank',
      services: [],
      regions: [],
      description: '',
      interestRates: '',
      premiums: '',
      requirements: [],
      contactInfo: { phone: '', email: '', website: '' },
      image: '',
      packages: [],
    }
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'services' || name === 'regions' || name === 'requirements' || name === 'packages') {
      // For checkbox arrays
      let updatedArr = [...formData[name]];
      if (checked) {
        if (!updatedArr.includes(value)) updatedArr.push(value);
      } else {
        updatedArr = updatedArr.filter(item => item !== value);
      }
      setFormData({ ...formData, [name]: updatedArr });
    } else if (name.startsWith('contactInfo.')) {
      const key = name.split('.')[1];
      setFormData({ ...formData, contactInfo: { ...formData.contactInfo, [key]: value } });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md space-y-4 max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold">{initialData ? 'Edit Institution' : 'Add Institution'}</h2>

      <div>
        <label className="block font-medium">Name</label>
        <input name="name" value={formData.name} onChange={handleChange} required
          className="w-full border border-gray-300 rounded px-3 py-2" />
      </div>

      <div>
        <label className="block font-medium">Type</label>
        <select name="type" value={formData.type} onChange={handleChange} required
          className="w-full border border-gray-300 rounded px-3 py-2">
          {institutionTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-medium mb-1">Services</label>
        {filterOptions.services.map(service => (
          <label key={service} className="inline-flex items-center mr-4">
            <input
              type="checkbox"
              name="services"
              value={service}
              checked={formData.services.includes(service)}
              onChange={handleChange}
              className="mr-1"
            />
            {service}
          </label>
        ))}
      </div>

      <div>
        <label className="block font-medium mb-1">Regions</label>
        {filterOptions.region.map(region => (
          <label key={region} className="inline-flex items-center mr-4">
            <input
              type="checkbox"
              name="regions"
              value={region}
              checked={formData.regions.includes(region)}
              onChange={handleChange}
              className="mr-1"
            />
            {region}
          </label>
        ))}
      </div>

      <div>
        <label className="block font-medium">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full border border-gray-300 rounded px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block font-medium">Interest Rates (if applicable)</label>
        <input
          name="interestRates"
          value={formData.interestRates}
          onChange={handleChange}
          placeholder="e.g., 8-12% annually"
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-medium">Premiums (if applicable)</label>
        <input
          name="premiums"
          value={formData.premiums}
          onChange={handleChange}
          placeholder="Insurance premiums details"
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Requirements</label>
        {/* For requirements, simple comma separated input */}
        <input
          name="requirements"
          value={formData.requirements.join(', ')}
          onChange={e => setFormData({ ...formData, requirements: e.target.value.split(',').map(r => r.trim()) })}
          placeholder="Separate requirements with commas"
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-medium">Contact Phone</label>
        <input
          name="contactInfo.phone"
          value={formData.contactInfo.phone}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="+123-456-7890"
        />
      </div>

      <div>
        <label className="block font-medium">Contact Email</label>
        <input
          name="contactInfo.email"
          type="email"
          value={formData.contactInfo.email}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="example@mail.com"
        />
      </div>

      <div>
        <label className="block font-medium">Website</label>
        <input
          name="contactInfo.website"
          value={formData.contactInfo.website}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="https://website.com"
        />
      </div>

      <div>
        <label className="block font-medium">Image URL</label>
        <input
          name="image"
          value={formData.image}
          onChange={handleChange}
          placeholder="https://image.url"
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Packages</label>
        {["Financial", "Insurance", "Security"].map(pkg => (
          <label key={pkg} className="inline-flex items-center mr-4">
            <input
              type="checkbox"
              name="packages"
              value={pkg}
              checked={formData.packages.includes(pkg)}
              onChange={handleChange}
              className="mr-1"
            />
            {pkg}
          </label>
        ))}
      </div>

      <div className="flex space-x-4 mt-4">
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Save
        </button>
        <button type="button" onClick={onCancel} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">
          Cancel
        </button>
      </div>
    </form>
  );
}

function FinancialDirectory({ providerType = 'all' }) {
  const { currentUser } = useAuth();

  const userRole = currentUser?.role || 'farmer';
  const currentUserId = currentUser?.id || null;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    type: [],
    services: [],
    region: []
  });
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [editingInstitution, setEditingInstitution] = useState(null);
  const [institutions, setInstitutions] = useState([
    {
      id: 1,
      ownerId: '5', // provider user id
      name: "AgriFinance Bank",
      type: "Bank",
      services: ["Farm Loans", "Equipment Financing", "Crop Insurance"],
      regions: ["All Regions"],
      description: "AgriFinance Bank specializes in agricultural financing solutions with competitive interest rates and flexible repayment terms.",
      interestRates: "8-12% annually",
      requirements: ["Farm registration", "Business plan", "Collateral", "Credit history"],
      contactInfo: { phone: "+123-456-7890", email: "info@agrifinancebank.com", website: "www.agrifinancebank.com" },
      image: "https://randomuser.me/api/portraits/men/42.jpg",
      packages: ["Financial"],
    },
    {
      id: 2,
      ownerId: '5',
      name: "Rural Microfinance",
      type: "Microfinance",
      services: ["Small Farm Loans", "Group Lending", "Savings"],
      regions: ["Eastern Region", "Central Region"],
      description: "Rural Microfinance provides accessible financial services to smallholder farmers with minimal paperwork and quick approval.",
      interestRates: "14-18% annually",
      requirements: ["ID Card", "Farming activity proof", "Group membership (optional)"],
      contactInfo: { phone: "+123-456-7891", email: "contact@ruralmicrofinance.com", website: "www.ruralmicrofinance.com" },
      image: "https://randomuser.me/api/portraits/women/42.jpg",
      packages: ["Financial"],
    },
    {
      id: 3,
      ownerId: '5',
      name: "AgriShield Insurance",
      type: "Insurance",
      services: ["Crop Insurance", "Livestock Insurance", "Equipment Insurance", "Weather Index Insurance"],
      regions: ["All Regions"],
      description: "AgriShield offers comprehensive agricultural insurance products to protect farmers against various risks and uncertainties.",
      premiums: "Varies based on coverage and risk assessment",
      requirements: ["Farm details", "Asset information", "Risk assessment"],
      contactInfo: { phone: "+123-456-7892", email: "support@agrishield.com", website: "www.agrishield.com" },
      image: "https://randomuser.me/api/portraits/men/36.jpg",
      packages: ["Insurance"],
    },
    {
      id: 4,
      ownerId: '5',
      name: "Farmer's Cooperative Credit Union",
      type: "Credit Union",
      services: ["Member Loans", "Equipment Financing", "Seasonal Credit"],
      regions: ["Western District", "Northern Province"],
      description: "A member-owned financial cooperative providing loans and financial services exclusively to farmer members at favorable terms.",
      interestRates: "6-10% annually for members",
      requirements: ["Cooperative membership", "Member in good standing", "Business proposal"],
      contactInfo: { phone: "+123-456-7893", email: "members@farmerscu.org", website: "www.farmerscu.org" },
      image: "https://randomuser.me/api/portraits/women/36.jpg",
      packages: ["Financial"],
    }
  ]);

  const handleFilterChange = (category, value) => {
    setSelectedFilters(prev => {
      const updated = { ...prev };
      if (updated[category].includes(value)) {
        updated[category] = updated[category].filter(item => item !== value);
      } else {
        updated[category] = [...updated[category], value];
      }
      return updated;
    });
  };

  // Filter institutions based on search, filters, userRole and providerType
  const filteredInstitutions = institutions.filter(inst => {
    // If user is a provider, show only institutions they own
    if (userRole.includes('financial') || userRole.includes('insurance') || userRole.includes('security')) {
      if (inst.ownerId !== currentUserId) return false;
    } else {
      // For farmers or other roles, apply providerType filtering if needed
      if (providerType !== 'all' && !inst.packages.includes(providerType)) return false;
    }

    // Search filter
    if (searchTerm && !(
      inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.services.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
    )) return false;

    // Type filter
    if (selectedFilters.type.length && !selectedFilters.type.includes(inst.type)) return false;

    // Services filter
    if (selectedFilters.services.length && !selectedFilters.services.some(s => inst.services.includes(s))) return false;

    // Region filter
    if (selectedFilters.region.length && !selectedFilters.region.some(r => inst.regions.includes(r) || inst.regions.includes("All Regions"))) return false;

    return true;
  });

  const handleAddInstitution = () => {
    setEditingInstitution({
      name: '',
      type: 'Bank',
      services: [],
      regions: [],
      description: '',
      interestRates: '',
      premiums: '',
      requirements: [],
      contactInfo: { phone: '', email: '', website: '' },
      image: '',
      packages: [],
    });
  };

  const handleSaveInstitution = (data) => {
    if (editingInstitution && editingInstitution.id) {
      // Update existing institution
      setInstitutions(prev => prev.map(inst => inst.id === editingInstitution.id ? { ...data, id: inst.id, ownerId: currentUserId } : inst));
    } else {
      // Add new institution
      const newInst = { ...data, id: Date.now(), ownerId: currentUserId };
      setInstitutions(prev => [...prev, newInst]);
    }
    setEditingInstitution(null);
  };

  const handleEditInstitution = (inst) => {
    setEditingInstitution(inst);
  };

  const handleCancelEdit = () => {
    setEditingInstitution(null);
  };

  return (
    <div className="financial-directory space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-800">Financial Directory</h1>
        <p className="text-gray-600">Find financial institutions and insurance providers tailored for your farm</p>
      </header>

      {/* Show Add/Edit Form if editing */}
      {(userRole.includes('financial') || userRole.includes('insurance') || userRole.includes('security')) && (
        <div className="mb-6">
          {editingInstitution ? (
            <InstitutionForm
              initialData={editingInstitution}
              onSave={handleSaveInstitution}
              onCancel={handleCancelEdit}
            />
          ) : (
            <button
              onClick={handleAddInstitution}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
              Add Institution / Package
            </button>
          )}
        </div>
      )}

      {/* Search & Filters */}
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <input
          type="text"
          placeholder="Search by name, type or services..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["type", "services", "region"].map(category => (
            <div key={category}>
              <h3 className="font-medium text-gray-700 mb-2 capitalize">{category}</h3>
              <div className="space-y-2">
                {filterOptions[category].map(option => (
                  <label key={option} className="flex items-center text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={selectedFilters[category].includes(option)}
                      onChange={() => handleFilterChange(category, option)}
                      className="mr-2"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-between">
          <button
            onClick={() => setSelectedFilters({ type: [], services: [], region: [] })}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Clear Filters
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm">
            Apply Filters
          </button>
        </div>
      </section>

      {/* Institution List */}
      <section className="space-y-4">
        {filteredInstitutions.length ? (
          filteredInstitutions.map(inst => (
            <div key={inst.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="p-5 flex flex-col md:flex-row justify-between items-start">
                <div className="flex items-center mb-4 md:mb-0">
                  <img src={inst.image} alt={inst.name} className="w-14 h-14 rounded-full object-cover mr-4" />
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">{inst.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">{inst.type}</span>
                      <span className="text-sm text-gray-500">{inst.regions.join(", ")}</span>
                    </div>
                  </div>
                </div>

                <div className="space-x-2">
                  <button
                    onClick={() => setSelectedInstitution(inst)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm"
                  >
                    View Details
                  </button>

                  {/* Show edit button only to owner providers */}
                  {(userRole.includes('financial') || userRole.includes('insurance') || userRole.includes('security')) && inst.ownerId === currentUserId && (
                    <button
                      onClick={() => handleEditInstitution(inst)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md text-sm"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
              <div className="px-5 pb-5">
                <p className="text-gray-700">{inst.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {inst.services.map((s, i) => (
                    <span key={i} className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-md">{s}</span>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 text-sm flex flex-wrap justify-between">
                  {inst.interestRates && <span><b>Interest rates:</b> {inst.interestRates}</span>}
                  {inst.premiums && <span><b>Premiums:</b> {inst.premiums}</span>}
                  <span className="text-green-600">Contact for details</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 bg-white border border-gray-200 rounded-lg">
            <p className="text-gray-500">No financial institutions match your search criteria.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedFilters({ type: [], services: [], region: [] });
              }}
              className="mt-2 text-green-600 hover:text-green-700 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      {/* Institution Details Modal */}
      {selectedInstitution && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center">
                  <img src={selectedInstitution.image} alt={selectedInstitution.name} className="w-16 h-16 rounded-full object-cover" />
                  <div className="ml-4">
                    <h2 className="text-xl font-semibold">{selectedInstitution.name}</h2>
                    <div className="flex items-center mt-1 space-x-2">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">{selectedInstitution.type}</span>
                      <p className="text-sm text-gray-500">{selectedInstitution.regions.join(", ")}</p>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedInstitution(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
              </div>

              <section className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">About</h3>
                  <p className="text-gray-700">{selectedInstitution.description}</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Services Offered</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedInstitution.services.map((s, i) => (
                      <span key={i} className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-md">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedInstitution.interestRates && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Interest Rates</h3>
                      <p className="text-gray-700">{selectedInstitution.interestRates}</p>
                    </div>
                  )}
                  {selectedInstitution.premiums && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Insurance Premiums</h3>
                      <p className="text-gray-700">{selectedInstitution.premiums}</p>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Requirements</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {selectedInstitution.requirements.map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Contact Information</h3>
                  <p><strong>Phone:</strong> {selectedInstitution.contactInfo.phone}</p>
                  <p><strong>Email:</strong> {selectedInstitution.contactInfo.email}</p>
                  <p><strong>Website:</strong> {selectedInstitution.contactInfo.website}</p>
                  <div className="mt-4">
                    <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">
                      Request Information
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FinancialDirectory;
