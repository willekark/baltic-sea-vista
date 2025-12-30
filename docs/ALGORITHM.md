# Shadow Fleet Detection Algorithm

## Overview

The codebase implements a **logistic regression-based scoring system** for detecting shadow fleet vessels in the Baltic Sea.

## Core Model

**Implementation:** `app/lib/shadow-score.ts`

The algorithm computes shadow fleet probability using the sigmoid function:

```
P = 1 / (1 + e^(-z))
```

Where `z = β₀ + Σ(βᵢ × xᵢ)` for i = 1 to 10.

## Feature Vector (10 features)

| Feature | Description | Source |
|---------|-------------|--------|
| `vessel_age_years` | Estimated vessel age | MMSI heuristic |
| `flag_risk_score` | Flag of convenience risk (0-1) | Flag classification |
| `ais_risk_score` | Suspicious AIS behavior | Stationary analysis |
| `ownership_risk_score` | Ownership opacity | Flag-based proxy |
| `insurance_risk_score` | P&I coverage risk | Flag-based proxy |
| `cargo_risk_score` | Vessel type risk | Type classification |
| `sts_indicator` | Ship-to-ship transfer (0/1) | Location + status |
| `origin_risk_score` | Origin port risk | Placeholder (0.5) |
| `destination_risk_score` | Destination risk | Placeholder (0.5) |
| `route_risk_score` | Route pattern risk | Placeholder (0.5) |

## Default Model Weights

```typescript
intercept: -4.0
vessel_age_years: 0.05
origin_risk_score: 0.8
destination_risk_score: 0.7
route_risk_score: 0.6
flag_risk_score: 1.5
ais_risk_score: 1.2
ownership_risk_score: 0.8
insurance_risk_score: 0.9
cargo_risk_score: 0.5
sts_indicator: 1.0
```

## Flag Classification

### High Risk Flags
Cameroon (CM), Gabon (GA), Togo (TG), Equatorial Guinea (GQ), Palau (PW), Comoros (KM), Vanuatu (VU), Belize (BZ)

### Flags of Convenience
Panama (PA), Liberia (LR), Marshall Islands (MH), Hong Kong (HK), Singapore (SG), Malta (MT), Bahamas (BS), Cyprus (CY), Isle of Man (IM), Cayman Islands (KY)

### Low Risk Flags
EU/Nordic states, US, Canada, Japan, South Korea, Australia

## STS Transfer Detection

Vessels flagged for potential ship-to-ship transfers when:
- Type contains "tanker"
- Speed < 1.0 knots
- Located in Baltic region (lat 54-60°, lon 10-25°)
- Navigation status is NOT anchored (1) or moored (5)

## Output Classification

| Score | Color | Risk Level |
|-------|-------|------------|
| ≥ 90 | RED | High |
| 50-89 | YELLOW | Medium |
| < 50 | GREEN | Low |

## UI Integration

`app/algorithm-panel.tsx` provides real-time weight adjustment via sliders, enabling researchers to tune all 11 coefficients and observe scoring changes live.

## Current Limitations

1. **Port risk scores** - Hardcoded to 0.5 (requires port database)
2. **Vessel age** - Estimated via MMSI hash, not IMO registry
3. **AIS analysis** - Simplified; no historical trajectory gap detection
4. **Ownership/Insurance** - Uses flag as proxy, not actual registry data
