import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import OperationsCenter from './components/OperationsCenter';
import UserConcierge from './components/UserConcierge';
import VendorHub from './components/VendorHub';
import SafetyAlert from './components/SafetyAlert';
import Login from './components/Login';
import { useSwiftSeat } from './hooks/useSwiftSeat';

type Role = 'Admin' | 'User' | 'Vendor' | null;

const App: React.FC = () => {
  const [role, setRole] = useState<Role>(null);
  const { zones } = useSwiftSeat();
  const [activeAlert, setActiveAlert] = useState<{ message: string; zoneId: string } | null>(null);

  useEffect(() => {
    // Proactive Safety Logic: Trigger alert if any zone > 85% density
    if (role === null) return;
    const criticalZone = zones.find(z => z.density > 0.85);
    if (criticalZone && !activeAlert) {
      setActiveAlert({
        message: `${criticalZone.name} is reaching peak capacity. Consider alternative routes.`,
        zoneId: criticalZone.id.replace('zone_', '').toUpperCase()
      });
    }
  }, [zones, activeAlert, role]);

  if (role === null) {
    return <Login onLogin={setRole} />;
  }

  // Admin and Vendor get their own dedicated UI
  if (role === 'Admin') {
    return <OperationsCenter />;
  }

  if (role === 'Vendor') {
    return <VendorHub />;
  }

  // User Concierge shell
  return (
    <div className="app-shell">
      {activeAlert && (
        <SafetyAlert 
          message={activeAlert.message} 
          zoneId={activeAlert.zoneId} 
          onClose={() => setActiveAlert(null)} 
        />
      )}
      <Navigation currentRole={role} onRoleChange={(r) => setRole(r as Role)} />
      <main className="main-content">
        <UserConcierge />
      </main>
    </div>
  );
};

export default App;
