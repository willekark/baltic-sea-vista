import { type Vessel, VESSEL_COLORS, getVesselColor } from "./lib/vessel";

const LEGEND = [
  { label: "Active", color: VESSEL_COLORS.active },
  { label: "Idle", color: VESSEL_COLORS.idle },
  { label: "Shadow Fleet", color: VESSEL_COLORS.shadow },
  { label: "Anchored", color: VESSEL_COLORS.anchored },
];

export default function Sidebar({
  vessels,
  onVesselClick,
}: {
  vessels: Vessel[];
  onVesselClick?: (v: Vessel) => void;
}) {
  return (
    <aside className="w-72 h-full bg-background border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <h1 className="text-lg font-semibold text-foreground">
          Baltic Sea Vista
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Shadow Fleet Tracking
        </p>
      </div>

      <div className="p-4 border-b border-border">
        <h2 className="text-xs font-medium text-muted-foreground uppercase mb-3">
          Status
        </h2>
        <div className="space-y-2 text-sm">
          {LEGEND.map((l) => (
            <div key={l.label} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ background: l.color }}
              />
              <span className="text-map-text">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="text-xs font-medium text-muted-foreground uppercase mb-3">
          Vessels ({vessels.length})
        </h2>
        <div className="space-y-1">
          {vessels.map((v) => (
            <button
              key={v.MMSI}
              onClick={() => onVesselClick?.(v)}
              className="w-full text-left p-2 rounded hover:bg-panel-hover"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: getVesselColor(v) }}
                />
                <span className="text-sm text-map-text truncate">
                  {v.NAME || "Unknown"}
                </span>
              </div>
              <div className="text-xs text-map-text-muted mt-1 pl-4">
                {v.SOG ?? 0} kn · {v.MMSI}
              </div>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
