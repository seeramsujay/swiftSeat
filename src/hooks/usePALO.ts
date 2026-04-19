import { useState, useCallback } from 'react';
import { Vendor } from '../types';

interface PALOOptions {
  alpha?: number;
  accessible?: boolean;
}

interface ScoredVendor extends Vendor {
  walkSeconds: number;
  predictedWait: number;
  loadPenalty: number;
  score: number;
  totalMins: number;
}

export const usePALO = () => {
  const calculateScores = useCallback((
    vendors: Vendor[],
    routeMatrix: Record<string, { durationSeconds: number }>,
    options: PALOOptions = {}
  ): ScoredVendor[] => {
    const { alpha = 30, accessible = false } = options;
    
    let candidates = [...vendors];
    if (accessible) {
      // Logic for accessibility filtering if property exists
    }

    const scored = candidates.map(stand => {
      const walkSec = routeMatrix[stand.id]?.durationSeconds || 180;
      const waitNow = stand.avg_prep_time * stand.queue_length * 60; // Convert to seconds
      const waitTrend = 0; // Simplified for initial version
      
      const walkMins = walkSec / 60;
      const predicted = Math.max(0, waitNow + waitTrend * walkMins);
      const loadPenalty = alpha * 0; // Simplified: active_routes from server needed
      
      const score = walkSec + predicted + loadPenalty;

      return {
        ...stand,
        walkSeconds: walkSec,
        predictedWait: Math.round(predicted),
        loadPenalty: Math.round(loadPenalty),
        score: Math.round(score),
        totalMins: Math.round(score / 60)
      };
    });

    return scored.sort((a, b) => a.score - b.score);
  }, []);

  return { calculateScores };
};
