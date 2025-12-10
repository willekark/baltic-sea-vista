// Vessel marker utilities for maritime tracking
// Uses CSS variables from globals.css

export type VesselStatus = "active" | "idle" | "shadow" | "anchored";

export const vesselColors: Record<
  VesselStatus,
  { fill: string; glow: string }
> = {
  active: { fill: "#3fb950", glow: "#238636" },
  idle: { fill: "#d29922", glow: "#9e6a03" },
  shadow: { fill: "#f85149", glow: "#b62324" },
  anchored: { fill: "#a371f7", glow: "#8957e5" },
};

// Creates a triangle SVG marker pointing in vessel direction
export function createVesselMarker(
  status: VesselStatus,
  heading: number = 0
): HTMLElement {
  const { fill, glow } = vesselColors[status];

  const el = document.createElement("div");
  el.className = "vessel-marker";
  el.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" style="transform: rotate(${heading}deg); filter: drop-shadow(0 0 4px ${glow});">
      <polygon 
        points="12,2 20,20 12,16 4,20" 
        fill="${fill}" 
        stroke="${glow}" 
        stroke-width="1"
      />
    </svg>
  `;

  el.style.cssText = `
    cursor: pointer;
    transition: transform 0.2s ease;
  `;

  return el;
}

// Creates a diamond marker for stationary vessels
export function createStationaryMarker(status: VesselStatus): HTMLElement {
  const { fill, glow } = vesselColors[status];

  const el = document.createElement("div");
  el.className = "vessel-marker stationary";
  el.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 16 16" style="filter: drop-shadow(0 0 3px ${glow});">
      <polygon 
        points="8,1 15,8 8,15 1,8" 
        fill="${fill}" 
        stroke="${glow}" 
        stroke-width="1"
      />
    </svg>
  `;

  el.style.cssText = `
    cursor: pointer;
    transition: transform 0.2s ease;
  `;

  return el;
}

// Determine vessel status based on data
export function getVesselStatus(vessel: {
  SOG?: number;
  NAVSTAT?: number;
  isShadowFleet?: boolean;
}): VesselStatus {
  if (vessel.isShadowFleet) return "shadow";
  if (vessel.NAVSTAT === 1 || vessel.NAVSTAT === 5) return "anchored"; // At anchor or moored
  if ((vessel.SOG ?? 0) < 0.5) return "idle";
  return "active";
}

// CSS for vessel markers (inject into page)
export const vesselMarkerStyles = `
  .vessel-marker:hover {
    transform: scale(1.2);
    z-index: 10;
  }
  
  .vessel-marker.selected svg {
    filter: drop-shadow(0 0 8px #58a6ff) !important;
  }
  
  .vessel-marker.selected svg polygon {
    stroke: #58a6ff;
    stroke-width: 2;
  }
  
  .mapboxgl-popup-content {
    background: rgba(22, 27, 34, 0.95) !important;
    color: #c9d1d9 !important;
    border: 1px solid #30363d !important;
    border-radius: 8px !important;
    padding: 12px 16px !important;
    font-family: system-ui, -apple-system, sans-serif !important;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4) !important;
  }
  
  .mapboxgl-popup-tip {
    border-top-color: rgba(22, 27, 34, 0.95) !important;
  }
  
  .mapboxgl-popup-close-button {
    color: #8b949e !important;
    font-size: 18px !important;
    padding: 4px 8px !important;
  }
  
  .mapboxgl-popup-close-button:hover {
    color: #c9d1d9 !important;
    background: transparent !important;
  }
  
  .mapboxgl-ctrl-group {
    background: rgba(22, 27, 34, 0.95) !important;
    border: 1px solid #30363d !important;
    border-radius: 8px !important;
  }
  
  .mapboxgl-ctrl-group button {
    border-color: #30363d !important;
  }
  
  .mapboxgl-ctrl-group button:hover {
    background-color: #21262d !important;
  }
  
  .mapboxgl-ctrl-group button span {
    filter: invert(1) !important;
  }
`;
