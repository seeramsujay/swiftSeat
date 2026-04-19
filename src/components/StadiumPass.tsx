import React from 'react';
import { Smartphone, Download, QrCode, MapPin, Clock } from 'lucide-react';

interface StadiumPassProps {
  orderId: string;
  item: string;
  vendor: string;
  price: string;
  onClose: () => void;
}

const StadiumPass: React.FC<StadiumPassProps> = ({ orderId, item, vendor, price, onClose }) => {
  return (
    <div className="pass-backdrop">
      <div className="pass-card">
        <div className="pass-header">
          <div className="logo-section">
            <div className="logo-icon">S</div>
            <div>
              <h3>SwiftSeat</h3>
              <p>Mobile Entry Pass</p>
            </div>
          </div>
          <button className="close-pass" onClick={onClose}>&times;</button>
        </div>

        <div className="pass-body">
          <div className="main-info">
            <span className="label">ITEM</span>
            <h2 className="value">{item}</h2>
          </div>

          <div className="row">
            <div className="col">
              <span className="label">LOCATION</span>
              <div className="value-with-icon">
                <MapPin size={12} />
                <span>{vendor}</span>
              </div>
            </div>
            <div className="col">
              <span className="label">PRICE</span>
              <span className="value">{price}</span>
            </div>
          </div>

          <div className="row">
            <div className="col">
              <span className="label">ORDER ID</span>
              <span className="value">#{orderId.slice(-6).toUpperCase()}</span>
            </div>
            <div className="col">
              <span className="label">WAIT TIME</span>
              <div className="value-with-icon">
                <Clock size={12} />
                <span>~8 Mins</span>
              </div>
            </div>
          </div>

          <div className="qr-container">
            <QrCode size={160} className="qr-code" />
            <p className="scan-text">SCAN AT STAND FOR PICKUP</p>
          </div>
        </div>

        <button className="wallet-btn">
          <Smartphone size={18} />
          <span>Add to Google Wallet</span>
        </button>
      </div>

      <style>{`
        .pass-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1100;
          animation: slideUpIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .pass-card {
          width: 320px;
          background: #111111;
          color: white;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          overflow: hidden;
          box-shadow: 0 40px 80px rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
        }

        .pass-header {
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%);
          border-bottom: 1px dashed rgba(255, 255, 255, 0.1);
          position: relative;
        }

        /* The perforated edges */
        .pass-header::before, .pass-header::after {
          content: "";
          position: absolute;
          bottom: -10px;
          width: 20px;
          height: 20px;
          background: #111111;
          border-radius: 50%;
          z-index: 10;
        }
        .pass-header::before { left: -10px; }
        .pass-header::after { right: -10px; }

        .logo-section { display: flex; gap: 12px; align-items: center; }
        .logo-icon {
          width: 32px;
          height: 32px;
          background: var(--accent-primary);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 1.2rem;
        }

        .logo-section h3 { margin: 0; font-size: 0.9rem; letter-spacing: 0.05em; font-weight: 800; }
        .logo-section p { margin: 0; font-size: 0.6rem; text-transform: uppercase; color: var(--text-dim); }

        .close-pass {
          background: transparent;
          border: none;
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
          opacity: 0.5;
        }

        .pass-body { padding: 24px; display: flex; flex-direction: column; gap: 20px; }

        .label {
          display: block;
          font-size: 0.6rem;
          font-weight: 700;
          color: var(--text-dim);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 4px;
        }

        .value { font-size: 0.95rem; font-weight: 600; color: white; }
        .main-info .value { font-size: 1.4rem; color: var(--accent-secondary); }

        .row { display: flex; gap: 24px; }
        .col { flex: 1; }

        .value-with-icon { display: flex; align-items: center; gap: 6px; font-size: 0.9rem; font-weight: 600; }

        .qr-container {
          background: white;
          padding: 24px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          margin-top: 8px;
        }

        .qr-code { color: black; }
        .scan-text {
          color: black;
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          margin: 0;
        }

        .wallet-btn {
          margin: 20px;
          padding: 14px;
          background: white;
          color: black;
          border: none;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
        }

        @keyframes slideUpIn {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default StadiumPass;
