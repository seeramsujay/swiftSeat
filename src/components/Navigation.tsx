import React from 'react';
import { Shield, User, Store, Activity } from 'lucide-react';
import { clsx } from 'clsx';

type Role = 'Admin' | 'User' | 'Vendor';

interface NavigationProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentRole, onRoleChange }) => {
  const roles: { id: Role; icon: any; label: string }[] = [
    { id: 'Admin', icon: Shield, label: 'Ops Center' },
    { id: 'User', icon: User, label: 'Concierge' },
    { id: 'Vendor', icon: Store, label: 'Vendor Hub' },
  ];

  return (
    <nav className="nav-container">
      <div className="nav-brand">
        <Activity className="brand-icon" />
        <span className="brand-text">SwiftSeat</span>
      </div>
      
      <div className="nav-links">
        {roles.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onRoleChange(id)}
            className={clsx('nav-link', currentRole === id && 'active')}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="nav-status">
        <div className="status-dot green" />
        <span>Live System</span>
      </div>

      <style>{`
        .nav-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 24px;
          background: var(--bg-secondary);
          border-bottom: 2px solid var(--bg-tertiary);
          backdrop-filter: var(--glass-blur);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-icon {
          color: var(--accent-primary);
        }

        .brand-text {
          font-weight: 700;
          font-size: 1.25rem;
          letter-spacing: -0.02em;
          font-family: 'Outfit';
        }

        .nav-links {
          display: flex;
          gap: 8px;
          background: var(--bg-primary);
          padding: 4px;
          border-radius: var(--radius-md);
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s ease;
          border-radius: var(--radius-sm);
        }

        .nav-link:hover {
          color: var(--text-main);
          background: rgba(255, 255, 255, 0.05);
        }

        .nav-link.active {
          background: var(--bg-tertiary);
          color: var(--accent-primary);
          box-shadow: var(--shadow-glow);
        }

        .nav-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--text-dim);
          letter-spacing: 0.05em;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .status-dot.green {
          background: var(--accent-success);
          box-shadow: 0 0 10px var(--accent-success);
        }
      `}</style>
    </nav>
  );
};

export default Navigation;
