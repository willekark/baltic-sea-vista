/**
 * Filter panel component for vessel query customization.
 * Provides dropdowns for vessel type, navigation status, and radius.
 * @module components/FilterPanel
 */

"use client";

import { type VesselFilter, VESSEL_TYPES, NAV_STATUS } from "./lib/vessel";

/**
 * Filter panel with vessel type, nav status, and radius controls.
 * @param filter - Current filter values
 * @param onChange - Callback when any filter value changes
 */
export default function FilterPanel({
  filter,
  onChange,
}: {
  filter: VesselFilter;
  onChange: (f: VesselFilter) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-muted-foreground mb-1">
          Vessel Type
        </label>
        <select
          value={filter.type || ""}
          onChange={(e) =>
            onChange({ ...filter, type: e.target.value || undefined })
          }
          className="w-full bg-muted border border-panel-border rounded px-2 py-1.5 text-sm text-foreground"
        >
          <option value="">All Types</option>
          {VESSEL_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs text-muted-foreground mb-1">
          Navigation Status
        </label>
        <select
          value={filter.navStatus ?? ""}
          onChange={(e) =>
            onChange({
              ...filter,
              navStatus: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          className="w-full bg-muted border border-panel-border rounded px-2 py-1.5 text-sm text-foreground"
        >
          <option value="">All Statuses</option>
          {NAV_STATUS.map((s) => (
            <option key={s.code} value={s.code}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs text-muted-foreground mb-1">
          Radius (NM): {filter.radius || 50}
        </label>
        <input
          type="range"
          min="5"
          max="50"
          step="5"
          value={filter.radius || 50}
          onChange={(e) =>
            onChange({ ...filter, radius: Number(e.target.value) })
          }
          className="w-full accent-primary"
        />
      </div>
    </div>
  );
}
