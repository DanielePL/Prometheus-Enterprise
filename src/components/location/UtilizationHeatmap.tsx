import { useState } from 'react';

interface UtilizationHeatmapProps {
  data: number[][];
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 17 }, (_, i) => `${(i + 6).toString().padStart(2, '0')}:00`);

function getHeatColor(value: number): string {
  // Green (low) -> Yellow (mid) -> Red (high)
  if (value <= 0) return 'hsl(var(--muted))';
  if (value <= 25) return `hsl(142, 76%, ${56 - value * 0.4}%)`;
  if (value <= 50) return `hsl(${142 - (value - 25) * 4.16}, 80%, 45%)`;
  if (value <= 75) return `hsl(${38 - (value - 50) * 1.52}, 90%, 50%)`;
  return `hsl(${0}, ${80 + Math.min(value - 75, 25) * 0.4}%, ${55 - Math.min(value - 75, 25) * 0.4}%)`;
}

export default function UtilizationHeatmap({ data }: UtilizationHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<{ day: number; hour: number } | null>(null);

  return (
    <div className="space-y-3">
      {/* Hour labels */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Header row with hour labels */}
          <div className="grid gap-[2px]" style={{ gridTemplateColumns: '60px repeat(17, 1fr)' }}>
            <div />
            {HOURS.map(h => (
              <div
                key={h}
                className="text-[10px] text-center text-muted-foreground truncate"
              >
                {h.slice(0, 2)}
              </div>
            ))}
          </div>

          {/* Data rows */}
          {DAYS.map((day, dayIdx) => (
            <div
              key={day}
              className="grid gap-[2px] mt-[2px]"
              style={{ gridTemplateColumns: '60px repeat(17, 1fr)' }}
            >
              <div className="text-xs text-muted-foreground flex items-center font-medium">
                {day}
              </div>
              {HOURS.map((_, hourIdx) => {
                const value = data[dayIdx]?.[hourIdx] ?? 0;
                const isHovered =
                  hoveredCell?.day === dayIdx && hoveredCell?.hour === hourIdx;

                return (
                  <div
                    key={`${dayIdx}-${hourIdx}`}
                    className="aspect-square rounded-sm cursor-pointer transition-all duration-150"
                    style={{
                      backgroundColor: getHeatColor(value),
                      opacity: isHovered ? 1 : 0.85,
                      transform: isHovered ? 'scale(1.15)' : 'scale(1)',
                      zIndex: isHovered ? 10 : 0,
                      position: 'relative',
                    }}
                    onMouseEnter={() => setHoveredCell({ day: dayIdx, hour: hourIdx })}
                    onMouseLeave={() => setHoveredCell(null)}
                    title={`${day} ${HOURS[hourIdx]}: ${value}% occupancy`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend and hovered info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Low</span>
          <div className="flex gap-[1px]">
            {[0, 15, 30, 45, 60, 75, 90].map(v => (
              <div
                key={v}
                className="w-5 h-3 rounded-sm"
                style={{ backgroundColor: getHeatColor(v) }}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">High</span>
        </div>

        {hoveredCell && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">
              {DAYS[hoveredCell.day]} {HOURS[hoveredCell.hour]}
            </span>
            : {data[hoveredCell.day]?.[hoveredCell.hour] ?? 0}% occupancy
          </div>
        )}
      </div>
    </div>
  );
}
