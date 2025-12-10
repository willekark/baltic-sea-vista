## Shadow Fleet Probability Algorithm – Pseudocode and JSON Schemas

1. Pseudocode – High-level prediction pipeline

---

Function: predictShadowFleetRisk(vessel)

Input: vessel (raw vessel data)
Output: prediction object with probability, score, color

Pseudocode:

function predictShadowFleetRisk(vessel):
// 1. Extract features (convert raw data to numeric feature vector x)
features = extractFeatures(vessel) // returns object with x1..x10

```
// 2. Convert feature object to ordered array x[1..10]
x = [
    features.vessel_age_years,       // x1
    features.origin_risk_score,      // x2
    features.destination_risk_score, // x3
    features.route_risk_score,       // x4
    features.flag_risk_score,        // x5
    features.ais_risk_score,         // x6
    features.ownership_risk_score,   // x7
    features.insurance_risk_score,   // x8
    features.cargo_risk_score,       // x9
    features.sts_indicator           // x10
]

// 3. Load model coefficients (B0..B10)
model = loadLogisticModel()  // contains intercept and weights[1..10]

// 4. Compute linear term z
z = model.intercept
for i from 1 to 10:
    z = z + model.weights[i] * x[i]

// 5. Apply sigmoid to get probability
P = 1.0 / (1.0 + exp(-z))

// 6. Convert probability to 0–100 score
S_raw = 100.0 * P
S = clamp(S_raw, 0.0, 100.0)

// 7. Determine UI color based on S
if S >= 90.0:
    color = "RED"
else if S >= 50.0:
    color = "YELLOW"
else:
    color = "GREEN"

// 8. Return prediction object
return {
    "probability": P,
    "score": S,
    "color": color,
    "features": features
}
```

Helper: clamp(a, minValue, maxValue)

function clamp(a, minValue, maxValue):
if a < minValue:
return minValue
if a > maxValue:
return maxValue
return a

---

2. Pseudocode – Feature extraction and risk encoding

---

Function: extractFeatures(vessel)

Goal: map raw vessel attributes into normalized features x1..x10.

Assume the risk classes 1, 2, 3 are encoded numerically as:
class 1 (high) → 1.0
class 2 (medium) → 0.5
class 3 (low) → 0.0

You can adjust these scales as needed.

Pseudocode:

function extractFeatures(vessel):
features = {}

```
// x1: vessel age in years (continuous)
features.vessel_age_years = computeVesselAge(vessel.build_year, current_year)

// x2: origin risk score (0, 0.5, 1.0)
origin_class = classifyOrigin(vessel.origin_port, vessel.origin_country)
features.origin_risk_score = classToScore(origin_class)

// x3: destination risk score (0, 0.5, 1.0)
destination_class = classifyDestination(vessel.destination_port, vessel.destination_country)
features.destination_risk_score = classToScore(destination_class)

// x4: route risk score (0, 0.5, 1.0)
route_class = classifyRoute(vessel.route_identifier)
features.route_risk_score = classToScore(route_class)

// x5: flag state risk score (0, 0.5, 1.0)
flag_class = classifyFlag(vessel.flag_state, vessel.reflagging_history)
features.flag_risk_score = classToScore(flag_class)

// x6: AIS behavior risk score (0, 0.5, 1.0)
ais_class = classifyAISBehavior(vessel.ais_history)
features.ais_risk_score = classToScore(ais_class)

// x7: ownership opacity risk score (0, 0.5, 1.0)
ownership_class = classifyOwnership(vessel.ownership_structure)
features.ownership_risk_score = classToScore(ownership_class)

// x8: insurance risk score (0, 0.5, 1.0)
insurance_class = classifyInsurance(vessel.insurance_data)
features.insurance_risk_score = classToScore(insurance_class)

// x9: cargo type risk score (0, 0.5, 1.0)
cargo_class = classifyCargo(vessel.cargo_type)
features.cargo_risk_score = classToScore(cargo_class)

// x10: STS transfer indicator (0 or 1)
sts_indicator = detectSTS(vessel.sts_events)
if sts_indicator == true:
    features.sts_indicator = 1
else:
    features.sts_indicator = 0

return features
```

