from fastapi import FastAPI
from pydantic import BaseModel
import random

app = FastAPI(title="Risk Prediction Engine API")

class LocationRequest(BaseModel):
    latitude: float
    longitude: float
    hour_of_day: int
    crowd_density: float = 0.5  # default medium density

class RiskResponse(BaseModel):
    risk_score: int
    risk_category: str
    message: str

@app.post("/predict_risk", response_model=RiskResponse)
def predict_risk(req: LocationRequest):
    # Mock Risk Score Formula for Hackathon MVP
    # Risk Score = 0.5 x Crime Density + 0.2 x Night Factor + 0.2 x Crowd Density + 0.1 x Random
    
    # Fake crime density based on lat/lng hash
    fake_crime_density = (abs(hash(f"{req.latitude}-{req.longitude}")) % 100) / 100.0
    
    # Night factor (higher risk at night 11PM - 4AM)
    night_factor = 1.0 if (req.hour_of_day >= 22 or req.hour_of_day <= 4) else 0.2
    
    raw_score = (
        0.5 * fake_crime_density +
        0.2 * night_factor +
        0.2 * req.crowd_density +
        0.1 * random.random()
    ) * 100
    
    score = int(min(max(raw_score, 0), 100))
    
    if score < 40:
        category = "Low"
        msg = "Safe Area"
    elif score < 75:
        category = "Medium"
        msg = "Exercise Caution"
    else:
        category = "High"
        msg = "High Risk Area Ahead"
        
    return RiskResponse(
        risk_score=score,
        risk_category=category,
        message=msg
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
