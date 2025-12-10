/**
 * Vessel detail panel component.
 * Displays detailed information about a selected vessel.
 * @module components/VesselPanel
 */

import { type Vessel, getVesselColor } from "./lib/vessel";

/**
 * Floating panel showing vessel details with close button.
 * @param vessel - The vessel to display details for
 * @param onClose - Callback when panel is closed
 */
export default function VesselPanel({
  vessel,
  onClose,
}: {
  vessel: Vessel;
  onClose: () => void;
}) {
  return (
    <div className="absolute top-1/2 -translate-y-1/2 right-4 w-80 bg-panel-bg backdrop-blur-md border border-panel-border rounded-xl z-10 overflow-hidden">
      <div className="p-4 border-b border-panel-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ background: getVesselColor(vessel) }}
          />
          <h2 className="text-lg font-semibold text-foreground truncate">
            {vessel.NAME || "Unknown Vessel"}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground p-1"
          aria-label="Close panel"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="p-4 border-b border-panel-border">
        <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center">
          <span className="text-muted-foreground text-sm">Vessel Photo</span>
        </div>
      </div>

      <div className="p-4 border-b border-panel-border">
        <p className="text-sm text-map-text">
          {vessel.isShadowFleet
            ? "This vessel has been flagged as part of the shadow fleet operating in the Baltic Sea region."
            : "Commercial vessel operating in the Baltic Sea region."}
        </p>
      </div>

      <div className="p-4">
        <h3 className="text-xs font-medium text-muted-foreground uppercase mb-3">
          Details
        </h3>
        <dl className="space-y-2 text-sm">
          {[
            ["MMSI", vessel.MMSI],
            ["Speed", `${vessel.SOG ?? 0} kn`],
            ["Heading", vessel.HEADING != null ? `${vessel.HEADING}°` : "N/A"],
            [
              "Position",
              `${vessel.LATITUDE.toFixed(4)}, ${vessel.LONGITUDE.toFixed(4)}`,
            ],
            ["Type", vessel.TYPE ?? "Unknown"],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="text-map-text">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
