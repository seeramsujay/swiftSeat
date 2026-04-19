import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Loader2, CreditCard, Shield } from 'lucide-react';
import { clsx } from 'clsx';

interface OrderOverlayProps {
  item: string;
  vendorName: string;
  price: string;
  onClose: () => void;
  onSuccess: () => void;
}

const OrderOverlay: React.FC<OrderOverlayProps> = ({ item, vendorName, price, onClose, onSuccess }) => {
  const [status, setStatus] = useState<'review' | 'processing' | 'success'>('review');

  const handleConfirm = async () => {
    setStatus('processing');
    // Simulate payment sequence
    await new Promise(r => setTimeout(r, 2000));
    setStatus('success');
    await new Promise(r => setTimeout(r, 1500));
    onSuccess();
  };

  return (
    <div className="order-overlay-backdrop">
      <div className={clsx('order-card', status)}>
        {status !== 'processing' && (
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        )}

        {status === 'review' && (
          <div className="content">
            <div className="header">
              <CreditCard className="icon" />
              <h3>Confirm Frictionless Order</h3>
            </div>
            
            <div className="order-details">
              <div className="detail-row">
                <span>Item</span>
                <span>{item}</span>
              </div>
              <div className="detail-row">
                <span>Location</span>
                <span>{vendorName}</span>
              </div>
              <div className="detail-row total">
                <span>Total</span>
                <span>{price}</span>
              </div>
            </div>

            <div className="safety-badge">
              <Shield size={14} />
              <span>Identity verified via Stadium Pass</span>
            </div>

            <button className="confirm-btn" onClick={handleConfirm}>
              Place Order
            </button>
          </div>
        )}

        {status === 'processing' && (
          <div className="processing-state">
            <Loader2 className="spinner animate-spin" size={48} />
            <p>Securing your spot in queue...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="success-state">
            <CheckCircle2 className="success-icon" size={64} />
            <h2>Order Placed!</h2>
            <p>Added to Google Wallet</p>
          </div>
        )}
      </div>

      <style>{`
        .order-overlay-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease;
        }

        .order-card {
          width: 90%;
          max-width: 400px;
          background: var(--bg-secondary);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-lg);
          padding: 32px;
          position: relative;
          box-shadow: 0 24px 48px rgba(0,0,0,0.4);
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .order-card.success {
          text-align: center;
          border-color: var(--status-safe);
        }

        .close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          background: transparent;
          border: none;
          color: var(--text-dim);
          cursor: pointer;
        }

        .header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .header .icon { color: var(--accent-primary); }
        .header h3 { margin: 0; font-size: 1.25rem; font-weight: 700; }

        .order-details {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.9375rem;
          color: var(--text-muted);
        }

        .detail-row.total {
          border-top: 1px solid var(--glass-border);
          padding-top: 12px;
          margin-top: 4px;
          font-weight: 700;
          color: var(--text-main);
          font-size: 1.125rem;
        }

        .confirm-btn {
          width: 100%;
          padding: 16px;
          background: var(--accent-primary);
          color: white;
          border: none;
          border-radius: var(--radius-sm);
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: filter 0.2s;
        }

        .confirm-btn:hover { filter: brightness(1.1); }

        .safety-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 0.75rem;
          color: var(--status-safe);
          margin-bottom: 16px;
          opacity: 0.8;
        }

        .processing-state, .success-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 0;
          gap: 20px;
        }

        .spinner { color: var(--accent-primary); }
        .success-icon { color: var(--status-safe); animation: popScale 0.5s ease; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popScale { 
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default OrderOverlay;
