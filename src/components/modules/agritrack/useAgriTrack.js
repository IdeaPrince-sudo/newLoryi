import { useContext } from 'react';
import { AgriTrackContext } from './AgriTrackContextRef';

export function useAgriTrack() {
  const context = useContext(AgriTrackContext);
  if (!context) throw new Error('useAgriTrack must be used inside AgriTrackProvider');
  return context;
}
