import React, { useState, useEffect, useCallback } from 'react';
import { useSwiftSeat } from '../hooks/useSwiftSeat';
import { 
  BarChart3, 
  Layers, 
  Package, 
  Users, 
  LayoutDashboard, 
  Clock, 
  Zap, 
  HelpCircle, 
  History,
  Store,
  CheckCircle2,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { clsx } from 'clsx';
import { Order } from '../types';

type VendorTab = 'dashboard' | 'queue' | 'inventory' | 'analytics';

const VendorHub: React.FC = () => {
  const { vendors, loading: swiftLoading } = useSwiftSeat();
  const [selectedVendorId, setSelectedVendorId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<VendorTab>('dashboard');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vendors.length > 0 && !selectedVendorId) {
      setSelectedVendorId(vendors[0].id);
    }
  }, [vendors, selectedVendorId]);

  const fetchOrders = useCallback(async () => {
    if (!selectedVendorId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/vendor/${selectedVendorId}/orders`);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedVendorId]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const completeOrder = async (orderId: string) => {
    try {
      await fetch(`/api/vendor/${selectedVendorId}/orders/${orderId}/complete`, {
        method: 'POST'
      });
      fetchOrders();
    } catch (err) {
      console.error('Failed to complete order:', err);
    }
  };

  const currentVendor = vendors.find(v => v.id === selectedVendorId);
  const pendingOrders = orders.filter(o => o.status === 'pending');

  if (swiftLoading && !currentVendor) return <div className="loading-overlay">Syncing Kinetic Command...</div>;

  return (
    <div className="kinetic-command">
      {/* Sidebar Navigation */}
      <aside className="command-sidebar">
        <div className="command-profile">
          <div className="vendor-avatar">
            <Store size={20} />
          </div>
          <div className="vendor-info">
            <h3 className="vendor-name">{currentVendor?.name || 'Section 204'}</h3>
            <p className="vendor-loc">Premium Concourse</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={clsx('nav-item', activeTab === 'dashboard' && 'active')}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>
          <button 
            className={clsx('nav-item', activeTab === 'queue' && 'active')}
            onClick={() => setActiveTab('queue')}
          >
            <Layers size={18} />
            <span>Order Queue</span>
          </button>
          <button 
            className={clsx('nav-item', activeTab === 'inventory' && 'active')}
            onClick={() => setActiveTab('inventory')}
          >
            <Package size={18} />
            <span>Inventory</span>
          </button>
          <button 
            className={clsx('nav-item', activeTab === 'analytics' && 'active')}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart3 size={18} />
            <span>Analytics</span>
          </button>
        </nav>

        <div className="sidebar-util">
          <button className="nav-item small"><HelpCircle size={16} /> <span>Support</span></button>
          <button className="nav-item small"><History size={16} /> <span>System Logs</span></button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="command-main">
        {activeTab === 'dashboard' && (
          <div className="dashboard-view animate-fade">
            {/* Tactical Metrics Card */}
            <header className="tactical-header">
              <div className="metric-grid">
                <div className="metric-box">
                  <span className="m-label">Real-time Revenue</span>
                  <div className="m-value">$42,850.42</div>
                  <div className="m-trend positive">+8.2%</div>
                </div>
                <div className="metric-box">
                  <span className="m-label">Transactions</span>
                  <div className="m-value">3,124</div>
                  <div className="m-sub">Average check: $13.71</div>
                </div>
                <div className="metric-box">
                  <span className="m-label">Efficiency</span>
                  <div className="m-value">94.2%</div>
                  <div className="m-sub">Target: 92%+</div>
                </div>
              </div>
            </header>

            {/* Layout Grid */}
            <div className="dashboard-grid">
              {/* PALO Algorithm Card */}
              <section className="palo-card">
                <div className="section-header">
                  <Zap size={16} className="text-secondary" />
                  <h4>PALO Algorithm</h4>
                </div>
                <p className="section-desc">Dynamic Load-Balancing</p>
                <div className="palo-status-bar">
                  <div className="status-label">Optimized</div>
                  <div className="status-track">
                    <div className="status-fill" style={{ width: '75%' }} />
                  </div>
                </div>
                <div className="palo-insight">
                   <div className="insight-pill">
                     <Lightbulb size={12} />
                     <span>Wait times in Aisle 4 increasing. Rerouting 15% traffic.</span>
                   </div>
                </div>
              </section>

              {/* Critical Inventory */}
              <section className="inventory-card">
                 <div className="section-header">
                   <AlertTriangle size={16} className="text-warning" />
                   <h4>Critical Inventory</h4>
                 </div>
                 <div className="inv-list">
                    <div className="inv-item danger">
                      <div className="inv-info">
                        <span className="inv-name">Premium Draft Lager</span>
                        <span className="inv-count">14 Units Left</span>
                      </div>
                      <button className="inv-action">Restock</button>
                    </div>
                    <div className="inv-item warning">
                      <div className="inv-info">
                        <span className="inv-name">Angus Beef Patties</span>
                        <span className="inv-count">28 Units Left</span>
                      </div>
                      <button className="inv-action">Restock</button>
                    </div>
                 </div>
              </section>

              {/* Staff Management */}
              <section className="staff-card">
                <div className="section-header">
                  <Users size={16} className="text-primary" />
                  <h4>Staff Operations</h4>
                </div>
                <div className="staff-stats">
                  <div className="staff-pill"><b>18</b> Front of House</div>
                  <div className="staff-pill"><b>6</b> Kitchen Crew</div>
                </div>
                <p className="shift-notice">Shift ends in 2h 45m</p>
              </section>
            </div>
          </div>
        )}

        {activeTab === 'queue' && (
          <div className="queue-view animate-fade">
            <header className="queue-header">
              <h2>Order Queue</h2>
              <div className="queue-controls">
                 <span className="count-badge">{pendingOrders.length} Pending</span>
                 <select 
                    className="vendor-picker"
                    value={selectedVendorId} 
                    onChange={(e) => setSelectedVendorId(e.target.value)}
                  >
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
              </div>
            </header>

            <div className="orders-grid">
              {pendingOrders.map(order => (
                <div key={order.id} className="order-tactical-card">
                  <div className="order-top">
                    <div className="o-id">#{order.id.slice(-4).toUpperCase()}</div>
                    <div className="o-time"><Clock size={12}/> 2m ago</div>
                  </div>
                  <div className="o-content">
                    <ul className="o-items">
                      {order.items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <button className="o-complete-btn" onClick={() => completeOrder(order.id)}>
                    <CheckCircle2 size={16} />
                    <span>Complete Order</span>
                  </button>
                </div>
              ))}
              
              {pendingOrders.length === 0 && !loading && (
                <div className="queue-empty">
                  <Package size={48} className="opacity-20" />
                  <p>Queue is empty. Systems ready for next AI wave.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <style>{`
        .kinetic-command {
          display: grid;
          grid-template-columns: 280px 1fr;
          height: 100vh;
          background: var(--surface-variant);
          color: var(--text-main);
          font-family: var(--font-technical);
        }

        /* Sidebar */
        .command-sidebar {
          background: #1a1a1a;
          padding: 32px 16px;
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .command-profile {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 0 12px;
        }

        .vendor-avatar {
          width: 40px;
          height: 40px;
          background: var(--surface-high);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-primary);
        }

        .vendor-name {
          font-family: var(--font-editorial);
          font-size: 0.875rem;
          font-weight: 700;
        }

        .vendor-loc {
          font-size: 0.75rem;
          color: var(--text-dim);
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: var(--radius-md);
          border: none;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          font-weight: 600;
          transition: 0.2s;
          text-align: left;
        }

        .nav-item:hover, .nav-item.active {
          background: #262626;
          color: var(--text-main);
        }

        .nav-item.active {
          color: var(--accent-primary);
        }

        .sidebar-util {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .nav-item.small {
          font-size: 0.8125rem;
          padding: 8px 16px;
        }

        /* Main Content */
        .command-main {
          overflow-y: auto;
          background: var(--surface-variant);
        }

        .tactical-header {
          padding: 40px;
          background: linear-gradient(135deg, #1f1f1f 0%, #151515 100%);
        }

        .metric-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }

        .m-label {
          font-size: 0.6875rem;
          text-transform: uppercase;
          font-weight: 700;
          color: var(--text-dim);
          letter-spacing: 0.05em;
        }

        .m-value {
          font-family: var(--font-tactical);
          font-size: 2.25rem;
          font-weight: 800;
          margin: 4px 0;
        }

        .m-trend { font-size: 0.75rem; font-weight: 700; }
        .m-trend.positive { color: var(--accent-success); }
        .m-sub { font-size: 0.75rem; color: var(--text-muted); }

        .dashboard-grid {
          padding: 40px;
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 32px;
        }

        section {
          background: #201f1f;
          padding: 24px;
          border-radius: var(--radius-lg);
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .section-header h4 {
          font-family: var(--font-editorial);
          font-size: 0.9375rem;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .section-desc {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-bottom: 24px;
        }

        /* PALO Status */
        .palo-status-bar {
          margin-bottom: 24px;
        }

        .status-label {
          font-size: 0.6875rem;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .status-track {
          height: 4px;
          background: #333;
          border-radius: 2px;
          overflow: hidden;
        }

        .status-fill {
          height: 100%;
          background: var(--accent-secondary);
        }

        .palo-insight {
          background: #2a2a2a;
          padding: 12px;
          border-radius: var(--radius-md);
        }

        .insight-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.75rem;
          color: var(--accent-secondary);
        }

        /* Inventory */
        .inv-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .inv-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: #2a2a2a;
          border-radius: var(--radius-md);
        }

        .inv-info {
          display: flex;
          flex-direction: column;
        }

        .inv-name { font-size: 0.8125rem; font-weight: 600; }
        .inv-count { font-size: 0.75rem; color: var(--text-muted); }

        .inv-action {
          padding: 4px 12px;
          font-size: 0.6875rem;
          font-weight: 700;
          border-radius: 4px;
          border: 1px solid var(--text-dim);
          background: transparent;
          color: var(--text-main);
          cursor: pointer;
        }

        /* Staff */
        .staff-stats {
          display: flex;
          gap: 12px;
          border-radius: var(--radius-md);
          margin-bottom: 12px;
        }

        .staff-pill {
          background: #2a2a2a;
          padding: 8px 12px;
          border-radius: var(--radius-md);
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .staff-pill b { color: var(--text-main); margin-right: 4px; }

        .shift-notice {
          font-size: 0.6875rem;
          color: var(--text-dim);
          font-style: italic;
        }

        /* Queue View */
        .queue-view {
          padding: 40px;
        }

        .queue-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .queue-header h2 {
          font-family: var(--font-editorial);
          font-weight: 800;
        }

        .queue-controls {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .count-badge {
          background: var(--accent-warning);
          color: #000;
          font-size: 0.6875rem;
          font-weight: 800;
          padding: 4px 12px;
          border-radius: var(--radius-full);
        }

        .vendor-picker {
          background: #2a2a2a;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: var(--radius-md);
          font-size: 0.8125rem;
          font-weight: 600;
        }

        .orders-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }

        .order-tactical-card {
          background: #201f1f;
          padding: 20px;
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          gap: 16px;
          border: 1px solid transparent;
          transition: border-color 0.2s;
        }

        .order-tactical-card:hover {
          border-color: var(--accent-primary);
        }

        .order-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .o-id { font-family: var(--font-tactical); font-weight: 800; font-size: 1.125rem; }
        .o-time { font-size: 0.6875rem; color: var(--text-dim); display: flex; align-items: center; gap: 4px; }

        .o-items {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .o-items li {
          font-size: 0.8125rem;
          color: var(--text-muted);
          padding-left: 12px;
          position: relative;
        }

        .o-items li::before {
          content: "";
          position: absolute;
          left: 0;
          top: 8px;
          width: 4px;
          height: 4px;
          background: var(--accent-primary);
          border-radius: 50%;
        }

        .o-complete-btn {
          margin-top: auto;
          background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
          color: white;
          border: none;
          padding: 12px;
          border-radius: var(--radius-md);
          font-weight: 700;
          font-size: 0.8125rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
        }

        .queue-empty {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px;
          color: var(--text-dim);
          text-align: center;
        }

        .animate-fade {
          animation: fade-in 0.4s ease-out;
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .loading-overlay {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-muted);
          background: var(--surface-variant);
        }
      `}</style>
    </div>
  );
};

export default VendorHub;
