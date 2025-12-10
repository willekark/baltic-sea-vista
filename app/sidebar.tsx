import type { Vessel } from "./types/vessel";

interface SidebarProps {
  vessels: Vessel[];
  onVesselClick?: (vessel: Vessel) => void;
}

export default function Sidebar({ vessels, onVesselClick }: SidebarProps) {
  return (
    <aside className="w-72 h-full bg-[#0d1117] border-r border-[#30363d] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#30363d]">
        <h1 className="text-lg font-semibold text-white">Baltic Sea Vista</h1>
        <p className="text-xs text-[#8b949e] mt-1">Shadow Fleet Tracking</p>
      </div>

      {/* Legend */}
      <div className="p-4 border-b border-[#30363d]">
        <h2 className="text-xs font-medium text-[#8b949e] uppercase mb-3">
          Vessel Status
        </h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#3fb950]" />
            <span className="text-[#c9d1d9]">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#d29922]" />
            <span className="text-[#c9d1d9]">Idle</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#f85149]" />
            <span className="text-[#c9d1d9]">Shadow Fleet</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#a371f7]" />
            <span className="text-[#c9d1d9]">Anchored</span>
          </div>
        </div>
      </div>

      {/* Vessel List */}
      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="text-xs font-medium text-[#8b949e] uppercase mb-3">
          Vessels ({vessels.length})
        </h2>
        {vessels.length === 0 ? (
          <p className="text-sm text-[#6e7681]">Loading vessels...</p>
        ) : (
          <div className="space-y-2">
            {vessels.map((v) => (
              <button
                key={v.MMSI}
                onClick={() => onVesselClick?.(v)}
                className="w-full text-left p-2 rounded hover:bg-[#21262d] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: v.isShadowFleet ? "#f85149" : "#3fb950",
                    }}
                  />
                  <span className="text-sm text-[#c9d1d9] truncate">
                    {v.NAME || "Unknown"}
                  </span>
                </div>
                <div className="text-xs text-[#6e7681] mt-1 pl-4">
                  {v.SOG ?? 0} kn · {v.MMSI}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
