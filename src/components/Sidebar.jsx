import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getSidebarItems } from "../data/modules";

function Sidebar() {
  const { pathname } = useLocation();
  const { currentUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const creditWarningColor = () => {
    if (!currentUser) return "bg-green-600";
    if (currentUser.credits <= 5) return "bg-red-600";
    if (currentUser.credits <= 20) return "bg-yellow-500";
    return "bg-green-600";
  };

  const sections = getSidebarItems(currentUser);

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-green-600 text-white rounded-md shadow-md"
        aria-label="Open sidebar menu"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/assets/logo.png" alt="" className="h-9 w-9 rounded-md object-contain" />
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
              <div
                className={`flex items-center justify-between text-xs font-semibold ${
                  currentUser.credits <= 5
                    ? "text-red-600"
                    : currentUser.credits <= 20
                    ? "text-yellow-600"
                    : "text-gray-900"
                }`}
              >
                <span>Credits</span>
                <span>{currentUser.credits}</span>
              </div>
              <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className={`${creditWarningColor()} h-1.5 rounded-full transition-width duration-300`}
                  style={{ width: `${Math.min((currentUser.credits / 100) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Menu */}
        <nav className="py-4 px-3 space-y-2">
          {sections.map((section) => (
            <div key={section.key} className="space-y-1">
              {section.title && <div className="px-2 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">{section.title}</div>}

              {section.items.map((item) => {
                const isActive = pathname === item.path;

                return (
                  <Link
                    key={item.key}
                    to={item.path}
                    className={`
                      flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                      ${isActive ? "bg-green-100 text-green-700" : "text-gray-700 hover:text-green-700 hover:bg-green-50"}
                    `}
                    onClickCapture={() => setSidebarOpen(false)}
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
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">Credits</p>
              <p className="text-lg font-bold text-gray-800">{currentUser?.credits ?? 0}</p>
            </div>
            <Link to="/account" className="text-xs text-green-600 hover:text-green-700 font-medium">
              Buy More
            </Link>
          </div>

          <Link
            to="/account"
            className="flex items-center px-3 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-3 text-gray-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
            <span className="truncate">Account Settings</span>
          </Link>
        </div>

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
                  <button className="mt-2 block text-green-800 hover:underline">Contact Support</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}

export default Sidebar;
