import React, { useState } from "react";

import WeatherForecastCard from './WeatherForecastCard';
import SmartRemindersPanel from './SmartRemindersPanel';
import ClimateAlertBanner from './ClimateAlertBanner';
import NDVIMap from './NDVIMap';
import CropYieldPrediction from './CropYieldPrediction';
import SoilCarbonMonitoring from './SoilCarbonMonitoring';
import ForestHealthMonitor from './ForestHealthMonitor';
import WaterScarcity from './WaterScarcity';
import RainFall from "./rainfall";
import FarmerFieldAnalysis from './FarmerFieldAnalysis';
import CarbonCreditRewards from './CarbonCreditRewards';

export default function PredictoDashboard() {
  const [weatherLocation, setWeatherLocation] = useState({ name: 'Greater Accra' });
  const [activeTabWeather, setActiveTabWeather] = useState("WeatherForecastCard");
  const [activeTabWaterNDVI, setActiveTabWaterNDVI] = useState("WaterScarcity");
  const [activeTabCropSoilForest, setActiveTabCropSoilForest] = useState("CropYieldPrediction");

  const renderWeatherTab = () => {
    switch (activeTabWeather) {
      case "WeatherForecastCard":
        return <WeatherForecastCard selectedLocation={weatherLocation} onLocationChange={setWeatherLocation} />;
      case "SmartRemindersPanel":
        return <SmartRemindersPanel location={weatherLocation} />;
      default:
        return null;
    }
  };

  const renderWaterNDVITab = () => {
    switch (activeTabWaterNDVI) {
      case "WaterScarcity":
        return <WaterScarcity selectedLocation={weatherLocation} onLocationChange={setWeatherLocation} />;
        case "RainFall":
          return <RainFall selectedLocation={weatherLocation} />;
      case "NDVIMap":
        return <NDVIMap selectedLocation={weatherLocation} />;
      default:
        return null;
    }
  };

  const renderCropSoilForestTab = () => {
    switch (activeTabCropSoilForest) {
      case "CropYieldPrediction":
        return <CropYieldPrediction selectedLocation={weatherLocation} onLocationChange={setWeatherLocation} />;
      case "SoilCarbonMonitoring":
        return <SoilCarbonMonitoring selectedLocation={weatherLocation} onLocationChange={setWeatherLocation} />;
      case "ForestHealthMonitor":
        return <ForestHealthMonitor selectedLocation={weatherLocation} onLocationChange={setWeatherLocation} />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-500 rounded-full w-10 h-10 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Predicto - Climate & Crop Intelligence
              </h1>
              <p>
                Get accurate weather forecasts, climate alerts, and seasonal
                predictions.
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
              Active
            </span>
          </div>
        </div>
      </div>

      {/* Climate Alert Banner */}
      <ClimateAlertBanner />

      <FarmerFieldAnalysis />

      <CarbonCreditRewards selectedLocation={weatherLocation} />

      {/* Weather & Smart Reminders Tabs */}
      <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
        <div className="flex space-x-4 border-b border-gray-200 mb-4">
          {[
            { key: "WeatherForecastCard", label: "7-Day Weather Forecast" },
            { key: "SmartRemindersPanel", label: "Smart Reminders" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTabWeather(key)}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTabWeather === key
                  ? "border-green-600 text-green-700"
                  : "border-transparent text-gray-600 hover:text-green-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {renderWeatherTab()}
      </div>

      {/* Water Scarcity & NDVI Tabs */}
      <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
        <div className="flex space-x-4 border-b border-gray-200 mb-4">
          {[
            { key: "WaterScarcity", label: "Water Scarcity Monitoring" },
            { key: "RainFall", label: " Rainfall Pattern Map" },
            { key: "NDVIMap", label: "🛰️ Vegetation Health (NDVI) Map" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTabWaterNDVI(key)}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTabWaterNDVI === key
                  ? "border-green-600 text-green-700"
                  : "border-transparent text-gray-600 hover:text-green-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {renderWaterNDVITab()}
      </div>

      {/* Crop Yield / Soil Carbon / Forest Health Tabs */}
      <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
        <div className="flex space-x-4 border-b border-gray-200 mb-4">
          {[
            { key: "CropYieldPrediction", label: "Crop Yield Prediction" },
            { key: "SoilCarbonMonitoring", label: "Soil Carbon Monitoring" },
            { key: "ForestHealthMonitor", label: "Forest Health Monitor" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTabCropSoilForest(key)}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTabCropSoilForest === key
                  ? "border-green-600 text-green-700"
                  : "border-transparent text-gray-600 hover:text-green-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {renderCropSoilForestTab()}
      </div>
    </div>
  );
}
