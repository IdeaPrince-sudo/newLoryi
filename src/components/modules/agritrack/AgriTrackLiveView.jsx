import React, { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAgriTrack } from './useAgriTrack';

const money = (value) => `GH₵${Number(value || 0).toLocaleString('en-GH', { maximumFractionDigits: 0 })}`;
const typeOf = (record) => String(record.recordType || record.type || 'activity').toLowerCase();
const titleOf = (record) => record.title || record.name || record.description || 'Untitled record';
const dateOf = (record) => record.date || record.dueDate || record.createdAt || '';
const validDate = (record) => {
  const date = new Date(dateOf(record));
  return Number.isNaN(date.getTime()) ? null : date;
};
const dateLabel = (record) => validDate(record)?.toLocaleDateString() || 'Date not set';

const AgriTrackLiveView = ({ mode = 'overview' }) => {
  const { records, loading, error, createRecord, updateRecord, deleteRecord } = useAgriTrack();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [draft, setDraft] = useState({ recordType: mode === 'expenses' ? 'expense' : mode === 'income' ? 'income' : mode === 'treatments' ? 'treatment' : mode === 'tasks' ? 'task' : 'activity', title: '', description: '', amount: '', date: new Date().toISOString().slice(0, 10), status: 'pending', priority: 'medium', category: '', crop: '', location: '', yieldKg: '' });
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => records.filter((record) => {
    const type = typeOf(record);
    if (mode === 'expenses') return ['expense', 'cost'].includes(type);
    if (mode === 'income') return ['income', 'revenue', 'sale'].includes(type);
    if (mode === 'tasks') return ['task', 'treatment'].includes(type) && (filter === 'all' || String(record.status || 'pending').toLowerCase() === filter);
    if (mode === 'treatments') return type === 'treatment';
    if (mode === 'activities') return !['expense', 'cost', 'income', 'revenue', 'sale', 'task', 'treatment'].includes(type) || type === 'treatment';
    return records;
  }).sort((first, second) => (validDate(second)?.getTime() || 0) - (validDate(first)?.getTime() || 0)), [records, mode, filter]);

  const summary = useMemo(() => {
    const expenses = records.filter((record) => ['expense', 'cost'].includes(typeOf(record))).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const income = records.filter((record) => ['income', 'revenue', 'sale'].includes(typeOf(record))).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const yieldKg = records.reduce((sum, item) => sum + (Number(item.yieldKg || item.quantityKg) || 0), 0);
    return { income, expenses, profit: income - expenses, yieldKg };
  }, [records]);

  const monthly = useMemo(() => {
    const rows = new Map();
    records.forEach((record) => {
      const date = validDate(record);
      if (!date) return;
      const month = date.toLocaleDateString('en', { month: 'short' });
      const row = rows.get(month) || { month, income: 0, expenses: 0, profit: 0 };
      if (['income', 'revenue', 'sale'].includes(typeOf(record))) row.income += Number(record.amount) || 0;
      if (['expense', 'cost'].includes(typeOf(record))) row.expenses += Number(record.amount) || 0;
      row.profit = row.income - row.expenses;
      rows.set(month, row);
    });
    return [...rows.values()];
  }, [records]);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      await createRecord({
        ...draft,
        type: draft.recordType,
        amount: Number(draft.amount || 0),
        yieldKg: Number(draft.yieldKg || 0),
        performedBy: 'Current user',
      });
      setDraft((current) => ({ ...current, title: '', description: '', amount: '', crop: '', location: '', yieldKg: '' }));
      setShowForm(false);
    } catch (requestError) {
      setFormError(requestError.message || 'Could not save this record.');
    } finally {
      setSaving(false);
    }
  };

  const completeTask = async (record) => {
    try { await updateRecord(record.id, { status: 'completed' }); }
    catch (requestError) { setFormError(requestError.message || 'Could not update task.'); }
  };

  const removeRecord = async (record) => {
    if (!window.confirm(`Delete "${titleOf(record)}"?`)) return;
    try { await deleteRecord(record.id); }
    catch (requestError) { setFormError(requestError.message || 'Could not delete record.'); }
  };

  const addButton = <button type="button" onClick={() => setShowForm((open) => !open)} className="rounded-md bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800">{showForm ? 'Cancel' : mode === 'tasks' ? 'Add New Task' : mode === 'expenses' ? 'Add Expense' : mode === 'income' ? 'Add Income' : mode === 'treatments' ? 'Add Treatment' : 'Add Activity'}</button>;
  const title = ({ overview: 'AgriTrack Overview', expenses: 'Expense Ledger', income: 'Income Ledger', tasks: 'Tasks', treatments: 'Treatments', activities: 'Activities', reports: 'Reports' })[mode];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-semibold text-gray-900">{title}</h2><p className="mt-1 text-sm text-gray-600">Live records saved to your AgriTrack account.</p></div>{mode !== 'reports' && addButton}</div>
      {loading && <p className="text-sm text-gray-500">Loading your AgriTrack records…</p>}
      {error && <p role="alert" className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{error}</p>}
      {formError && <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{formError}</p>}

      {showForm && (
        <form onSubmit={submit} className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-white p-5 md:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">Record type<select value={draft.recordType} onChange={(event) => setDraft({ ...draft, recordType: event.target.value })} className="mt-1 w-full rounded-md border border-gray-300 p-2"><option value="expense">Expense</option><option value="income">Income</option><option value="task">Task</option><option value="treatment">Treatment</option><option value="activity">Activity</option></select></label>
          <label className="text-sm font-medium text-gray-700">{['task', 'treatment'].includes(draft.recordType) ? 'Due date' : 'Date'}<input required type="date" value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} className="mt-1 w-full rounded-md border border-gray-300 p-2" /></label>
          <label className="text-sm font-medium text-gray-700 md:col-span-2">Title<input required maxLength={160} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} className="mt-1 w-full rounded-md border border-gray-300 p-2" placeholder="Describe the expense, sale, task, treatment, or activity" /></label>
          <label className="text-sm font-medium text-gray-700">Category / crop<input value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value, crop: event.target.value })} className="mt-1 w-full rounded-md border border-gray-300 p-2" /></label>
          <label className="text-sm font-medium text-gray-700">Location / field<input value={draft.location} onChange={(event) => setDraft({ ...draft, location: event.target.value })} className="mt-1 w-full rounded-md border border-gray-300 p-2" /></label>
          {['expense', 'income'].includes(draft.recordType) && <label className="text-sm font-medium text-gray-700">Amount (GHS)<input required min="0" step="0.01" type="number" value={draft.amount} onChange={(event) => setDraft({ ...draft, amount: event.target.value })} className="mt-1 w-full rounded-md border border-gray-300 p-2" /></label>}
          {draft.recordType === 'income' && <label className="text-sm font-medium text-gray-700">Yield (kg, optional)<input min="0" step="0.01" type="number" value={draft.yieldKg} onChange={(event) => setDraft({ ...draft, yieldKg: event.target.value })} className="mt-1 w-full rounded-md border border-gray-300 p-2" /></label>}
          {['task', 'treatment'].includes(draft.recordType) && <><label className="text-sm font-medium text-gray-700">Assignee<input value={draft.assignee} onChange={(event) => setDraft({ ...draft, assignee: event.target.value })} className="mt-1 w-full rounded-md border border-gray-300 p-2" /></label><label className="text-sm font-medium text-gray-700">Priority<select value={draft.priority} onChange={(event) => setDraft({ ...draft, priority: event.target.value })} className="mt-1 w-full rounded-md border border-gray-300 p-2"><option>low</option><option>medium</option><option>high</option></select></label></>}
          <label className="text-sm font-medium text-gray-700 md:col-span-2">Details<textarea rows="2" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} className="mt-1 w-full rounded-md border border-gray-300 p-2" /></label>
          <button disabled={saving} className="rounded-md bg-green-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 md:col-span-2">{saving ? 'Saving…' : 'Save record'}</button>
        </form>
      )}

      {mode === 'overview' && <>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{[['Total Revenue', money(summary.income)], ['Total Expenses', money(summary.expenses)], ['Net Profit', money(summary.profit)], ['Crop Yield', `${summary.yieldKg.toLocaleString()} kg`]].map(([label, value]) => <div key={label} className="rounded-lg border border-gray-200 bg-white p-5"><p className="text-sm text-gray-500">{label}</p><p className="mt-2 text-2xl font-bold text-gray-900">{loading ? '—' : value}</p></div>)}</div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2"><section className="rounded-lg border border-gray-200 bg-white p-5"><h3 className="mb-4 font-semibold">Revenue vs Expenses</h3>{monthly.length ? <div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={monthly}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="month"/><YAxis/><Tooltip formatter={(value) => money(value)}/><Legend/><Bar dataKey="income" name="Revenue" fill="#16a34a"/><Bar dataKey="expenses" name="Expenses" fill="#dc2626"/></BarChart></ResponsiveContainer></div> : <p className="py-10 text-center text-sm text-gray-500">Add income and expense records to populate this chart.</p>}</section><section className="rounded-lg border border-gray-200 bg-white p-5"><h3 className="mb-4 font-semibold">Crop Performance</h3>{records.some((record) => Number(record.yieldKg || record.quantityKg) > 0) ? <div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={records.filter((record) => Number(record.yieldKg || record.quantityKg) > 0).map((record) => ({ crop: record.crop || record.category || titleOf(record), yieldKg: Number(record.yieldKg || record.quantityKg), revenue: Number(record.amount) || 0 }))}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="crop"/><YAxis/><Tooltip/><Legend/><Bar dataKey="revenue" name="Revenue (GHS)" fill="#2563eb"/><Bar dataKey="yieldKg" name="Yield (kg)" fill="#eab308"/></BarChart></ResponsiveContainer></div> : <p className="py-10 text-center text-sm text-gray-500">Add yield to income records to see crop performance.</p>}</section></div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2"><section className="rounded-lg border border-gray-200 bg-white p-5"><h3 className="mb-4 font-semibold">Upcoming Tasks</h3><RecordTable records={records.filter((record) => ['task', 'treatment'].includes(typeOf(record)) && record.status !== 'completed').slice(0, 5)} mode="tasks" onComplete={completeTask} onDelete={removeRecord}/></section><section className="rounded-lg border border-gray-200 bg-white p-5"><h3 className="mb-4 font-semibold">Recent Activities</h3><RecordTable records={records.filter((record) => !['expense', 'cost', 'income', 'revenue', 'sale', 'task', 'treatment'].includes(typeOf(record))).slice(0, 5)} mode="activities" onDelete={removeRecord}/></section></div>
      </>}

      {mode === 'reports' && <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">{[['Income records', money(summary.income)], ['Expense records', money(summary.expenses)], ['Net result', money(summary.profit)]].map(([label, value]) => <div key={label} className="rounded-lg border border-gray-200 bg-white p-5"><p className="text-sm text-gray-500">{label}</p><p className="mt-2 text-xl font-bold">{loading ? '—' : value}</p></div>)}</div>}

      {['expenses', 'income', 'tasks', 'treatments', 'activities'].includes(mode) && (
        <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 p-4"><h3 className="font-semibold">{title} records</h3>{mode === 'tasks' && <select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-md border border-gray-300 p-2 text-sm"><option value="all">All statuses</option><option value="pending">Pending</option><option value="in-progress">In progress</option><option value="completed">Completed</option></select>}</div>
          <RecordTable records={mode === 'tasks' ? filtered : filtered} mode={mode} onComplete={completeTask} onDelete={removeRecord}/>
        </section>
      )}
    </div>
  );
};

