# Noah Larbalestier, CS61, Spring 2026
# routes for /api/events and /api/clubs/:clubId/events
from flask import Blueprint
from controllers import event_controller
from middleware import auth

bp = Blueprint("events", __name__, url_prefix="/api/events")
clubs_bp = Blueprint("clubs_events", __name__, url_prefix="/api/clubs")

@bp.post("/")
@auth.require_auth()
def create_event():
    return event_controller.create_event()

@bp.get("/<int:eventId>")
def get_event(eventId: int):
    return event_controller.get_event(eventId)

@bp.get("/")
def get_events():
    return event_controller.get_events()

@bp.put("/<int:eventId>")
@auth.require_auth()
def update_event(eventId: int):
    return event_controller.update_event(eventId)

@bp.delete("/<int:eventId>")
@auth.require_auth()
def delete_event(eventId: int):
    return event_controller.delete_event(eventId)

@clubs_bp.get("/<int:clubId>/events")
def get_events_by_club(clubId: int):
    return event_controller.get_events_by_club(clubId)
