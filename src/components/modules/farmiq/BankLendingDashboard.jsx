import React, { useMemo, useState } from 'react';
import { farmProjectsData, resourcesData, soilAnalysisData } from '../../../data/farm-data/mockFarmData';

const getProjectProgress = (project) => {
  const completedActivities = project.activities.filter((activity) => activity.status === 'completed').length;
  return Math.round((completedActivities / project.activities.length) * 100);
};

const getRiskProfile = (project) => {
  const budgetUsage = project.expenses / project.budget;
  const progress = getProjectProgress(project);

  if (budgetUsage >= 0.85 || progress < 50) {
    return { label: 'High attention', tone: 'red', score: 42 };
  }

  if (budgetUsage >= 0.65 || progress < 70) {
    return { label: 'Monitor', tone: 'amber', score: 68 };
  }

  return { label: 'Healthy', tone: 'green', score: 86 };
};

const toneClasses = {
  red: 'bg-red-100 text-red-800',
  amber: 'bg-amber-100 text-amber-800',
  green: 'bg-emerald-100 text-emerald-800',
};

const BankLendingDashboard = () => {
  const [selectedProject, setSelectedProject] = useState(farmProjectsData[0]);
  const [reviewedProjects, setReviewedProjects] = useState([]);
  const [notice, setNotice] = useState('');

  const portfolio = useMemo(() => farmProjectsData.map((project) => ({
    ...project,
    progress: getProjectProgress(project),
    risk: getRiskProfile(project),
  })), []);

  const portfolioMetrics = useMemo(() => ({
    exposure: portfolio.reduce((total, project) => total + project.budget, 0),
    expenses: portfolio.reduce((total, project) => total + project.expenses, 0),
    projectedRevenue: portfolio.reduce((total, project) => total + project.estimatedRevenue, 0),
    attention: portfolio.filter((project) => project.risk.tone !== 'green').length,
  }), [portfolio]);

  const formatCurrency = (value) => `GHS ${value.toLocaleString()}`;

  const markReviewed = () => {
    setReviewedProjects((current) => current.includes(selectedProject.id)
      ? current.filter((id) => id !== selectedProject.id)
      : [...current, selectedProject.id]);
    setNotice(`${selectedProject.name} marked as reviewed.`);
  };

  const requestUpdate = () => {
    setNotice(`A monitoring update was requested for ${selectedProject.name}.`);
  };

  const exportReport = () => {
    const report = [
      'FarmIQ agricultural credit portfolio report',
      `Generated: ${new Date().toLocaleDateString()}`,
      '',
      `Portfolio exposure: ${formatCurrency(portfolioMetrics.exposure)}`,
      `Current expenses: ${formatCurrency(portfolioMetrics.expenses)}`,
      `Projected revenue: ${formatCurrency(portfolioMetrics.projectedRevenue)}`,
      `Projects needing attention: ${portfolioMetrics.attention}`,
      '',
      ...portfolio.map((project) => `${project.name} | ${project.risk.label} | ${project.progress}% complete | ${formatCurrency(project.budget)} budget`),
    ].join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([report], { type: 'text/plain' }));
    link.download = 'farmiq-credit-portfolio-report.txt';
    link.click();
    URL.revokeObjectURL(link.href);
    setNotice('Credit portfolio report downloaded.');
  };

  const selectedRisk = getRiskProfile(selectedProject);
  const selectedSoil = soilAnalysisData[soilAnalysisData.length - 1];
  const resourceValue = resourcesData.reduce((total, resource) => total + resource.cost, 0);

  return (
    <div className="space-y-6">
      <section className="rounded-lg bg-slate-900 p-6 text-white shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">FarmIQ | Bank workspace</p>
            <h1 className="mt-2 text-2xl font-semibold">Agricultural credit portfolio</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Review production evidence, monitor financed farms, and identify early warning signals before repayment risk increases.</p>
          </div>
          <button type="button" onClick={exportReport} className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400">Export credit report</button>
        </div>
      </section>

      {notice && <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800" role="status">{notice}</div>}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Portfolio exposure', formatCurrency(portfolioMetrics.exposure), 'Approved project budgets'],
          ['Current expenses', formatCurrency(portfolioMetrics.expenses), `${Math.round((portfolioMetrics.expenses / portfolioMetrics.exposure) * 100)}% of exposure`],
          ['Projected revenue', formatCurrency(portfolioMetrics.projectedRevenue), 'Expected farm revenue'],
          ['Needs attention', portfolioMetrics.attention, 'Projects requiring review'],
        ].map(([label, value, detail]) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
            <p className="mt-1 text-xs text-slate-500">{detail}</p>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Borrower monitoring</h2>
              <p className="text-sm text-slate-500">Prioritize projects using budget, progress, and production signals.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{portfolio.length} projects</span>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-3 font-semibold">Project</th>
                  <th className="px-3 py-3 font-semibold">Budget use</th>
                  <th className="px-3 py-3 font-semibold">Progress</th>
                  <th className="px-3 py-3 font-semibold">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {portfolio.map((project) => (
                  <tr key={project.id} className={`cursor-pointer hover:bg-slate-50 ${selectedProject.id === project.id ? 'bg-emerald-50/60' : ''}`} onClick={() => setSelectedProject(project)}>
                    <td className="px-3 py-4"><p className="font-semibold text-slate-900">{project.name}</p><p className="mt-1 text-xs text-slate-500">{project.location} · {project.landSize} {project.sizeUnit}</p></td>
                    <td className="px-3 py-4"><p className="font-medium text-slate-800">{formatCurrency(project.expenses)}</p><p className="mt-1 text-xs text-slate-500">of {formatCurrency(project.budget)}</p></td>
                    <td className="px-3 py-4"><p className="font-medium text-slate-800">{project.progress}%</p><div className="mt-2 h-1.5 w-20 rounded-full bg-slate-200"><div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${project.progress}%` }} /></div></td>
                    <td className="px-3 py-4"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${toneClasses[project.risk.tone]}`}>{project.risk.label}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div><p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Selected borrower</p><h2 className="mt-1 text-lg font-semibold text-slate-900">{selectedProject.name}</h2><p className="text-sm text-slate-500">{selectedProject.location} · {selectedProject.cropType || selectedProject.farmType}</p></div>
            <span className={`rounded-full px-2 py-1 text-xs font-semibold ${toneClasses[selectedRisk.tone]}`}>{selectedRisk.score}/100</span>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-md bg-slate-50 p-3"><p className="text-xs text-slate-500">Expected revenue</p><p className="mt-1 font-semibold text-slate-900">{formatCurrency(selectedProject.estimatedRevenue)}</p></div>
            <div className="rounded-md bg-slate-50 p-3"><p className="text-xs text-slate-500">Estimated yield</p><p className="mt-1 font-semibold text-slate-900">{selectedProject.estimatedYield.toLocaleString()} kg</p></div>
            <div className="rounded-md bg-slate-50 p-3"><p className="text-xs text-slate-500">Latest soil pH</p><p className="mt-1 font-semibold text-slate-900">{selectedSoil.pH} · {selectedSoil.phosphorus} P</p></div>
            <div className="rounded-md bg-slate-50 p-3"><p className="text-xs text-slate-500">Tracked inputs</p><p className="mt-1 font-semibold text-slate-900">{formatCurrency(resourceValue)}</p></div>
          </div>
          <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"><p className="font-semibold">Monitoring signal</p><p className="mt-1">{selectedRisk.tone === 'green' ? 'Production progress is aligned with current budget use.' : 'Review budget usage and request a current production update.'}</p></div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={markReviewed} className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700">{reviewedProjects.includes(selectedProject.id) ? 'Reviewed' : 'Mark as reviewed'}</button>
            <button type="button" onClick={requestUpdate} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Request farm update</button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default BankLendingDashboard;