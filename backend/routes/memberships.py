# Josephine Conley, CS61, Spring 2026
# routes for /api/clubs/:clubId/memberships, /api/clubs/:clubId/memberships/:userId, and /api/users/:userId/memberships
# used Claude to test and find service bugs, then tested bugs in Postman to pinpoint fixes

from flask import Blueprint
from controllers import membership_controller
from middleware import auth

bp = Blueprint("memberships", __name__)


@bp.post("/api/clubs/<int:clubId>/memberships")
@auth.require_auth()
def create_membership(clubId: int):
    return membership_controller.create_membership(clubId)


@bp.get("/api/clubs/<int:clubId>/memberships/<int:userId>")
@auth.require_auth()
def get_membership(userId: int, clubId: int):
    return membership_controller.get_membership(clubId, userId)


@bp.get("/api/clubs/<int:clubId>/memberships")
@auth.require_auth()
def get_memberships_by_club(clubId: int):
    return membership_controller.get_memberships_by_club(clubId)


@bp.get("/api/users/<int:userId>/memberships")
@auth.require_auth()
def get_memberships_by_user(userId: int):
    return membership_controller.get_memberships_by_user(userId)


@bp.put("/api/clubs/<int:clubId>/memberships/<int:userId>")
@auth.require_auth()
def update_membership(clubId: int, userId: int):
    return membership_controller.update_membership(clubId, userId)


@bp.delete("/api/clubs/<int:clubId>/memberships/<int:userId>")
@auth.require_auth()
def delete_membership(clubId: int, userId: int):
    return membership_controller.delete_membership(clubId, userId)
