import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../lib/api';
import FarmDashboard from './FarmDashboardLive';
import BankLendingDashboard from './BankLendingDashboard';
import NewProject from './NewProject';
import ProjectList from './ProjectList';
import FarmHistory from './FarmHistoryLive';
import ROICalculator from './ROICalculator';


const FarmIQ = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [reportAction, setReportAction] = useState('');
  const [reportError, setReportError] = useState('');
  const [exporting, setExporting] = useState(false);

  const loadFarmIQRecords = () => Promise.all([
    api.farmProjects(),
    api.farmActivities(),
    api.geoSenseFarms(),
  ]).then(([projects, activities, farms]) => ({ projects, activities, farms, exportedAt: new Date().toISOString() }));

  const handleExportData = async () => {
    setExporting(true);
    setReportError('');
    setReportAction('');
    try {
      const records = await loadFarmIQRecords();
      const file = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = `farmiq-data-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setReportAction('Farm data exported.');
    } catch (error) {
      setReportError(error.message || 'Farm data could not be exported.');
    } finally {
      setExporting(false);
    }
  };

  const handleGenerateReport = async () => {
    setExporting(true);
    setReportError('');
    setReportAction('');
    try {
      const records = await loadFarmIQRecords();
      const document = new jsPDF();
      const pageWidth = document.internal.pageSize.getWidth();
      const pageHeight = document.internal.pageSize.getHeight();
      const margin = 18;
      let cursorY = 20;
      const addLine = (text, fontSize = 10, bold = false) => {
        document.setFont('helvetica', bold ? 'bold' : 'normal');
        document.setFontSize(fontSize);
        const lines = document.splitTextToSize(String(text), pageWidth - margin * 2);
        lines.forEach((line) => {
          if (cursorY > pageHeight - margin) {
            document.addPage();
            cursorY = margin;
          }
          document.text(line, margin, cursorY);
          cursorY += fontSize * 0.55;
        });
        cursorY += 2;
      };
      document.setFillColor(22, 101, 52);
      document.rect(0, 0, pageWidth, 3, 'F');
      addLine('FarmIQ Operations Report', 18, true);
      addLine(`Account: ${currentUser?.name || currentUser?.email || 'Farm account'}`);
      addLine(`Generated: ${new Date(records.exportedAt).toLocaleString()}`);
      addLine(`Projects: ${records.projects.length} | Activities: ${records.activities.length} | Registered farms: ${records.farms.length}`);
      cursorY += 5;
      addLine('Projects', 13, true);
      if (!records.projects.length) addLine('No FarmIQ projects are recorded.');
      records.projects.forEach((project) => {
        addLine(`${project.name} (${project.status || 'planned'})`, 11, true);
        addLine(`Location: ${project.location || 'Not recorded'} | Area: ${project.landSize ?? '—'} ${project.sizeUnit || ''}`);
        addLine(`Harvest: ${project.expectedHarvestDate || 'Not set'} | Expected yield: ${Number(project.estimatedYield || 0).toLocaleString()} kg`);
        addLine(`Expenses: GH₵${Number(project.expenses || 0).toLocaleString()} | Estimated revenue: GH₵${Number(project.estimatedRevenue || 0).toLocaleString()}`);
      });
      cursorY += 5;
      addLine('Upcoming and Recorded Activities', 13, true);
      if (!records.activities.length) addLine('No FarmIQ activities are recorded.');
      records.activities.forEach((activity) => addLine(`${activity.name || activity.title || activity.type || 'Activity'} | ${activity.date || activity.dueDate || activity.startDate || 'Date not set'} | ${activity.status || 'Status not set'}`));
      document.save(`farmiq-report-${new Date().toISOString().slice(0, 10)}.pdf`);
      setReportAction('FarmIQ report generated.');
    } catch (error) {
      setReportError(error.message || 'FarmIQ report could not be generated.');
    } finally {
      setExporting(false);
    }
  };

  if (currentUser?.role === 'bank') {
    return <BankLendingDashboard />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <FarmDashboard />;
      case 'new-project':
        return <NewProject />;
      case 'crop-management':
        return <ProjectList />;
      case 'history':
        return <FarmHistory />;
      case 'roi-calculator':
        return <ROICalculator />;
      default:
        return <FarmDashboard />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">FarmIQ</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your farm operations and monitor performance
          </p>
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <button onClick={handleExportData} disabled={exporting} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60">
            Export Data
          </button>
          <button onClick={handleGenerateReport} disabled={exporting} className="px-4 py-2 bg-green-600 rounded-md text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60">
            Generate Report
          </button>
        </div>
      </div>

      {(reportAction || reportError) && <p role={reportError ? 'alert' : 'status'} className={`text-sm ${reportError ? 'text-red-700' : 'text-green-700'}`}>{reportError || reportAction}</p>}

      <div className="bg-white overflow-hidden shadow-sm rounded-lg">
        <div className="overflow-x-auto">
          <nav className="flex">
            <button
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'dashboard' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('dashboard')}
            >
              Overview
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'new-project' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('new-project')}
            >
              New Project
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'crop-management' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('crop-management')}
            >
              My Projects
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'roi-calculator' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('roi-calculator')}
            >
              ROI Calculator
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'history' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('history')}
            >
              History
            </button>
           
          </nav>
        </div>
      </div>

      <div className="p-1">
        {renderContent()}
      </div>
    </div>
  );
};

export default FarmIQ;