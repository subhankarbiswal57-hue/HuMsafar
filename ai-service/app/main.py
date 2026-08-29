import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier

app = FastAPI(title="Infra Resilience AI Service")

SURFACE_MAP = {"ASPHALT": 3, "CONCRETE": 4, "GRAVEL": 1, "UNPAVED": 0}
MATERIAL_SCORE = {"steel": 3, "reinforced concrete": 3, "concrete": 2, "wood": 1, "masonry": 1}


def _material_score(material: str) -> int:
    return MATERIAL_SCORE.get(material.strip().lower(), 2)


def _synthetic_road_data(n=4000, seed=42):
    rng = np.random.default_rng(seed)
    age = rng.uniform(0, 60, n)
    condition = rng.uniform(10, 100, n)
    surface = rng.integers(0, 5, n)
    lanes = rng.integers(1, 8, n)
    width = rng.uniform(3, 20, n)
    noise = rng.normal(0, 4, n)
    # Domain-informed synthetic target: higher age/lower current condition/lower surface quality -> faster decline
    decline = 0.35 * age / 60 * 100 + 0.5 * (100 - condition) - 3 * surface + noise
    future_score = np.clip(condition - decline * 0.15, 0, 100)
    X = np.column_stack([age, condition, surface, lanes, width])
    return X, future_score


def _synthetic_bridge_data(n=4000, seed=7):
    rng = np.random.default_rng(seed)
    age = rng.uniform(0, 100, n)
    condition = rng.uniform(10, 100, n)
    span = rng.uniform(5, 500, n)
    capacity = rng.uniform(5, 80, n)
    material = rng.integers(1, 4, n)
    logits = 0.04 * age - 0.08 * condition - 0.01 * capacity - 1.2 * material + rng.normal(0, 1.5, n)
    prob_fail = 1 / (1 + np.exp(-(-3 + logits)))
    label = (rng.random(n) < prob_fail).astype(int)
    X = np.column_stack([age, condition, span, capacity, material])
    return X, label


ROAD_FEATURES = ["age_years", "condition_score", "surface_quality", "lanes", "width_m"]
BRIDGE_FEATURES = ["age_years", "condition_score", "span_length_m", "load_capacity_t", "material_score"]

_rx, _ry = _synthetic_road_data()
road_model = RandomForestRegressor(n_estimators=150, max_depth=8, random_state=0).fit(_rx, _ry)

_bx, _by = _synthetic_bridge_data()
bridge_model = RandomForestClassifier(n_estimators=150, max_depth=8, random_state=0).fit(_bx, _by)


def _explain(model, feature_names, x_row) -> dict:
    importances = model.feature_importances_
    return {name: round(float(imp), 4) for name, imp in sorted(zip(feature_names, importances), key=lambda t: -t[1])}


def _tree_std(model, x_row) -> float:
    preds = np.array([t.predict(x_row.reshape(1, -1))[0] for t in model.estimators_])
    return float(preds.std())


class RoadInput(BaseModel):
    yearBuilt: int | None = None
    lengthKm: float
    widthM: float | None = 7.0
    lanes: int = 2
    surfaceType: str = "ASPHALT"
    conditionScore: float = 80
    currentYear: int = 2026


class BridgeInput(BaseModel):
    yearBuilt: int | None = None
    spanLengthM: float
    loadCapacityT: float | None = 30
    material: str = "reinforced concrete"
    conditionScore: float = 80
    currentYear: int = 2026


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict/deterioration")
def predict_deterioration(data: RoadInput):
    age = max(0, data.currentYear - (data.yearBuilt or data.currentYear - 15))
    surface = SURFACE_MAP.get(data.surfaceType.upper(), 3)
    x = np.array([age, data.conditionScore, surface, data.lanes, data.widthM or 7.0])
    predicted = float(road_model.predict(x.reshape(1, -1))[0])
    std = _tree_std(road_model, x)
    confidence = max(0.4, min(0.97, 1 - std / 50))
    risk = "CRITICAL" if predicted < 30 else "HIGH" if predicted < 50 else "MODERATE" if predicted < 70 else "LOW"
    return {
        "predictedConditionScore12mo": round(predicted, 1),
        "currentConditionScore": data.conditionScore,
        "expectedDeclinePoints": round(data.conditionScore - predicted, 1),
        "riskLevel": risk,
        "confidence": round(confidence, 2),
        "explanation": _explain(road_model, ROAD_FEATURES, x),
    }


@app.post("/predict/bridge-failure")
def predict_bridge_failure(data: BridgeInput):
    age = max(0, data.currentYear - (data.yearBuilt or data.currentYear - 25))
    material_score = _material_score(data.material)
    x = np.array([age, data.conditionScore, data.spanLengthM, data.loadCapacityT or 30, material_score])
    proba = float(bridge_model.predict_proba(x.reshape(1, -1))[0][1])
    risk = "CRITICAL" if proba > 0.7 else "HIGH" if proba > 0.45 else "MODERATE" if proba > 0.2 else "LOW"
    return {
        "failureProbability": round(proba, 3),
        "riskLevel": risk,
        "confidence": round(max(0.5, 1 - abs(proba - 0.5)), 2),
        "explanation": _explain(bridge_model, BRIDGE_FEATURES, x),
    }
