import React, { useState } from "react"
import AIAnalysis from "./AIAnalysis";
import DNAAnalysis from "./DNAAnalysis";
import SeedVerification from "./SeedVerification";
import GeoMapping from "./GeoMapping";


// Tabs definition
const tabs = [
  { id: "aiAnalysis", name: "AI Analysis", icon: "M3 12h18M12 3v18" },
  { id: "dNAAnalysis", name: "DNA Analysis", icon: "M9 17v-2m3 2v-4m3 4v-6" },
  { id: "seedVerification", name: "Seed Verification", icon: "M12 2C8 2 4 6 4 10c0 5 8 12 8 12s8-7 8-12c0-4-4-8-8-8z" },
  { id: "geoMapping", name: "GeoMapping", icon: "M3 7h18M3 12h18M3 17h18" },
 ];



export default function SeedLinModule() {
  const [activeTab, setActiveTab] = useState("aiAnalysis");
  
  const renderContent = () => {
    switch (activeTab) {
      case "aiAnalysis":
        return <AIAnalysis/>

      case "dNAAnalysis":
        return  <DNAAnalysis/>

        case "seedVerification":
            return <SeedVerification/>;
      
      case "geoMapping":
        return <GeoMapping/>
      
      default:
        return null;
    }
  };

  return (
    <div className="h-full">
      {/* Module Header */}
      <div className="bg-white rounded-lg shadow mb-6 p-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-green-600 rounded-full w-10 h-10 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18M12 3v18" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">SeedLin</h1>
            <p className="text-gray-600">Seedlings Multi-Source Verification System</p>
          </div>
        </div>
        <div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
            Active
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <nav className="flex space-x-4 px-6 border-b border-gray-200" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-4 text-sm font-medium border-b-2 flex items-center space-x-2 ${
                activeTab === tab.id
                  ? "border-green-600 text-green-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow p-6 min-h-[400px] overflow-auto">{renderContent()}</div>
    </div>
  );
}