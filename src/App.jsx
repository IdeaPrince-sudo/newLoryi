import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ModulePlaceholder from './components/modules/ModulePlaceholder';
import DiagnoxModule from './components/modules/diagnox/DiagnoxModule';
import GeoSenseModule from './components/modules/geoSense/GeoSenseModule';
import PredictoDashboard from './components/modules/predicto/PredictoDashboard';
import FarmIQ from './components/modules/farmiq/Dashboard';
import AgriTrack from './components/modules/agritrack/Dashboard';
import SafeVest from './components/modules/safevest/SafevestModule';
import CreditsAccount from './components/modules/safevest/account/CreditsAccount';

import TerraQ from './components/modules/terraQ/Home';
import FloatingChat from './components/modules/terraQ/FloatingChat';
import FertiWise from './components/modules/fertiwise';
import SeedLinModule from './components/modules/seedLin/dashboard';
import CreditTrackModule from './components/modules/credittrack/CreditTrackModule';
import AgroMartModule from './components/modules/agromart/AgroMartModule';
import UpdateXModule from './components/modules/updatex/UpdateXModule';
import AgriDomainDashboard from './components/modules/agriDomains/AgriDomainDashboard';
import LivestockDashboard from './components/modules/agriDomains/LivestockDashboard';
import ForestryDashboard from './components/modules/agriDomains/ForestryDashboard';
import FisheriesDashboard from './components/modules/agriDomains/FisheriesDashboard';

import MobileNavigation from './components/mobileNavigation';




// ✅ Layout now takes credits props
const Layout = ({ children, credits, useCredits, updateCredits }) => {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) return <Navigate to="/login" />;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1">
        <Sidebar credits={credits} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
          {location.pathname !== '/terraq' && <FloatingChat />}
          <MobileNavigation/>
        </main>
      </div>
    </div>
  );
};