Helper: classToScore

function classToScore(risk_class):
if risk_class == 1:
return 1.0
if risk_class == 2:
return 0.5
if risk_class == 3:
return 0.0
// default fallback
return 0.0

Example classification rules (simplified, you’ll implement real logic):

function classifyOrigin(origin_port, origin_country):
if origin_port in HIGH_RISK_PORTS or origin_country in HIGH_RISK_COUNTRIES:
return 1 // class 1
// optionally more nuanced logic
return 3 // class 3 by default

function classifyDestination(destination_port, destination_country):
if destination_country in MAJOR_REFINERY_COUNTRIES:
return 1
return 3

function classifyRoute(route_identifier):
if route_identifier in KNOWN_SHADOW_CORRIDORS:
return 1
if route_identifier in SUSPECT_ROUTES:
return 2
return 3

function classifyFlag(flag_state, reflagging_history):
if flag_state in FLAG_OF_CONVENIENCE_LIST:
return 1
if reflagging_history shows recent reflag from sanctioned country:
return 1
return 3

function classifyAISBehavior(ais_history):
if hasFrequentDarkPeriods(ais_history) or hasSpoofingPatterns(ais_history):
return 1
if hasOccasionalAnomalies(ais_history):
return 2
return 3

function classifyOwnership(ownership_structure):
if isOpaqueStructure(ownership_structure):
return 1
if isPartiallyOpaque(ownership_structure):
return 2
return 3

function classifyInsurance(insurance_data):
if isSanctionedInsurer(insurance_data) or hasNoPICoverage(insurance_data):
return 1
if isNonStandardCoverage(insurance_data):
return 2
return 3

function classifyCargo(cargo_type):
if cargo_type in ["crude_oil", "crude", "crude_and_products"]:
return 1
if cargo_type in ["refined_products", "fuel_oil"]:
return 2
return 3

function detectSTS(sts_events):
// returns true if any suspicious open-water STS transfers detected
for event in sts_events:
if event.location in HIGH_RISK_STS_AREAS and event.is_open_water == true:
return true
return false

---

3. Pseudocode – Sorting vessels by risk

---

Given a list of vessels, you want them sorted from highest-risk to lowest-risk.

function sortVesselsByRisk(vessels):
predictions = []

```
for vessel in vessels:
    prediction = predictShadowFleetRisk(vessel)
    predictions.append({
        "vessel": vessel,
        "score": prediction.score,
        "probability": prediction.probability,
        "color": prediction.color
    })

// sort descending by score
sort(predictions, key = "score", order = "DESC")

return predictions
```

---

4. JSON Schema – Logistic regression model

---

This JSON structure describes the logistic regression model parameters.

Example model JSON:

{
"model_type": "logistic_regression",
"version": "1.0.0",
"intercept": -2.5,
"weights": {
"vessel_age_years": 0.08, // B1
"origin_risk_score": 1.2, // B2
"destination_risk_score": 1.1, // B3
"route_risk_score": 0.9, // B4
"flag_risk_score": 1.3, // B5
"ais_risk_score": 1.5, // B6
"ownership_risk_score": 1.0, // B7
"insurance_risk_score": 1.1, // B8
"cargo_risk_score": 0.7, // B9
"sts_indicator": 0.9 // B10
},
"metadata": {
"trained_on": "2025-01-15",
"training_data_version": "shadowfleet_dataset_v3",
"notes": "Model trained on labeled shadow vs non-shadow tankers."
}
}

Notes:

- The keys in "weights" must match the feature names used in extractFeatures.
- The order in code can be derived from a fixed list, e.g. ["vessel_age_years", "origin_risk_score", ...].