function RecordTable({ records, mode, onComplete, onDelete }) {
  if (!records.length) return <p className="p-8 text-center text-sm text-gray-500">No {mode} records have been saved to your account yet.</p>;
  return <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200 text-sm"><thead className="bg-gray-50"><tr>{['Record', 'Details', 'Date', 'Amount / Status', 'Actions'].map((heading) => <th key={heading} className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">{heading}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">{records.map((record) => <tr key={record.id}><td className="px-4 py-3 font-medium text-gray-900">{titleOf(record)}</td><td className="px-4 py-3 text-gray-600">{record.description || record.category || record.location || record.crop || '—'}</td><td className="px-4 py-3 text-gray-600">{dateOf(record) ? new Date(dateOf(record)).toLocaleDateString() : 'Not set'}</td><td className="px-4 py-3 text-gray-600">{['expense', 'cost', 'income', 'revenue', 'sale'].includes(typeOf(record)) ? money(record.amount) : String(record.status || 'recorded')}</td><td className="whitespace-nowrap px-4 py-3"><div className="flex gap-2">{['task', 'treatment'].includes(typeOf(record)) && record.status !== 'completed' && <button type="button" onClick={() => onComplete(record)} className="text-green-700 hover:underline">Complete</button>}<button type="button" onClick={() => onDelete(record)} className="text-red-700 hover:underline">Delete</button></div></td></tr>)}</tbody></table></div>;
}

export default AgriTrackLiveView;
