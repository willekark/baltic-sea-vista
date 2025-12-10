/**
 * Vessel detail panel component.
 * Displays detailed information about a selected vessel.
 * @module components/VesselPanel
 */

import { type Vessel, getFlagEmoji } from "./lib/vessel";
import { predictShadowFleetRisk, getVesselRiskColor } from "./lib/shadow-score";

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
  const prediction = predictShadowFleetRisk(vessel);
  const riskColor = getVesselRiskColor(vessel);

  return (
    <div
      key={vessel.MMSI}
      className="w-96 h-fit max-h-full bg-panel-bg backdrop-blur-md border border-panel-border rounded-xl overflow-hidden animate-[panel-slide-in_0.2s_ease-out]"
    >
      <div className="p-4 border-b border-panel-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground truncate">
              {vessel.NAME || "Unknown Vessel"}
            </h2>
            <span className="text-xl" title={vessel.COUNTRY || "Unknown"}>
              {getFlagEmoji(vessel.FLAG)}
            </span>
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
        <p className="text-sm text-muted-foreground mt-1">
          {vessel.TYPE || "Vessel"} · {vessel.COUNTRY || "Unknown Flag"}
        </p>
      </div>

      <div className="p-4 border-b border-panel-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Shadow Fleet Risk
          </span>
          <span className="text-lg font-bold" style={{ color: riskColor }}>
            {prediction.score.toFixed(0)}%
          </span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full transition-all"
            style={{
              width: `${prediction.score}%`,
              backgroundColor: riskColor,
            }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {prediction.color === "RED"
            ? "High probability of shadow fleet vessel"
            : prediction.color === "YELLOW"
            ? "Medium risk - requires further investigation"
            : "Low risk - likely legitimate vessel"}
        </p>
      </div>

      <div className="p-4 border-b border-panel-border">
        <h3 className="text-xs font-medium text-muted-foreground uppercase mb-3">
          Risk Factors
        </h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            ["Flag State", prediction.features.flag_risk_score],
            [
              "Vessel Age",
              Math.min(prediction.features.vessel_age_years / 30, 1),
            ],
            ["Cargo Type", prediction.features.cargo_risk_score],
            ["AIS Behavior", prediction.features.ais_risk_score],
            ["Ownership", prediction.features.ownership_risk_score],
            ["Insurance", prediction.features.insurance_risk_score],
          ].map(([label, score]) => (
            <div key={label} className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full"
                  style={{
                    width: `${(score as number) * 100}%`,
                    backgroundColor:
                      (score as number) >= 0.7
                        ? "#ef4444"
                        : (score as number) >= 0.4
                        ? "#eab308"
                        : "#22c55e",
                  }}
                />
              </div>
              <span className="text-muted-foreground w-16 truncate">
                {label}
              </span>
            </div>
          ))}
        </div>
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
