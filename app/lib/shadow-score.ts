/**
 * Shadow fleet probability scoring using logistic regression.
 * @module lib/shadow-score
 */

import type { Vessel } from "./vessel";

/** Risk class levels */
type RiskClass = 1 | 2 | 3;

/** Feature vector for logistic regression model */
export interface FeatureVector {
  vessel_age_years: number;
  origin_risk_score: number;
  destination_risk_score: number;
  route_risk_score: number;
  flag_risk_score: number;
  ais_risk_score: number;
  ownership_risk_score: number;
  insurance_risk_score: number;
  cargo_risk_score: number;
  sts_indicator: number;
}

/** Prediction output from the model */
export interface ShadowFleetPrediction {
  probability: number;
  score: number;
  color: "RED" | "YELLOW" | "GREEN";
  features: FeatureVector;
}

/** Logistic regression model coefficients */
const MODEL = {
  intercept: -2.5,
  weights: {
    vessel_age_years: 0.08,
    origin_risk_score: 1.2,
    destination_risk_score: 1.1,
    route_risk_score: 0.9,
    flag_risk_score: 1.3,
    ais_risk_score: 1.5,
    ownership_risk_score: 1.0,
    insurance_risk_score: 1.1,
    cargo_risk_score: 0.7,
    sts_indicator: 0.9,
  },
} as const;

/** Flags of convenience - high risk flag states */
const FLAG_OF_CONVENIENCE = new Set([
  "PA", // Panama
  "LR", // Liberia
  "MH", // Marshall Islands
  "HK", // Hong Kong
  "SG", // Singapore (when used for opacity)
  "MT", // Malta
  "BS", // Bahamas
  "CY", // Cyprus
  "IM", // Isle of Man
  "KY", // Cayman Islands
  "VU", // Vanuatu
  "BZ", // Belize
  "CM", // Cameroon
  "GA", // Gabon
  "TG", // Togo
  "GQ", // Equatorial Guinea
  "PW", // Palau
  "KM", // Comoros
]);

/** High-risk flags often associated with shadow fleet */
const HIGH_RISK_FLAGS = new Set([
  "CM", // Cameroon
  "GA", // Gabon
  "TG", // Togo
  "GQ", // Equatorial Guinea
  "PW", // Palau
  "KM", // Comoros
  "VU", // Vanuatu
  "BZ", // Belize
]);

/** Low-risk EU/Nordic flags */
const LOW_RISK_FLAGS = new Set([
  "SE", // Sweden
  "FI", // Finland
  "DK", // Denmark
  "NO", // Norway
  "DE", // Germany
  "NL", // Netherlands
  "GB", // United Kingdom
  "FR", // France
  "EE", // Estonia
  "LV", // Latvia
  "LT", // Lithuania
  "PL", // Poland
  "BE", // Belgium
  "IT", // Italy
  "ES", // Spain
  "PT", // Portugal
  "GR", // Greece
  "US", // United States
  "CA", // Canada
  "JP", // Japan
  "KR", // South Korea
  "AU", // Australia
]);

/** Convert risk class (1=high, 2=medium, 3=low) to numeric score */
const classToScore = (riskClass: RiskClass): number => {
  if (riskClass === 1) return 1.0;
  if (riskClass === 2) return 0.5;
  return 0.0;
};

/** Clamp value between min and max */
const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

/** Classify flag state risk based on flag of convenience lists */
const classifyFlag = (flag?: string): RiskClass => {
  if (!flag) return 2;
  if (HIGH_RISK_FLAGS.has(flag)) return 1;
  if (LOW_RISK_FLAGS.has(flag)) return 3;
  if (FLAG_OF_CONVENIENCE.has(flag)) return 2;
  return 2; // Unknown flags are medium risk
};

/** Classify cargo type risk based on vessel type */
const classifyCargo = (type?: string): RiskClass => {
  if (!type) return 2;
  const t = type.toLowerCase();
  if (t.includes("tanker")) return 1; // Tankers carry oil - high risk
  if (t.includes("cargo")) return 2;
  return 3;
};

/** Estimate vessel age from MMSI (simplified heuristic) */
const estimateVesselAge = (mmsi: number): number => {
  // In reality this would come from IMO database
  // Using MMSI pattern as rough proxy: older vessels tend to have certain MID codes
  // For mock purposes, use a deterministic formula based on MMSI
  const hash = mmsi % 30;
  return hash + 5; // Returns 5-34 years
};

/** Classify AIS behavior risk (simplified - would use history in production) */
const classifyAIS = (vessel: Vessel): RiskClass => {
  // In production: analyze AIS gaps, spoofing patterns
  // For now: stationary tankers in open water are suspicious
  if (vessel.TYPE?.toLowerCase().includes("tanker")) {
    if (vessel.SOG < 0.5 && vessel.NAVSTAT !== 5 && vessel.NAVSTAT !== 1) {
      // Tanker stationary but not at anchor or moored - suspicious
      return 1;
    }
  }
  return 3;
};

