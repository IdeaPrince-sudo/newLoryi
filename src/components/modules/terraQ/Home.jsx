
import './terraQ.css';

import FloatingChat from './FloatingChat';

// HomePage component with FloatingChat inside
function TerraQ() {
  return (
    <div className="page-container">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <img 
              src="/images/Logo.jpg" 
              alt="Terra Q" 
              className="w-8 h-8 rounded-full bg-white" 
            />
            <span>Terra Q</span>
          </div>
         
        </div>
      </header>

      <div className="page-content">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-green-800 mb-6">Welcome to Terra Q</h1>
          <p className="text-lg mb-8">
            Your AI-powered farming assistant that provides guidance on crop management, weather forecasts, and agricultural best practices.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-semibold text-green-700 mb-3">Farming Guidance</h2>
              <p className="text-gray-600">
                Get personalized recommendations for your crops based on soil conditions, climate, and seasonal factors.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-semibold text-green-700 mb-3">Weather Insights</h2>
              <p className="text-gray-600">
                Access detailed weather forecasts and receive alerts about conditions that might affect your crops.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-semibold text-green-700 mb-3">Pest & Disease Control</h2>
              <p className="text-gray-600">
                Learn how to identify and manage common agricultural pests and diseases using sustainable methods.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-semibold text-green-700 mb-3">Market Insights</h2>
              <p className="text-gray-600">
                Stay informed about current crop prices and market trends to maximize your farm's profitability.
              </p>
            </div>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
            <p className="text-green-800">
              <strong>Need help?</strong> Click the chat button in the bottom right corner to ask Terra Q any farming-related questions!
            </p>
          </div>
        </div>
      </div>

      {/* Floating Chat is only on this page */}
      <FloatingChat />
    </div>
  );
}


export default TerraQ;