function App() {
  // ✅ Centralized credits state
  const [credits, setCredits] = useState(50);

  // ✅ Deduct credits
  const useCredits = (amount) => {
    if (credits >= amount) {
      setCredits((prev) => prev - amount);
      return true;
    }
    return false;
  };

  // ✅ Update credits manually (e.g., recharge)
  const updateCredits = (newAmount) => setCredits(newAmount);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <ProtectedRoute>
              <Layout credits={credits} useCredits={useCredits} updateCredits={updateCredits}>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />

          {/* ✅ GeoSense */}
          <Route path="/geosense" element={
            <ProtectedRoute requiredModule="GeoSense">
              <Layout credits={credits} useCredits={useCredits} updateCredits={updateCredits}>
                <GeoSenseModule title="GeoSense" description="Analyze soil fertility..." />
              </Layout>
            </ProtectedRoute>
          } />

          {/* ✅ Diagnox */}
          <Route path="/diagnox" element={
            <ProtectedRoute requiredModule="DiagnoX">
              <Layout credits={credits} useCredits={useCredits} updateCredits={updateCredits}>
                <DiagnoxModule title="DiagnoX" description="AI-powered image analysis..." />
              </Layout>
            </ProtectedRoute>
          } />

          {/* ✅ Predicto */}
          <Route path="/predicto" element={
            <ProtectedRoute requiredModule="Predicto">
              <Layout credits={credits} useCredits={useCredits} updateCredits={updateCredits}>
                <PredictoDashboard title="Predicto" description="Accurate weather forecasts..." />
              </Layout>
            </ProtectedRoute>
          } />

   {/* ✅ FertiWise */}
   <Route path="/fertiwise" element={
            <ProtectedRoute requiredModule="FertiWise">
              <Layout credits={credits} useCredits={useCredits} updateCredits={updateCredits}>
                <FertiWise title="FertiWise" description="Fertilizer verification for regional use, dosage recommendation..." />
              </Layout>
            </ProtectedRoute>
          } />

             {/* ✅ SeedLin */}
   <Route path="/seedlin" element={
            <ProtectedRoute requiredModule="SeedLin">
              <Layout credits={credits} useCredits={useCredits} updateCredits={updateCredits}>
                <SeedLinModule title="SeedLin" description="SeedLin" />
              </Layout>
            </ProtectedRoute>
          } />

          {/* ✅ CreditTrack */}
          <Route path="/credittrack" element={
            <ProtectedRoute requiredModule="CreditTrack">
              <Layout credits={credits} useCredits={useCredits} updateCredits={updateCredits}>
                <CreditTrackModule />
              </Layout>
            </ProtectedRoute>
          } />
          {/* ✅ AgroMart */}
          <Route path="/agromart" element={
            <ProtectedRoute requiredModule="AgroMart">
              <Layout credits={credits} useCredits={useCredits} updateCredits={updateCredits}>
                <AgroMartModule />
              </Layout>
            </ProtectedRoute>
          } />

          {/* ✅ Livestock */}
          <Route path="/livestock" element={
            <ProtectedRoute requiredModule="Livestock">
              <Layout credits={credits} useCredits={useCredits} updateCredits={updateCredits}>
                <LivestockDashboard />
              </Layout>
            </ProtectedRoute>
          } />

          {/* ✅ Forestry */}
          <Route path="/forestry" element={
            <ProtectedRoute requiredModule="Forestry">
              <Layout credits={credits} useCredits={useCredits} updateCredits={updateCredits}>
                <ForestryDashboard />
              </Layout>
            </ProtectedRoute>
          } />

          {/* ✅ Fisheries & Aquaculture */}
          <Route path="/fisheries" element={
            <ProtectedRoute requiredModule="Fisheries & Aquaculture">
              <Layout credits={credits} useCredits={useCredits} updateCredits={updateCredits}>
                <FisheriesDashboard />
              </Layout>
            </ProtectedRoute>
          } />

          {/* ✅ FarmIQ */}
          <Route path="/farmiq" element={
            <ProtectedRoute requiredModule="FarmIQ">
              <Layout credits={credits} useCredits={useCredits} updateCredits={updateCredits}>
                <FarmIQ title="FarmIQ" description="Data-driven decisions for farming..." />
              </Layout>
            </ProtectedRoute>
          } />

          {/* ✅ AgriTrack */}
          <Route path="/agritrack" element={
            <ProtectedRoute requiredModule="AgriTrack">
              <Layout credits={credits} useCredits={useCredits} updateCredits={updateCredits}>
                <AgriTrack title="AgriTrack" description="Track farming activities..." />
              </Layout>
            </ProtectedRoute>
          } />

          {/* ✅ SafeVest (deducts credits) */}
          <Route path="/safevest" element={
            <ProtectedRoute requiredModule="SafeVest">
              <Layout credits={credits} useCredits={useCredits} updateCredits={updateCredits}>
                <SafeVest useCredits={useCredits} userCredits={credits} title="SafeVest" description="Investment & protection." />
              </Layout>
            </ProtectedRoute>
          } />

          {/* ✅ TerraQ */}
          <Route path="/terraq" element={
            <ProtectedRoute requiredModule="TerraQ">
              <Layout credits={credits} useCredits={useCredits} updateCredits={updateCredits}>
                <TerraQ title="TerraQ" description="Your smart farming companion." />
              </Layout>
            </ProtectedRoute>
          } />

          {/* ✅ UpdateX */}
          <Route path="/updatex" element={
            <ProtectedRoute requiredModule="UpdateX">
              <Layout credits={credits} useCredits={useCredits} updateCredits={updateCredits}>
                <UpdateXModule />
              </Layout>
            </ProtectedRoute>
          } />

          {/* ✅ Account (Recharge Credits) */}
          <Route path="/account" element={
            <ProtectedRoute>
              <Layout credits={credits} useCredits={useCredits} updateCredits={updateCredits}>
                <CreditsAccount userCredits={credits} onCreditsChange={updateCredits} title="Account" description="Manage User Account" />
              </Layout>
            </ProtectedRoute>
          } />
        

          {/* ✅ Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
