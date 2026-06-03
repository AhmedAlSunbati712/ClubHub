# Noah Larbalestier, CS61, Spring 2026
# routes for /api/events/:eventId/rsvps
from flask import Blueprint
from controllers import rsvp_controller
from middleware import auth

bp = Blueprint("rsvps", __name__, url_prefix="/api/events")

@bp.post("/<int:eventId>/rsvps")
@auth.require_auth()
def create_rsvp(eventId: int):
    return rsvp_controller.create_rsvp(eventId)

@bp.get("/<int:eventId>/rsvps")
@auth.require_auth()
def get_rsvps(eventId: int):
    return rsvp_controller.get_rsvps(eventId)

@bp.put("/<int:eventId>/rsvps/<int:userId>")
@auth.require_auth()
def update_rsvp(eventId: int, userId: int):
    return rsvp_controller.update_rsvp(eventId, userId)

@bp.delete("/<int:eventId>/rsvps/<int:userId>")
@auth.require_auth()
def delete_rsvp(eventId: int, userId: int):
    return rsvp_controller.delete_rsvp(eventId, userId)
