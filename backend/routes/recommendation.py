from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.database import get_db
from database.models import Track
from models.schemas import RouteRecommendationRequest, RouteRecommendationResponse
from services.route_recommender import recommend_alternative_route

router = APIRouter(tags=["Alternative Route Recommendation"])


@router.post(
    "/recommend-alternative-route",
    response_model=RouteRecommendationResponse,
    summary="Recommend Alternative Route for High/Critical Risk Tracks"
)
def recommend_alternative_route_endpoint(
    req: RouteRecommendationRequest,
    db: Session = Depends(get_db)
):
    """
    Decision-Support Feature:
    Evaluates target track risk and recommends a safer alternative corridor track section if available.
    Calculates transparent Alternative Route Score based on Safety, Availability, Capacity, and Detour Delay.
    
    NOTE: Advisory recommendation only. Does NOT automatically reroute trains or control signaling.
    """
    track = db.query(Track).filter(Track.track_id == req.track_id).first()
    if not track:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Track ID '{req.track_id}' not found in database."
        )

    res = recommend_alternative_route(db, req.track_id)
    return res
