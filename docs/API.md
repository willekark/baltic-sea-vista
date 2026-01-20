# Vessel API Specification

Expected response from `GET /vessels`.

## Response Format

```json
{
  "vessels": [Vessel],
  "timestamp": "ISO 8601 string"
}
```

## Vessel Object

```json
{
  "MMSI": 123456789,
  "NAME": "STENA SCANDINAVICA",
  "LATITUDE": 58.5123,
  "LONGITUDE": 20.1456,
  "SOG": 12.5,
  "COG": 180.0,
  "HEADING": 178,
  "NAVSTAT": 0,
  "TYPE": "Tanker",
  "FLAG": "SE",
  "COUNTRY": "Sweden",
  "shadowScore": {
    "probability": 0.75,
    "score": 75,
    "color": "RED",
    "features": {
      "vessel_age_years": 18,
      "origin_risk_score": 0.8,
      "destination_risk_score": 0.7,
      "route_risk_score": 0.5,
      "flag_risk_score": 1.0,
      "ais_risk_score": 0.6,
      "ownership_risk_score": 0.8,
      "insurance_risk_score": 0.5,
      "cargo_risk_score": 1.0,
      "sts_indicator": 1
    }
  }
}
```

## Field Reference

| Field         | Type     | Required | Description                      |
| ------------- | -------- | -------- | -------------------------------- |
| `MMSI`        | `number` | ✓        | Maritime Mobile Service Identity |
| `NAME`        | `string` | ✓        | Vessel name                      |
| `LATITUDE`    | `number` | ✓        | Current latitude                 |
| `LONGITUDE`   | `number` | ✓        | Current longitude                |
| `SOG`         | `number` | ✓        | Speed Over Ground (knots)        |
| `COG`         | `number` |          | Course Over Ground (degrees)     |
| `HEADING`     | `number` |          | True heading (degrees)           |
| `NAVSTAT`     | `number` |          | Navigation status code (0-8)     |
| `TYPE`        | `string` |          | Vessel type                      |
| `FLAG`        | `string` |          | ISO 3166-1 alpha-2 country code  |
| `COUNTRY`     | `string` |          | Full country name                |
| `shadowScore` | `object` |          | Shadow fleet prediction          |

## Shadow Score Object

| Field         | Type     | Description                           |
| ------------- | -------- | ------------------------------------- |
| `probability` | `number` | 0.0 - 1.0 probability of shadow fleet |
| `score`       | `number` | 0 - 100 integer score                 |
| `color`       | `string` | `"RED"` \| `"YELLOW"` \| `"GREEN"`    |
| `features`    | `object` | Feature vector used for prediction    |

## Navigation Status Codes

| Code | Description                |
| ---- | -------------------------- |
| 0    | Under way using engine     |
| 1    | At anchor                  |
| 2    | Not under command          |
| 3    | Restricted manoeuvrability |
| 4    | Constrained by draught     |
| 5    | Moored                     |
| 6    | Aground                    |
| 7    | Engaged in fishing         |
| 8    | Under way sailing          |

## Vessel Types

`Cargo` | `Tanker` | `Passenger` | `Fishing` | `Tug` | `Dredger` | `Military Ops` | `Sailing Vessel` | `Pleasure Craft` | `Pilot Vessel` | `SAR` | `Law Enforce`