---

5. JSON Schema – Vessel input

---

This JSON structure represents the raw vessel data as ingested by the system (before feature encoding).

Example vessel JSON (simplified):

{
"vessel_id": "IMO1234567",
"name": "VOLGA CRUDE",
"build_year": 2003,
"flag_state": "Gabon",
"reflagging_history": [
{ "flag": "Russia", "from": "2010-01-01", "to": "2023-03-01" },
{ "flag": "Gabon", "from": "2023-03-01", "to": null }
],
"origin_port": "St. Petersburg",
"origin_country": "Russia",
"destination_port": "Sikka",
"destination_country": "India",
"route_identifier": "RUSSIA_BLACKSEA_TO_INDIA_ARABIAN",
"ais_history": [
// AIS messages, gaps, etc (implementation specific)
],
"ownership_structure": {
"registered_owner": "Volga Shipping Ltd",
"beneficial_owner": "Unknown",
"domicile_country": "UAE",
"intermediary_entities": [
"Offshore Holdings FZE"
]
},
"insurance_data": {
"pi_club": null,
"insurer_name": "Unknown Insurer",
"is_ig_member": false
},
"cargo_type": "crude_oil",
"sts_events": [
{
"timestamp": "2025-02-10T12:00:00Z",
"location": "Off Kalamata",
"is_open_water": true,
"counterparty_vessel_id": "IMO2345678"
}
]
}

---

6. JSON Schema – Feature vector

---

This JSON is the intermediate result from extractFeatures(vessel).

Example features JSON:

{
"vessel_id": "IMO1234567",
"vessel_age_years": 22.0, // x1
"origin_risk_score": 1.0, // x2
"destination_risk_score": 1.0, // x3
"route_risk_score": 1.0, // x4
"flag_risk_score": 1.0, // x5
"ais_risk_score": 1.0, // x6
"ownership_risk_score": 1.0, // x7
"insurance_risk_score": 1.0, // x8
"cargo_risk_score": 1.0, // x9
"sts_indicator": 1 // x10
}

---

7. JSON Schema – Prediction output

---

This JSON structure is what your API or internal services can return as the final prediction.

Example prediction JSON:

{
"vessel_id": "IMO1234567",
"model_version": "1.0.0",
"probability_shadow_fleet": 0.998, // P in [0,1]
"score": 99.8, // S in [0,100]
"color": "RED", // "RED", "YELLOW", or "GREEN"
"features": {
"vessel_age_years": 22.0,
"origin_risk_score": 1.0,
"destination_risk_score": 1.0,
"route_risk_score": 1.0,
"flag_risk_score": 1.0,
"ais_risk_score": 1.0,
"ownership_risk_score": 1.0,
"insurance_risk_score": 1.0,
"cargo_risk_score": 1.0,
"sts_indicator": 1
},
"debug": {
"z_value": 6.10, // optional: linear score
"intercept": -2.5,
"weights": {
"vessel_age_years": 0.08,
"origin_risk_score": 1.2,
"destination_risk_score": 1.1,
"route_risk_score": 0.9,
"flag_risk_score": 1.3,
"ais_risk_score": 1.5,
"ownership_risk_score": 1.0,
"insurance_risk_score": 1.1,
"cargo_risk_score": 0.7,
"sts_indicator": 0.9
}
}
}

You can omit the "debug" block in production, but it is very useful for QA and model validation.

---

8. Summary

---

- Logistic regression provides the probability layer: P(shadow fleet | x).
- Feature extraction transforms raw vessel data into normalized numeric features.
- Risk classes (1/2/3) are used as an interpretable business layer that gets mapped to numeric 0–1 scores.
- The final 0–100 score is just 100 \* P, used for color coding and sorting.

If you’d like, next I can help you turn this into concrete code in a specific language (e.g., Python, TypeScript, or Go) using these JSON structures.
