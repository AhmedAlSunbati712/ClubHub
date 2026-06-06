# Josephine Conley, CS61, Spring 2026
# routes for /api/clubs and /api/clubs/:clubId
# used Claude to test and find service bugs, then tested bugs in Postman to pinpoint fixes

from flask import Blueprint
from controllers import club_controller
from middleware import auth

bp = Blueprint("clubs", __name__, url_prefix="/api/clubs")


@bp.post("/")
@auth.require_auth()
def create_club():
    return club_controller.create_club()


@bp.get("/<int:clubId>")
def get_club(clubId: int):
    return club_controller.get_club(clubId)


@bp.get("/")
def get_clubs():
    return club_controller.get_clubs()


@bp.put("/<int:clubId>")
@auth.require_auth()
def update_club(clubId: int):
    return club_controller.update_club(clubId)


@bp.delete("/<int:clubId>")
@auth.require_auth()
def delete_club(clubId: int):
    return club_controller.delete_club(clubId)

@bp.get("/<int:clubId>/officers")
def get_club_officers(clubId: int):
    return club_controller.get_club_officers(clubId)
    
