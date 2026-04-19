import React, { useState } from 'react';
import { useSwiftSeat } from '../hooks/useSwiftSeat';
import { 
  Activity, 
  Radio, 
  Cpu, 
  ShieldAlert, 
  LayoutDashboard, 
  Compass, 
  HeartPulse,
  LogOut,
  ChevronRight,
  Monitor
} from 'lucide-react';
import { clsx } from 'clsx';
import StadiumMap from './StadiumMap';

type AdminTab = 'heatmap' | 'emergency' | 'telemetry' | 'health';

const OperationsCenter: React.FC = () => {
  const { nodes, zones, vendors, loading, error } = useSwiftSeat();
  const [activeTab, setActiveTab] = useState<AdminTab>('heatmap');

  if (loading) return <div className="loading-state">Syncing Vigilant Lens...</div>;
  if (error) return <div className="error-state">{error}</div>;

  const totalOccupancy = Math.round(zones.reduce((acc, z) => acc + (z.density * 5000), 0));
  const avgDensity = zones.reduce((acc, z) => acc + z.density, 0) / (zones.length || 1);

  return (
    <div className="vigilant-lens">
      {/* Sidebar Navigation */}
      <aside className="vigilant-sidebar">
        <div className="sidebar-brand">
          <Monitor size={20} className="text-primary" />
          <span className="brand-text">SwiftCenter</span>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={clsx('nav-item', activeTab === 'heatmap' && 'active')}
            onClick={() => setActiveTab('heatmap')}
          >
            <Compass size={18} />
            <span>Heatmap</span>
          </button>
          <button 
            className={clsx('nav-item', activeTab === 'emergency' && 'active')}
            onClick={() => setActiveTab('emergency')}
          >
            <ShieldAlert size={18} />
            <span>Emergency</span>
          </button>
          <button 
            className={clsx('nav-item', activeTab === 'telemetry' && 'active')}
            onClick={() => setActiveTab('telemetry')}
          >
            <Activity size={18} />
            <span>Telemetry</span>
          </button>
          <button 
            className={clsx('nav-item', activeTab === 'health' && 'active')}
            onClick={() => setActiveTab('health')}
          >
            <HeartPulse size={18} />
            <span>System Health</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout">
            <LogOut size={18} />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Main Command Area */}
      <main className="command-main">
        {/* Top Header & Metrics */}
        <header className="command-header">
          <div className="metric-row">
            <div className="metric-display">
              <span className="metric-label">Total Attendance</span>
              <h2 className="metric-value">{totalOccupancy.toLocaleString()}</h2>
              <span className="metric-trend positive">+12.4% vs last event</span>
            </div>
            
            <div className="metric-display">
              <span className="metric-label">Flow Rate</span>
              <h2 className="metric-value">{Math.round(avgDensity * 124)}/min</h2>
              <span className="metric-sub">Peak detected: West Ramp</span>
            </div>

            <div className="metric-display">
              <span className="metric-label">System Load</span>
              <h2 className="metric-value">{Math.round(avgDensity * 100)}%</h2>
              <div className="load-bar">
                <div className="load-progress" style={{ width: `${avgDensity * 100}%` }} />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content Grid */}
        <div className="command-content-grid">
          {activeTab === 'heatmap' && (
            <div className="viewport-container">
              <div className="viewport-header">
                <div className="viewport-title">
                  <h3>Global Density Heatmap</h3>
                  <span className="live-pill">Live Telemetry</span>
                </div>
                <div className="viewport-actions">
                  <button className="v-btn">2D</button>
                  <button className="v-btn active">Hybrid</button>
                </div>
              </div>
              
              <div className="map-view-wrapper">
                <StadiumMap zones={zones} vendors={vendors} />
                
                {/* Overlay Alert Panel */}
                <div className="floating-alerts">
                  <div className="alert-header">Active Alerts (3)</div>
                  <div className="alert-item high">
                    <div className="alert-icon"><ShieldAlert size={14}/></div>
                    <div className="alert-content">
                      <div className="alert-title">Sector 12 Congestion</div>
                      <div className="alert-desc">98% Occupancy. Recommend Gate D reroute.</div>
                    </div>
                  </div>
                  <div className="alert-item warning">
                    <div className="alert-icon"><Radio size={14}/></div>
                    <div className="alert-content">
                      <div className="alert-title">Restricted Entry</div>
                      <div className="alert-desc">Admin Tunnel 4 motion detected.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'telemetry' && (
            <div className="telemetry-grid">
               {nodes.map(node => (
                 <div key={node.id} className="telemetry-card">
                   <div className="card-header">
                     <span className="node-id">{node.id}</span>
                     <span className={clsx('status-indicator', node.status)}>{node.status}</span>
                   </div>
                   <div className="card-body">
                      <div className="stat">
                        <span className="s-label">Health</span>
                        <div className="s-bar"><div className="s-fill" style={{width: `${node.health}%`}}/></div>
                      </div>
                      <div className="stat">
                        <span className="s-label">Latency</span>
                        <span className="s-value">24ms</span>
                      </div>
                   </div>
                 </div>
               ))}
            </div>
          )}

          {activeTab !== 'heatmap' && activeTab !== 'telemetry' && (
            <div className="placeholder-view">
              <Activity size={48} className="text-dim opacity-20" />
              <p>Module integration pending final security audit.</p>
            </div>
          )}
        </div>
      </main>

      <style>{`
        .vigilant-lens {
          display: grid;
          grid-template-columns: 260px 1fr;
          height: 100vh;
          background: var(--surface-base);
          color: var(--text-main);
          overflow: hidden;
          font-family: var(--font-technical);
        }

        /* Sidebar */
        .vigilant-sidebar {
          background: var(--surface-low);
          display: flex;
          flex-direction: column;
          padding: 24px 0;
          border-right: none;
        }

        .sidebar-brand {
          padding: 0 24px 32px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-text {
          font-family: var(--font-editorial);
          font-weight: 700;
          letter-spacing: -0.02em;
          font-size: 1.25rem;
        }

        .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 0 12px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: var(--radius-md);
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
          width: 100%;
          text-align: left;
        }

        .nav-item:hover {
          background: var(--surface-high);
          color: var(--text-main);
        }

        .nav-item.active {
          background: var(--surface-high);
          color: var(--accent-primary);
        }

        .sidebar-footer {
          padding: 24px 12px 0;
        }

        .nav-item.logout {
          color: var(--accent-danger);
          opacity: 0.7;
        }

        /* Main Area */
        .command-main {
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          background: var(--surface-base);
        }

        .command-header {
          padding: 32px 40px;
          background: linear-gradient(to bottom, var(--surface-low), transparent);
        }

        .metric-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
        }

        .metric-display {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .metric-label {
          font-size: 0.6875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-dim);
          font-weight: 700;
        }

        .metric-value {
          font-family: var(--font-technical);
          font-size: 2.5rem;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .metric-trend {
          font-size: 0.75rem;
          font-weight: 600;
        }

        .metric-trend.positive { color: var(--accent-success); }

        .load-bar {
          height: 4px;
          background: var(--surface-high);
          border-radius: 2px;
          margin-top: 8px;
          overflow: hidden;
        }

        .load-progress {
          height: 100%;
          background: var(--accent-primary);
          transition: width 0.3s ease;
        }

        /* Content Area */
        .command-content-grid {
          padding: 0 40px 40px;
          flex: 1;
        }

        .viewport-container {
          background: var(--surface-low);
          border-radius: var(--radius-lg);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: 100%;
          min-height: 600px;
        }

        .viewport-header {
          padding: 20px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--surface-high);
        }

        .viewport-title h3 {
          font-family: var(--font-editorial);
          font-size: 1rem;
        }

        .live-pill {
          font-size: 0.625rem;
          color: var(--accent-success);
          font-weight: 800;
          text-transform: uppercase;
          background: rgba(16, 185, 129, 0.1);
          padding: 2px 8px;
          border-radius: var(--radius-full);
          margin-left: 8px;
        }

        .viewport-actions {
          display: flex;
          gap: 4px;
          background: var(--surface-base);
          padding: 4px;
          border-radius: var(--radius-sm);
        }

        .v-btn {
          padding: 4px 12px;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: 4px;
          border: none;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
        }

        .v-btn.active {
          background: var(--surface-high);
          color: var(--text-main);
        }

        .map-view-wrapper {
          flex: 1;
          position: relative;
          padding: 24px;
        }

        /* Floating Alert Panel */
        .floating-alerts {
          position: absolute;
          bottom: 24px;
          right: 24px;
          width: 300px;
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.4);
        }

        .alert-header {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .alert-item {
          display: flex;
          gap: 12px;
          padding: 10px;
          border-radius: var(--radius-sm);
        }

        .alert-item.high { background: rgba(239, 68, 68, 0.1); }
        .alert-item.warning { background: rgba(245, 158, 11, 0.1); }

        .alert-icon { color: inherit; }
        .alert-title { font-size: 0.8125rem; font-weight: 700; }
        .alert-desc { font-size: 0.75rem; color: var(--text-muted); }

        /* Telemetry Cards */
        .telemetry-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        .telemetry-card {
          background: var(--surface-low);
          padding: 20px;
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .node-id { font-weight: 700; font-family: var(--font-technical); }
        .status-indicator {
          font-size: 0.625rem;
          font-weight: 800;
          text-transform: uppercase;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .status-indicator.online { background: rgba(16, 185, 129, 0.1); color: var(--accent-success); }

        .stat { display: flex; flex-direction: column; gap: 4px; }
        .s-label { font-size: 0.6875rem; color: var(--text-dim); text-transform: uppercase; }
        .s-bar { height: 4px; background: var(--surface-high); border-radius: 2px; }
        .s-fill { height: 100%; background: var(--accent-primary); }
        .s-value { font-size: 0.875rem; font-weight: 600; }

        .placeholder-view {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--text-dim);
          text-align: center;
          padding: 40px;
        }

        .loading-state, .error-state {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          font-size: 1.125rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};

export default OperationsCenter;
