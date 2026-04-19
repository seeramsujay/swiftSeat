export interface Zone {
  id: string;
  name: string;
  density: number; // 0.0 - 1.0
  status: 'normal' | 'warning' | 'critical';
  thermal_grid: number[][]; // 2D array for heatmap
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  location: { x: number; y: number };
  queue_length: number;
  avg_prep_time: number; // minutes
  is_active: boolean;
  score?: number; // PALO score
}

export interface Order {
  id: string;
  vendor_id: string;
  user_id: string;
  items: string[];
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  timestamp: string;
}

export interface TelemetryNode {
  id: string;
  type: 'thermal' | 'iot' | 'network';
  status: 'online' | 'offline' | 'error';
  health: number; // 0-100
  last_ping: string;
}

export interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  type?: 'text' | 'recommendation';
  data?: any;
}
