import React, { useState } from "react";
import { useAuth } from "../../../../contexts/AuthContext";

function InvestorDirectory() {
  const { currentUser, updateCredits } = useAuth();

  const userCredits = currentUser?.credits ?? 0;

  // Deduct credits if enough available, return true if success
  const useCredits = (amount) => {
    if (userCredits >= amount) {
      // Deduct credits by passing negative amountChange
      const newBalance = updateCredits(-amount);
      // Check if deduction succeeded and newBalance is updated
      return newBalance !== undefined && newBalance >= 0;
    }
    return false;
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    investmentSize: [],
    categories: [],
    region: [],
  });
  const [selectedInvestor, setSelectedInvestor] = useState(null);

  const canViewProfiles = userCredits > 0;
  const canContactInvestors = userCredits > 0;

  const investors = [
    {
      id: 1,
      name: "Green Growth Capital",
      type: "Investment Firm",
      interests: ["Sustainable Farming", "Organic Production", "Agritech"],
      minInvestment: "$2,000",
      maxInvestment: "$15,000",
      regions: ["Eastern Region", "Central Region"],
      description:
        "Green Growth Capital focuses on environmentally sustainable agricultural projects with good growth potential.",
      contactName: "Sarah Johnson",
      profileImage: "https://randomuser.me/api/portraits/women/45.jpg",
      successStories: [
        "Funded 12 successful organic farms",
        "Helped expand 5 sustainable rice production projects",
      ],
    },
    {
      id: 2,
      name: "AgriVest Partners",
      type: "Angel Investor",
      interests: ["Livestock", "Dairy", "Farm Expansion"],
      minInvestment: "$5,000",
      maxInvestment: "$30,000",
      regions: ["Western District", "Northern Province"],
      description:
        "AgriVest Partners specializes in livestock and dairy farming investments with proven operational models.",
      contactName: "Michael Chen",
      profileImage: "https://randomuser.me/api/portraits/men/32.jpg",
      successStories: [
        "Successfully funded 8 dairy farm expansions",
        "Invested in 15 poultry operations with above-market returns",
      ],
    },
    {
      id: 3,
      name: "Harvest Fund",
      type: "Agricultural Fund",
      interests: ["Crop Farming", "Irrigation Projects", "Value Addition"],
      minInvestment: "$3,000",
      maxInvestment: "$20,000",
      regions: ["All Regions"],
      description:
        "Harvest Fund provides financing for crop farming projects with focus on modern irrigation and value addition.",
      contactName: "Elizabeth Mutai",
      profileImage: "https://randomuser.me/api/portraits/women/22.jpg",
      successStories: [
        "Funded 20+ successful crop farming projects",
        "Specializes in irrigation system upgrades",
      ],
    },
  ];

  const filterOptions = {
    investmentSize: ["Under $5,000", "$5,000 - $15,000", "Over $15,000"],
    categories: [
      "Crop Farming",
      "Livestock",
      "Dairy",
      "Organic",
      "Sustainable",
      "Agritech",
      "Value Addition",
    ],
    region: [
      "Eastern Region",
      "Central Region",
      "Western District",
      "Northern Province",
      "All Regions",
    ],
  };

  const handleFilterChange = (category, value) => {
    setSelectedFilters((prev) => {
      const updated = { ...prev };
      if (updated[category].includes(value)) {
        updated[category] = updated[category].filter((item) => item !== value);
      } else {
        updated[category] = [...updated[category], value];
      }
      return updated;
    });
  };

  const filteredInvestors = investors.filter((investor) => {
    if (
      searchTerm &&
      !investor.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !investor.type.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !investor.interests.some((interest) =>
        interest.toLowerCase().includes(searchTerm.toLowerCase())
      )
    ) {
      return false;
    }

    if (selectedFilters.investmentSize.length > 0) {
      const minInvest = parseInt(investor.minInvestment.replace(/[^0-9]/g, ""));
      const maxInvest = parseInt(investor.maxInvestment.replace(/[^0-9]/g, ""));

      const matchesSize = selectedFilters.investmentSize.some((size) => {
        if (size === "Under $5,000" && minInvest < 5000) return true;
        if (size === "$5,000 - $15,000" && minInvest >= 5000 && maxInvest <= 15000)
          return true;
        if (size === "Over $15,000" && maxInvest > 15000) return true;
        return false;
      });

      if (!matchesSize) return false;
    }

    if (selectedFilters.categories.length > 0) {
      const matchesCategory = investor.interests.some((interest) =>
        selectedFilters.categories.some((category) => interest.includes(category))
      );
      if (!matchesCategory) return false;
    }

    if (selectedFilters.region.length > 0) {
      const matchesRegion = investor.regions.some(
        (region) =>
          selectedFilters.region.includes(region) ||
          investor.regions.includes("All Regions")
      );
      if (!matchesRegion) return false;
    }

    return true;
  });

  const handleViewProfile = (investor) => {
    if (userCredits >= 5 && useCredits(5)) {
      setSelectedInvestor(investor);
    } else {
      alert("Not enough credits! You need 5 credits to view an investor profile.");
    }
  };

  const handleContactInvestor = () => {
    if (!canContactInvestors) {
      alert("Please log in to contact investors.");
      return;
    }
    if (userCredits >= 10 && useCredits(10)) {
      alert("Contact request sent! The investor will receive your contact information.");
      setSelectedInvestor(null);
    } else {
      alert("Not enough credits! You need 10 credits to contact an investor.");
    }
  };

  return (
    <div className="investor-directory space-y-6 p-4">
      <h1 className="text-2xl font-bold text-gray-800">Investor Directory</h1>
      <p className="text-gray-600">
        Find and connect with investors interested in agricultural projects
      </p>

      {/* Credits Display */}
      <div className="p-4 bg-blue-50 rounded-md flex justify-between items-center">
        <div>
          <h3 className="font-medium text-blue-800">Credits Information</h3>
          <p className="text-sm text-blue-600">Viewing profile: 5 credits</p>
          <p className="text-sm text-blue-600">Contacting investor: 10 credits</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-blue-600">Your credits</p>
          <p className="font-bold text-xl text-blue-800">{userCredits}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <input
          type="text"
          placeholder="Search investors by name, type or interests..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(filterOptions).map(([category, options]) => (
            <div key={category}>
              <h3 className="font-medium text-gray-700 mb-2">
                {category === "investmentSize"
                  ? "Investment Size"
                  : category === "categories"
                  ? "Investment Categories"
                  : "Region"}
              </h3>
              <div
                className={
                  category === "categories"
                    ? "grid grid-cols-2 gap-x-2 gap-y-1"
                    : "space-y-2"
                }
              >
                {options.map((option) => (
                  <div key={option} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`${category}-${option}`}
                      checked={selectedFilters[category].includes(option)}
                      onChange={() => handleFilterChange(category, option)}
                      className="mr-2"
                    />
                    <label
                      htmlFor={`${category}-${option}`}
                      className="text-sm text-gray-600"
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Investor Cards */}
      <div className="space-y-4">
        {filteredInvestors.length > 0 ? (
          filteredInvestors.map((investor) => (
            <div
              key={investor.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm p-5"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">
                    {investor.name}
                  </h3>
                  <p className="text-sm text-gray-500">{investor.type}</p>
                </div>
                <button
                  onClick={() => handleViewProfile(investor)}
                  disabled={!canViewProfiles || userCredits < 5}
                  className={`px-3 py-1 rounded-md text-sm text-white ${
                    userCredits < 5
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  View Profile (5 credits)
                </button>
              </div>
              <p className="mt-3 text-sm text-gray-700">{investor.description}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-8 bg-white border rounded-lg">
            <p className="text-gray-500">No investors match your search.</p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedFilters({ investmentSize: [], categories: [], region: [] });
              }}
              className="mt-2 text-green-600 hover:text-green-700 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Investor Modal */}
      {selectedInvestor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center">
                <img
                  src={selectedInvestor.profileImage}
                  alt={selectedInvestor.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="ml-4">
                  <h2 className="text-xl font-semibold">{selectedInvestor.name}</h2>
                  <p className="text-gray-600">{selectedInvestor.type}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedInvestor(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <h3 className="text-lg font-medium mb-2">About</h3>
            <p className="text-gray-700 mb-4">{selectedInvestor.description}</p>

            <h3 className="text-lg font-medium mb-2">Contact Investor</h3>
            <button
              onClick={handleContactInvestor}
              className={`px-4 py-2 rounded-md text-white ${
                userCredits >= 10
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
              disabled={userCredits < 10}
            >
              Request Contact Details (10 credits)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default InvestorDirectory;
