import React from 'react';
import { Zone, Vendor } from '../types';
import '../styles/stadium.css';

interface StadiumMapProps {
  zones: Zone[];
  vendors: Vendor[];
}

const StadiumMap: React.FC<StadiumMapProps> = ({ zones, vendors }) => {
  const getZoneClass = (id: string) => {
    const zone = zones.find(z => z.id === id);
    if (!zone) return '';
    return `zone-${zone.status}`;
  };

  return (
    <div className="heatmap-overlay">
      <svg viewBox="0 0 800 560" className="stadium-svg">
        <defs>
          <radialGradient id="pitchGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1a4a1a"/>
            <stop offset="100%" stopColor="#0d2e0d"/>
          </radialGradient>
        </defs>

        {/* Pitch */}
        <ellipse cx="400" cy="280" rx="155" ry="105" fill="url(#pitchGrad)" stroke="#2a5a2a" strokeWidth="1.5"/>
        
        {/* Concourse Zones - Dynamically Colored */}
        <g id="zone_north_1" className={`zone ${getZoneClass('zone_north_1')}`}>
          <rect x="158" y="60" width="484" height="88" rx="8"/>
        </g>
        <g id="zone_south_1" className={`zone ${getZoneClass('zone_south_1')}`}>
          <rect x="158" y="412" width="484" height="88" rx="8"/>
        </g>
        <g id="zone_east_1" className={`zone ${getZoneClass('zone_east_1')}`}>
          <rect x="700" y="155" width="74" height="250" rx="8"/>
        </g>
        <g id="zone_west_1" className={`zone ${getZoneClass('zone_west_1')}`}>
          <rect x="26" y="155" width="74" height="250" rx="8"/>
        </g>

        {/* Corner Zones */}
        <g id="zone_nw_corner" className={`zone ${getZoneClass('zone_nw_corner')}`}><rect x="26" y="60" width="126" height="90" rx="8"/></g>
        <g id="zone_ne_corner" className={`zone ${getZoneClass('zone_ne_corner')}`}><rect x="648" y="60" width="126" height="90" rx="8"/></g>
        <g id="zone_sw_corner" className={`zone ${getZoneClass('zone_sw_corner')}`}><rect x="26" y="410" width="126" height="90" rx="8"/></g>
        <g id="zone_se_corner" className={`zone ${getZoneClass('zone_se_corner')}`}><rect x="648" y="410" width="126" height="90" rx="8"/></g>

        {/* Labels */}
        <text className="zone-label" x="400" y="105" textAnchor="middle" fill="#6b7fa3" fontSize="11">NORTH CONCOURSE</text>
        <text className="zone-label" x="400" y="458" textAnchor="middle" fill="#6b7fa3" fontSize="11">SOUTH CONCOURSE</text>

        {/* Vendors */}
        {vendors.map(v => (
          <g key={v.id} className="vendor-group">
            <circle 
              className={clsx('vendor-dot', v.is_active && 'active')} 
              cx={v.location.x} 
              cy={v.location.y} 
              r="6" 
            />
            <text className="vendor-label" x={v.location.x + 10} y={v.location.y + 4} fill="#c9d4f0" fontSize="9" fontWeight="600">
              {v.name}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

function clsx(...args: any[]) {
  return args.filter(Boolean).join(' ');
}

export default StadiumMap;
