 /**
 * Algorithm tuning panel for adjusting shadow fleet scoring weights.
 * Provides sliders to modify model parameters in real-time.
 * @module components/AlgorithmPanel
 */

"use client";

import { useState, useEffect } from "react";
import {
  type ModelWeights,
  DEFAULT_WEIGHTS,
  getModelWeights,
  setModelWeights,
  resetModelWeights,
} from "./lib/shadow-score";

/** Weight parameter configuration */
const WEIGHT_CONFIG: {
  key: keyof ModelWeights;
  label: string;
  min: number;
  max: number;
  step: number;
  description: string;
}[] = [
  {
    key: "intercept",
    label: "Base Bias",
    min: -8,
    max: 2,
    step: 0.5,
    description: "Starting point before features (lower = stricter)",
  },
  {
    key: "flag_risk_score",
    label: "Flag State",
    min: 0,
    max: 3,
    step: 0.1,
    description: "Weight for flag of convenience risk",
  },
  {
    key: "vessel_age_years",
    label: "Vessel Age",
    min: 0,
    max: 0.2,
    step: 0.01,
    description: "Weight per year of vessel age",
  },
  {
    key: "cargo_risk_score",
    label: "Cargo Type",
    min: 0,
    max: 2,
    step: 0.1,
    description: "Weight for cargo/vessel type risk",
  },
  {
    key: "ais_risk_score",
    label: "AIS Behavior",
    min: 0,
    max: 3,
    step: 0.1,
    description: "Weight for suspicious AIS patterns",
  },
  {
    key: "ownership_risk_score",
    label: "Ownership",
    min: 0,
    max: 2,
    step: 0.1,
    description: "Weight for ownership opacity",
  },
  {
    key: "insurance_risk_score",
    label: "Insurance",
    min: 0,
    max: 2,
    step: 0.1,
    description: "Weight for insurance coverage risk",
  },
  {
    key: "sts_indicator",
    label: "STS Transfer",
    min: 0,
    max: 3,
    step: 0.1,
    description: "Weight for ship-to-ship transfer detection",
  },
  {
    key: "origin_risk_score",
    label: "Origin Port",
    min: 0,
    max: 2,
    step: 0.1,
    description: "Weight for high-risk origin ports",
  },
  {
    key: "destination_risk_score",
    label: "Destination",
    min: 0,
    max: 2,
    step: 0.1,
    description: "Weight for high-risk destinations",
  },
  {
    key: "route_risk_score",
    label: "Route Pattern",
    min: 0,
    max: 2,
    step: 0.1,
    description: "Weight for suspicious route patterns",
  },
];

/**
 * Panel for tuning shadow fleet algorithm weights.
 * @param onWeightsChange - Callback fired when weights are modified
 * @param onClose - Callback when panel is closed
 */
export default function AlgorithmPanel({
  onWeightsChange,
  onClose,
}: {
  onWeightsChange?: () => void;
  onClose: () => void;
}) {
  const [weights, setWeights] = useState<ModelWeights>(getModelWeights);

  useEffect(() => {
    setModelWeights(weights);
    onWeightsChange?.();
  }, [weights, onWeightsChange]);

  const handleReset = () => {
    resetModelWeights();
    setWeights({ ...DEFAULT_WEIGHTS });
  };

  const handleWeightChange = (key: keyof ModelWeights, value: number) => {
    setWeights((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="absolute top-4 right-4 bottom-4 w-80 bg-panel-bg backdrop-blur-md border border-panel-border rounded-xl z-10 overflow-hidden flex flex-col animate-[panel-pop_0.15s_ease-out]">
      <div className="p-4 border-b border-panel-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Algorithm Tuning
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Adjust model weights
            </p>
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
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {WEIGHT_CONFIG.map(({ key, label, min, max, step, description }) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-map-text">{label}</label>
              <span className="text-xs font-mono text-muted-foreground">
                {weights[key].toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={weights[key]}
              onChange={(e) =>
                handleWeightChange(key, parseFloat(e.target.value))
              }
              className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-panel-border space-y-2">
        <button
          onClick={handleReset}
          className="w-full py-2 px-3 bg-muted hover:bg-panel-hover text-map-text text-sm font-medium rounded transition-colors"
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}
