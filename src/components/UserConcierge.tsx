import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MapPin, Loader2, Camera, ShoppingBag, X } from 'lucide-react';
import { useSwiftSeat } from '../hooks/useSwiftSeat';
import { usePALO } from '../hooks/usePALO';
import OrderOverlay from './OrderOverlay';
import StadiumPass from './StadiumPass';
import { clsx } from 'clsx';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  type?: 'text' | 'recommendation';
  data?: any;
}

const UserConcierge: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'bot', text: 'Hi! I am Gemini, your stadium concierge. Hungry? Tell me what you crave and I will find the fastest route using PALO.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<{ item: string; vendor: string; price: string } | null>(null);
  const [confirmedOrderPass, setConfirmedOrderPass] = useState<{ id: string; item: string; vendor: string; price: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { vendors, refresh } = useSwiftSeat();
  const { calculateScores } = usePALO();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });
      const data = await res.json();

      if (data.type === 'function_call') {
        if (data.function === 'get_optimal_route') {
          // Trigger PALO client-side
          const scored = calculateScores(vendors, {}, { alpha: 30 });
          const best = scored[0];
          
          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            role: 'bot',
            text: `I found the fastest ${data.arguments.food_category || 'food'} for you! ${best.name} has the lowest PALO score.`,
            type: 'recommendation',
            data: best
          }]);
        } else if (data.function === 'place_order') {
          setPendingOrder({
            item: data.arguments.item || 'Custom Item',
            vendor: data.arguments.stand_id || 'SwiftStand',
            price: '$12.50' // Mock standard pricing
          });
        }
      } else {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'bot', text: data.reply }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'bot', text: 'Sorry, I lost connection to the Command Center.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="concierge-container">
      <div className="chat-window">
        {messages.map(msg => (
          <div key={msg.id} className={clsx('msg-row', msg.role)}>
            {msg.role === 'bot' && <div className="bot-avatar"><Sparkles size={14} /></div>}
            <div className="msg-bubble">
              <p>{msg.text}</p>
              {msg.type === 'recommendation' && (
                  <div className="rec-actions">
                    <button className="rec-action route" title="View Path">
                      <MapPin size={14} />
                      <span>Route Me</span>
                    </button>
                    <button 
                      className="rec-action order" 
                      onClick={() => setPendingOrder({ item: 'Recommended Combo', vendor: msg.data.id, price: '$14.00' })}
                    >
                      <ShoppingBag size={14} />
                      <span>Order Now</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        {isTyping && (
          <div className="typing-skeleton">
            <div className="bot-avatar pulse"><Sparkles size={14} /></div>
            <div className="skeleton-bubble">
              <div className="skeleton-line w-3/4"></div>
              <div className="skeleton-line w-1/2"></div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {pendingOrder && (
        <OrderOverlay 
          item={pendingOrder.item}
          vendorName={pendingOrder.vendor}
          price={pendingOrder.price}
          onClose={() => setPendingOrder(null)}
          onSuccess={async () => {
            const currentItem = pendingOrder.item;
            const currentVendor = pendingOrder.vendor;
            setPendingOrder(null);
            
            // Post to backend to actually place order
            try {
              await fetch('/api/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vendor_id: currentVendor, item: currentItem })
              });
              refresh(); // Refresh queues
            } catch (e) { console.error("Order sync failed"); }

            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              role: 'bot',
              text: `Order confirmed for ${currentItem}! I've sent the digital pass to your Google Wallet. It will alert you when it's your turn!`
            }]);

            // Show the digital pass automatically for "Added to Wallet" feel
            setConfirmedOrderPass({
              id: Math.random().toString(36).substr(2, 9),
              item: currentItem,
              vendor: currentVendor,
              price: '$12.50'
            });
          }}
        />
      )}

      {confirmedOrderPass && (
        <StadiumPass 
          orderId={confirmedOrderPass.id}
          item={confirmedOrderPass.item}
          vendor={confirmedOrderPass.vendor}
          price={confirmedOrderPass.price}
          onClose={() => setConfirmedOrderPass(null)}
        />
      )}

      <div className="input-container">
        {showImagePreview && (
          <div className="image-preview">
            <img src="https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&q=80&w=100" alt="Mock Vision" />
            <button onClick={() => setShowImagePreview(false)}><X size={12} /></button>
          </div>
        )}
        <div className="input-area">
          <button className="aux-btn" onClick={() => setShowImagePreview(true)}>
            <Camera size={20} />
          </button>
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask for food, routes, or help..."
          />
          <button onClick={handleSend} className="send-btn">
            <Send size={18} />
          </button>
        </div>
      </div>

      <style>{`
        .concierge-container {
          height: calc(100vh - 80px);
          display: flex;
          flex-direction: column;
          max-width: 800px;
          margin: 0 auto;
          padding: 24px;
        }

        .chat-window {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding-bottom: 20px;
        }

        .msg-row {
          display: flex;
          gap: 12px;
          max-width: 85%;
        }

        .msg-row.user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .bot-avatar {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .msg-bubble {
          padding: 12px 18px;
          border-radius: var(--radius-md);
          font-size: 0.9375rem;
          line-height: 1.5;
        }

        .bot .msg-bubble {
          background: var(--bg-secondary);
          color: var(--text-main);
          border-bottom-left-radius: 0;
        }

        .user .msg-bubble {
          background: var(--accent-primary);
          color: white;
          border-bottom-right-radius: 0;
        }

        .recommendation-card {
          margin-top: 12px;
          background: var(--bg-tertiary);
          border-radius: var(--radius-sm);
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .rec-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .rec-name { font-weight: 700; color: var(--text-main); }
        .rec-stats { font-size: 0.75rem; color: var(--text-muted); }

        .rec-action {
          padding: 8px 12px;
          background: var(--bg-secondary);
          border: 1px solid var(--glass-border);
          color: var(--text-muted);
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          flex: 1;
        }

        .rec-action.order {
          background: var(--accent-primary);
          color: white;
          border-color: transparent;
        }

        .rec-action:hover {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }

        .rec-actions {
          display: flex;
          gap: 8px;
          flex: 1;
        }

        .input-area {
          display: flex;
          gap: 12px;
          background: var(--bg-secondary);
          padding: 8px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--glass-border);
        }

        input {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-main);
          padding: 12px 16px;
          outline: none;
          font-size: 0.9375rem;
        }

        .send-btn {
          width: 48px;
          height: 48px;
          background: var(--accent-primary);
          color: white;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease;
        }

        .send-btn:hover { transform: scale(1.05); }

        .input-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .image-preview {
          width: 80px;
          height: 80px;
          position: relative;
          border-radius: var(--radius-sm);
          overflow: hidden;
          margin-left: 8px;
          border: 1px solid var(--accent-primary);
        }

        .image-preview img { width: 100%; height: 100%; object-fit: cover; }
        .image-preview button {
          position: absolute;
          top: 4px;
          right: 4px;
          background: rgba(0,0,0,0.6);
          color: white;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .aux-btn {
          background: transparent;
          border: none;
          color: var(--text-dim);
          padding: 8px;
          cursor: pointer;
          border-radius: 50%;
        }

        .aux-btn:hover { background: var(--bg-tertiary); color: var(--accent-primary); }

        .typing-skeleton {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          animation: fadeIn 0.3s ease;
        }

        .skeleton-bubble {
          background: var(--bg-secondary);
          padding: 16px;
          border-radius: var(--radius-md);
          border-bottom-left-radius: 0;
          width: 200px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .skeleton-line {
          height: 8px;
          background: var(--bg-tertiary);
          border-radius: 4px;
          position: relative;
          overflow: hidden;
        }

        .skeleton-line::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
          animation: shimmer 1.5s infinite;
        }

        .pulse { animation: pulse 2s infinite; }
        .w-3\/4 { width: 75%; }
        .w-1\/2 { width: 50%; }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.6; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default UserConcierge;
