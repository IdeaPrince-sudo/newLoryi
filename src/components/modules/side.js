import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Sidebar = () => {
  const { pathname } = useLocation();
  const { currentUser, canAccessModule } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    {
      name: 'Dashboard',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      path: '/',
      module: null // No special access required
    },
    {
      name: 'GeoSense',
      icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
      path: '/geosense',
      module: 'GeoSense'
    },
    {
      name: 'DiagnoX',
      icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      path: '/diagnox',
      module: 'DiagnoX'
    },
    {
      name: 'Predicto',
      icon: 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z',
      path: '/predicto',
      module: 'Predicto'
    },
    {
      name: 'AgroMart',
      icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
      path: '/agromart',
      module: 'AgroMart'
    },
    {
      name: 'FertiWise',
      icon: 'M12 8c-1.1 0-2 .9-2 2v4h4v-4c0-1.1-.9-2-2-2z M5 20h14v-2H5v2zm7-14c1.66 0 3 1.34 3 3v4h1c.55 0 1 .45 1 1v6H6v-6c0-.55.45-1 1-1h1v-4c0-1.66 1.34-3 3-3z',
      path: '/fertiwise',
      module: 'FertiWise'
    },
    {
      name: 'SeedLin',
      icon: 'M12 4V2m0 2a8 8 0 110 16 8 8 0 010-16zm0 8h4m-4 0H8',
      path: '/seedlin',
      module: 'SeedLin'
    },
    {
      name: 'FarmIQ',
      icon: 'M3 7h18M3 12h18M3 17h18',
      path: '/farmiq',
      module: 'FarmIQ'
    },
    {
      name: 'Terra Q',
      icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4S8 5.79 8 8s1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
      path: '/terraq',
      module: 'Terra Q'
    },
    {
      name: 'SafeVest',
      icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
      path: '/safevest',
      module: 'SafeVest'
    },
    {
      name: 'UpdateX',
      icon: 'M7 8h10M7 12h5m-5 4h8',
      path: '/updatex',
      module: 'UpdateX'
    },
    {
      name: 'AgriTrack',
      icon: 'M4 6h16M4 10h16M4 14h16M4 18h16',
      path: '/agritrack',
      module: 'AgriTrack'
    }
    

  ];

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-green-600 text-white rounded-md shadow-md"
        aria-label="Open sidebar menu"
      >
        {/* Hamburger icon */}
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-40
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:block
        `}
      >
        {/* Close button for mobile */}
        <div className="flex justify-end md:hidden p-4">
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-600 hover:text-gray-900"
            aria-label="Close sidebar menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Link to="/" className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <span className="text-lg font-medium text-gray-900">Loryi AI</span>
          </Link>
        </div>

        {/* User info */}
        {currentUser && (
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-lg">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                <p className="text-xs text-gray-500 capitalize">{currentUser.role}</p>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Credits</span>
                <span className="font-medium text-gray-900">{currentUser.credits}</span>
              </div>
              <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-green-600 h-1.5 rounded-full"
                  style={{ width: `${Math.min((currentUser.credits / 100) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Menu */}
        <nav className="py-4 px-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            const isAccessible = item.module === null || canAccessModule(item.module);

            return (
              <Link
                key={item.name}
                to={isAccessible ? item.path : "#"}
                onClick={(e) => !isAccessible && e.preventDefault()}
                className={`
                  flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${isActive ? "bg-green-100 text-green-700" : "text-gray-700 hover:text-green-700 hover:bg-green-50"}
                  ${!isAccessible ? "opacity-60 cursor-not-allowed" : ""}
                `}
                onClickCapture={() => setSidebarOpen(false)} // Close sidebar on mobile after clicking
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                {item.name}
                {!isAccessible && item.module && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 ml-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Help and Support */}
        <div className="px-6 py-4 border-t border-gray-200 mt-auto">
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-600"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Need help?</h3>
                <div className="mt-2 text-xs text-green-700">
                  <p>Contact our support team for assistance with your farming needs.</p>
                  <button className="mt-2 block text-green-800 hover:underline">
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay backdrop for mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Sidebar;