/** Classify ownership opacity (simplified - flag-based proxy) */
const classifyOwnership = (flag?: string): RiskClass => {
  // High-risk flags often correlate with opaque ownership structures
  if (!flag) return 2;
  if (HIGH_RISK_FLAGS.has(flag)) return 1;
  if (LOW_RISK_FLAGS.has(flag)) return 3;
  return 2;
};

/** Classify insurance risk (simplified - flag-based proxy) */
const classifyInsurance = (flag?: string): RiskClass => {
  // Vessels with high-risk flags often lack proper P&I coverage
  if (!flag) return 2;
  if (HIGH_RISK_FLAGS.has(flag)) return 1;
  if (LOW_RISK_FLAGS.has(flag)) return 3;
  return 2;
};

/** Detect STS transfer risk (simplified - location-based) */
const detectSTS = (vessel: Vessel): boolean => {
  // Known STS transfer areas in Baltic approaches
  // Kalamata, Ceuta, off-shore Denmark Strait
  const lat = vessel.LATITUDE;
  const lon = vessel.LONGITUDE;

  // Simplified: stationary tankers in open water might be doing STS
  if (vessel.TYPE?.toLowerCase().includes("tanker") && vessel.SOG < 1.0) {
    // Check if in known STS hotspots (simplified bounding boxes)
    // Baltic STS area
    if (lat > 54 && lat < 60 && lon > 10 && lon < 25) {
      return vessel.NAVSTAT !== 5 && vessel.NAVSTAT !== 1; // Not at anchor/moored
    }
  }
  return false;
};

/**
 * Extract feature vector from vessel data.
 * Maps raw vessel attributes to normalized features x1..x10.
 */
export const extractFeatures = (vessel: Vessel): FeatureVector => {
  return {
    vessel_age_years: estimateVesselAge(vessel.MMSI),
    origin_risk_score: 0.5, // Would need port data - default medium
    destination_risk_score: 0.5, // Would need port data - default medium
    route_risk_score: 0.5, // Would need route analysis - default medium
    flag_risk_score: classToScore(classifyFlag(vessel.FLAG)),
    ais_risk_score: classToScore(classifyAIS(vessel)),
    ownership_risk_score: classToScore(classifyOwnership(vessel.FLAG)),
    insurance_risk_score: classToScore(classifyInsurance(vessel.FLAG)),
    cargo_risk_score: classToScore(classifyCargo(vessel.TYPE)),
    sts_indicator: detectSTS(vessel) ? 1 : 0,
  };
};

/**
 * Predict shadow fleet probability using logistic regression.
 * Returns probability (0-1), score (0-100), and color classification.
 */
export const predictShadowFleetRisk = (
  vessel: Vessel
): ShadowFleetPrediction => {
  const features = extractFeatures(vessel);

  // Compute linear term z = B0 + sum(Bi * xi)
  let z = MODEL.intercept;
  z += MODEL.weights.vessel_age_years * features.vessel_age_years;
  z += MODEL.weights.origin_risk_score * features.origin_risk_score;
  z += MODEL.weights.destination_risk_score * features.destination_risk_score;
  z += MODEL.weights.route_risk_score * features.route_risk_score;
  z += MODEL.weights.flag_risk_score * features.flag_risk_score;
  z += MODEL.weights.ais_risk_score * features.ais_risk_score;
  z += MODEL.weights.ownership_risk_score * features.ownership_risk_score;
  z += MODEL.weights.insurance_risk_score * features.insurance_risk_score;
  z += MODEL.weights.cargo_risk_score * features.cargo_risk_score;
  z += MODEL.weights.sts_indicator * features.sts_indicator;

  // Apply sigmoid: P = 1 / (1 + e^(-z))
  const probability = 1.0 / (1.0 + Math.exp(-z));

  // Convert to 0-100 score
  const score = clamp(100.0 * probability, 0, 100);

  // Determine color based on score thresholds
  let color: "RED" | "YELLOW" | "GREEN";
  if (score >= 90) {
    color = "RED";
  } else if (score >= 50) {
    color = "YELLOW";
  } else {
    color = "GREEN";
  }

  return { probability, score, color, features };
};

/**
 * Sort vessels by shadow fleet risk score (descending).
 * Returns vessels with their predictions attached.
 */
export const sortVesselsByRisk = (
  vessels: Vessel[]
): Array<{ vessel: Vessel; prediction: ShadowFleetPrediction }> => {
  return vessels
    .map((vessel) => ({
      vessel,
      prediction: predictShadowFleetRisk(vessel),
    }))
    .sort((a, b) => b.prediction.score - a.prediction.score);
};

/**
 * Get color for vessel marker based on shadow fleet score.
 * RED: >= 90%, YELLOW: 50-90%, GREEN: < 50%
 */
export const getVesselRiskColor = (vessel: Vessel): string => {
  const { color } = predictShadowFleetRisk(vessel);
  switch (color) {
    case "RED":
      return "#ef4444"; // Tailwind red-500
    case "YELLOW":
      return "#eab308"; // Tailwind yellow-500
    case "GREEN":
      return "#22c55e"; // Tailwind green-500
  }
};
