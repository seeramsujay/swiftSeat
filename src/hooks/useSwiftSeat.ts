import { useState, useEffect, useCallback } from 'react';
import { Zone, Vendor, TelemetryNode } from '../types';

export const useSwiftSeat = () => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [nodes, setNodes] = useState<TelemetryNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // MOCK DATA for local dev since there is no backend configured yet
      const mockZones: any[] = [
        { id: 'zone_north_1', name: 'North Grandstand', density: 0.86, status: 'critical', thermal_grid: [] },
        { id: 'zone_south_1', name: 'South Grandstand', density: 0.45, status: 'normal', thermal_grid: [] },
        { id: 'zone_east_1', name: 'East Section', density: 0.92, status: 'critical', thermal_grid: [] },
        { id: 'zone_west_1', name: 'West Section', density: 0.30, status: 'normal', thermal_grid: [] },
        { id: 'zone_nw_corner', name: 'NW Corner', density: 0.50, status: 'warning', thermal_grid: [] },
      ];
      
      const mockVendors: any[] = [
        { id: 'v1', name: 'Burger Joint', category: 'Food', location: { x: 300, y: 120 }, queue_length: 45, avg_prep_time: 5, is_active: true },
        { id: 'v2', name: 'Snack Shack', category: 'Food', location: { x: 500, y: 440 }, queue_length: 5, avg_prep_time: 2, is_active: true },
      ];

      const mockNodes: any[] = [
        { id: 'n1', type: 'thermal', status: 'online', health: 100, last_ping: new Date().toISOString() },
        { id: 'n2', type: 'iot', status: 'online', health: 90, last_ping: new Date().toISOString() },
        { id: 'n3', type: 'network', status: 'offline', health: 0, last_ping: new Date(Date.now() - 800000).toISOString() },
      ];

      setZones(mockZones);
      setVendors(mockVendors);
      setNodes(mockNodes);
      setError(null);
    } catch (err) {
      setError('Failed to sync with Command Center backend.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [fetchData]);

  return { zones, vendors, nodes, loading, error, refresh: fetchData };
};

