import { useState } from 'react';
import { CHART_COLORS } from '@/lib/chartConstants';
import type { PLZData } from '@/services/locationDemoData';

interface ZurichCatchmentMapProps {
  plzData: PLZData[];
}

// Map lat/lng bounds for Zurich area to SVG space
const LAT_MIN = 47.30;
const LAT_MAX = 47.43;
const LNG_MIN = 8.44;
const LNG_MAX = 8.63;
const SVG_WIDTH = 600;
const SVG_HEIGHT = 450;
const PADDING = 30;

function latLngToSvg(lat: number, lng: number): { x: number; y: number } {
  const x = PADDING + ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * (SVG_WIDTH - 2 * PADDING);
  // Invert Y because SVG y grows downward, latitude grows upward
  const y = PADDING + ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * (SVG_HEIGHT - 2 * PADDING);
  return { x, y };
}

export default function ZurichCatchmentMap({ plzData }: ZurichCatchmentMapProps) {
  const [hoveredPlz, setHoveredPlz] = useState<PLZData | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Gym location (8004 Aussersihl)
  const gymPlz = plzData.find(p => p.distanceKm === 0) || plzData[0];
  const gymPos = gymPlz ? latLngToSvg(gymPlz.lat, gymPlz.lng) : { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };

  const maxMembers = Math.max(...plzData.map(p => p.members), 1);

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        className="w-full h-auto"
        style={{ maxHeight: 400 }}
      >
        {/* Background */}
        <rect
          x="0"
          y="0"
          width={SVG_WIDTH}
          height={SVG_HEIGHT}
          rx="8"
          fill="hsl(var(--muted))"
          opacity="0.3"
        />

        {/* Catchment radius rings */}
        {[1, 3, 5].map(km => {
          // approximate: 1 degree lat ~ 111km, 1 degree lng ~ 75km in Zurich
          const radiusX = (km / 75) / (LNG_MAX - LNG_MIN) * (SVG_WIDTH - 2 * PADDING);
          const radiusY = (km / 111) / (LAT_MAX - LAT_MIN) * (SVG_HEIGHT - 2 * PADDING);
          return (
            <g key={km}>
              <ellipse
                cx={gymPos.x}
                cy={gymPos.y}
                rx={radiusX}
                ry={radiusY}
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.6"
              />
              <text
                x={gymPos.x + radiusX + 4}
                y={gymPos.y - 4}
                fill="hsl(var(--muted-foreground))"
                fontSize="10"
              >
                {km}km
              </text>
            </g>
          );
        })}

        {/* PLZ bubbles */}
        {plzData
          .filter(p => p.members > 0)
          .map((p, i) => {
            const pos = latLngToSvg(p.lat, p.lng);
            const radius = 6 + Math.sqrt(p.members / maxMembers) * 22;
            const opacity = 0.3 + (p.penetration / Math.max(...plzData.map(d => d.penetration), 0.001)) * 0.6;
            const color = CHART_COLORS[i % CHART_COLORS.length];

            return (
              <g key={p.plz}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={radius}
                  fill={color}
                  opacity={opacity}
                  stroke={color}
                  strokeWidth="1.5"
                  strokeOpacity="0.8"
                  className="cursor-pointer transition-all duration-200 hover:opacity-90"
                  onMouseEnter={(e) => {
                    setHoveredPlz(p);
                    const svgRect = (e.target as SVGElement).closest('svg')?.getBoundingClientRect();
                    if (svgRect) {
                      const scaleX = svgRect.width / SVG_WIDTH;
                      const scaleY = svgRect.height / SVG_HEIGHT;
                      setTooltipPos({
                        x: pos.x * scaleX,
                        y: pos.y * scaleY,
                      });
                    }
                  }}
                  onMouseLeave={() => setHoveredPlz(null)}
                />
                {radius > 12 && (
                  <text
                    x={pos.x}
                    y={pos.y + 4}
                    textAnchor="middle"
                    fill="white"
                    fontSize="10"
                    fontWeight="bold"
                    pointerEvents="none"
                  >
                    {p.members}
                  </text>
                )}
              </g>
            );
          })}

        {/* Gym marker */}
        <g>
          <circle
            cx={gymPos.x}
            cy={gymPos.y}
            r="8"
            fill="hsl(23, 87%, 55%)"
            stroke="white"
            strokeWidth="3"
          />
          <circle
            cx={gymPos.x}
            cy={gymPos.y}
            r="12"
            fill="none"
            stroke="hsl(23, 87%, 55%)"
            strokeWidth="2"
            opacity="0.5"
          />
        </g>

        {/* Legend */}
        <g transform={`translate(${SVG_WIDTH - 120}, ${SVG_HEIGHT - 60})`}>
          <rect x="0" y="0" width="110" height="50" rx="4" fill="hsl(var(--card))" opacity="0.9" />
          <circle cx="15" cy="15" r="6" fill="hsl(23, 87%, 55%)" stroke="white" strokeWidth="2" />
          <text x="28" y="19" fill="hsl(var(--foreground))" fontSize="10">Your Gym</text>
          <circle cx="15" cy="35" r="6" fill={CHART_COLORS[0]} opacity="0.6" />
          <text x="28" y="39" fill="hsl(var(--foreground))" fontSize="10">PLZ Area</text>
        </g>
      </svg>

      {/* Tooltip */}
      {hoveredPlz && (
        <div
          className="absolute pointer-events-none z-10 bg-card border border-border rounded-lg p-3 shadow-lg text-sm"
          style={{
            left: tooltipPos.x + 16,
            top: tooltipPos.y - 10,
            transform: 'translateY(-50%)',
          }}
        >
          <p className="font-semibold">{hoveredPlz.plz} {hoveredPlz.name}</p>
          <p className="text-muted-foreground">{hoveredPlz.members} members</p>
          <p className="text-muted-foreground">Penetration: {(hoveredPlz.penetration * 100).toFixed(2)}%</p>
          <p className="text-muted-foreground">Distance: {hoveredPlz.distanceKm} km</p>
        </div>
      )}
    </div>
  );
}
