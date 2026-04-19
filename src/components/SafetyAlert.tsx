import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';

interface SafetyAlertProps {
  message: string;
  zoneId: string;
  onClose: () => void;
}

const SafetyAlert: React.FC<SafetyAlertProps> = ({ message, zoneId, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 500);
    }, 8000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={clsx('safety-toast-container', { visible })}>
      <div className="safety-toast">
        <div className="pulse-container">
          <div className="pulse-ring"></div>
          <AlertTriangle className="alert-icon" size={20} />
        </div>
        
        <div className="alert-content">
          <div className="alert-header">
            <h4>HIGH DENSITY ALERT</h4>
            <span className="zone-tag">{zoneId}</span>
          </div>
          <p>{message}</p>
        </div>

        <button className="dismiss-btn" onClick={() => { setVisible(false); setTimeout(onClose, 500); }}>
          <X size={18} />
        </button>
      </div>

      <style>{`
        .safety-toast-container {
          position: fixed;
          top: 24px;
          left: 50%;
          transform: translateX(-50%) translateY(-120%);
          z-index: 2000;
          transition: transform 0.5s cubic-bezier(0.19, 1, 0.22, 1);
          width: 90%;
          max-width: 500px;
        }

        .safety-toast-container.visible {
          transform: translateX(-50%) translateY(0);
        }

        .safety-toast {
          background: rgba(185, 28, 28, 0.9);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: var(--radius-md);
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 16px;
          color: white;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }

        .pulse-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          flex-shrink: 0;
        }

        .pulse-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          background: white;
          border-radius: 50%;
          opacity: 0.4;
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .alert-icon { z-index: 10; }

        .alert-content { flex: 1; }
        .alert-header { display: flex; align-items: center; gap: 8px; margin-bottom: 2px; }
        .alert-header h4 { margin: 0; font-size: 0.75rem; font-weight: 800; letter-spacing: 0.1em; }
        .zone-tag { 
          background: rgba(255,255,255,0.2); 
          padding: 2px 6px; 
          border-radius: 4px; 
          font-size: 0.65rem; 
          font-weight: 700; 
        }

        .alert-content p { margin: 0; font-size: 0.875rem; font-weight: 500; opacity: 0.9; }

        .dismiss-btn {
          background: transparent;
          border: none;
          color: white;
          opacity: 0.6;
          cursor: pointer;
          padding: 4px;
        }

        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default SafetyAlert;
