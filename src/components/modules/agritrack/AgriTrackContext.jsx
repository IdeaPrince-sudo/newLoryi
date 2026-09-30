import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../../../lib/api';
import { AgriTrackContext } from './AgriTrackContextRef';

export function AgriTrackProvider({ children }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await api.agritrackActivities();
      setRecords(Array.isArray(data) ? data : []);
      setError('');
    } catch (requestError) {
      setError(requestError.message || 'AgriTrack records could not be loaded.');
      throw requestError;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    api.agritrackActivities()
      .then((data) => { if (active) { setRecords(Array.isArray(data) ? data : []); setError(''); } })
      .catch((requestError) => { if (active) setError(requestError.message || 'AgriTrack records could not be loaded.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const createRecord = async (record) => {
    const created = await api.createAgriTrackRecord(record);
    setRecords((current) => [created, ...current]);
    return created;
  };

  const updateRecord = async (id, updates) => {
    const updated = await api.updateAgriTrackRecord(id, updates);
    setRecords((current) => current.map((record) => String(record.id) === String(id) ? updated : record));
    return updated;
  };

  const deleteRecord = async (id) => {
    await api.deleteAgriTrackRecord(id);
    setRecords((current) => current.filter((record) => String(record.id) !== String(id)));
  };

  const value = useMemo(() => ({ records, loading, error, refresh, createRecord, updateRecord, deleteRecord }), [records, loading, error]);
  return <AgriTrackContext.Provider value={value}>{children}</AgriTrackContext.Provider>;
}
