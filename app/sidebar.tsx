/**
 * Sidebar component for vessel list and legend display.
 * Shows vessel status legend and scrollable list of tracked vessels.
 * @module components/Sidebar
 */

import {
  type Vessel,
  type VesselFilter,
  VESSEL_COLORS,
  getVesselColor,
} from "./lib/vessel";
import FilterPanel from "./filter-panel";

/** Legend items mapping status labels to their colors */
const LEGEND = [
  { label: "Active", color: VESSEL_COLORS.active },
  { label: "Idle", color: VESSEL_COLORS.idle },
  { label: "Shadow Fleet", color: VESSEL_COLORS.shadow },
  { label: "Anchored", color: VESSEL_COLORS.anchored },
];

/**
 * Sidebar displaying vessel legend and clickable vessel list.
 * @param vessels - Array of vessels to display in the list
 * @param filter - Current filter settings
 * @param onFilterChange - Callback when filters are modified
 * @param onRefetch - Callback to refetch vessels at current map position
 * @param onVesselClick - Callback when a vessel is clicked (for map navigation)
 */
export default function Sidebar({
  vessels,
  filter,
  onFilterChange,
  onRefetch,
  onVesselClick,
}: {
  vessels: Vessel[];
  filter: VesselFilter;
  onFilterChange: (f: VesselFilter) => void;
  onRefetch?: () => void;
  onVesselClick?: (v: Vessel) => void;
}) {
  return (
    <aside className="absolute top-4 left-4 bottom-4 w-72 bg-panel-bg backdrop-blur-md border border-panel-border rounded-xl flex flex-col z-10 overflow-hidden">
      <div className="p-4 border-b border-panel-border">
        <h1 className="text-lg font-semibold text-foreground">
          Baltic Sea Vista
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Shadow Fleet Tracking
        </p>
      </div>

      <div className="p-4 border-b border-panel-border">
        <h2 className="text-xs font-medium text-muted-foreground uppercase mb-3">
          Filters
        </h2>
        <FilterPanel filter={filter} onChange={onFilterChange} />
        <button
          onClick={onRefetch}
          className="mt-3 w-full py-2 px-3 bg-primary/20 hover:bg-primary/30 text-primary text-sm font-medium rounded transition-colors"
        >
          Search This Area
        </button>
      </div>

      <div className="p-4 border-b border-panel-border">
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
