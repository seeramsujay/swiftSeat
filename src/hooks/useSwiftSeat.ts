import { useState, useEffect, useCallback } from 'react';
import { Zone, Vendor, TelemetryNode } from '../types';

export const useSwiftSeat = () => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [nodes, setNodes] = useState<TelemetryNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    try {
      setLoading(true);
      
      const [zonesRes, nodesRes, concessionsRes] = await Promise.all([
        fetch(`${API_BASE}/api/zones`),
        fetch(`${API_BASE}/api/admin/nodes`),
        fetch(`${API_BASE}/api/concessions`)
      ]);

      if (!zonesRes.ok || !nodesRes.ok || !concessionsRes.ok) {
        throw new Error('Command Center link unstable.');
      }

      const zonesData = await zonesRes.json();
      const nodesData = await nodesRes.json();
      const concessionsData = await concessionsRes.json();

      setZones(zonesData.zones.map((z: any) => ({
        id: z.id,
        name: z.name,
        density: z.currentDensity / 5, // Normalize 0-5 to 0-1
        status: z.status.toLowerCase(),
        thermal_grid: z.thermalGrid || []
      })));

      setNodes(nodesData.nodes.map((n: any) => ({
        id: n.id,
        type: n.sensorType === 'thermal' ? 'thermal' : 'iot',
        status: n.status,
        health: n.status === 'online' ? 100 : 0,
        last_ping: new Date(n.lastSeen * 1000).toISOString()
      })));

      setVendors(concessionsData.concessions.map((c: any) => ({
        id: c.id,
        name: c.name,
        category: c.menuCategories[0],
        location: { x: (c.location.lng - 77.59) * 10000, y: (c.location.lat - 12.97) * 10000 },
        queue_length: c.queueLength,
        avg_prep_time: Math.round(c.estimatedWaitTime / 60),
        is_active: c.isOpen
      })));

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
    const interval = setInterval(fetchData, 8000); // Poll every 8s
    return () => clearInterval(interval);
  }, [fetchData]);

  return { zones, vendors, nodes, loading, error, refresh: fetchData };
};

