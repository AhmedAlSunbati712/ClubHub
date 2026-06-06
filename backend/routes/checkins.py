# Noah Larbalestier, CS61, Spring 2026
# routes for /api/events/:eventId/checkins
# used Claude to test and find service bugs, then tested bugs in Postman to pinpoint fixes
from flask import Blueprint
from controllers import checkin_controller
from middleware import auth

bp = Blueprint("checkins", __name__, url_prefix="/api/events")


@bp.post("/<int:eventId>/checkins")
@auth.require_auth()
def create_self_checkin(eventId: int):
    return checkin_controller.create_self_checkin(eventId)


@bp.post("/<int:eventId>/checkins/<int:userId>")
@auth.require_auth()
def create_checkin(eventId: int, userId: int):
    return checkin_controller.create_checkin(eventId, userId)


@bp.delete("/<int:eventId>/checkins/<int:userId>")
@auth.require_auth()
def delete_checkin(eventId: int, userId: int):
    return checkin_controller.delete_checkin(eventId, userId)


@bp.get("/<int:eventId>/checkins")
@auth.require_auth()
def get_checkins(eventId: int):
    return checkin_controller.get_checkins(eventId)
