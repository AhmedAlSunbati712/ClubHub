# Josephine Conley, CS61, Spring 2026
# handles CRUD operations for memberships
# used Claude to test and find service bugs, then tested bugs in Postman to pinpoint fixes

from flask import g, request, jsonify
from pydantic import ValidationError
from schemas import UpdateMembershipSchema
from services import membership_service, club_service
from models.enums import MembershipStatus, UserRole, ClubRole


def _is_officer_or_admin(userId, clubId, user_role):
    if user_role == UserRole.ADMIN:
        return True
    membership = membership_service.get_membership(userId, clubId)
    if not membership:
        return False
    return membership["Role"] in [ClubRole.OFFICER, ClubRole.PRESIDENT]


def _is_club_president(userId, clubId):
    membership = membership_service.get_membership(userId, clubId)
    return bool(membership) and membership["Role"] == ClubRole.PRESIDENT


def create_membership(clubId):
    current_user = g.current_user
    userId = current_user["sub"]

    existing = membership_service.get_membership(userId, clubId)
    if existing:
        return jsonify({"Error": "You are already a member of this club"}), 409

    try:
        membership_service.create_membership(
            userId=userId,
            clubId=clubId,
            role=ClubRole.MEMBER,
            status=MembershipStatus.PENDING,
        )
        return jsonify({"message": "Membership request submitted"}), 201
    except Exception as e:
        return jsonify({"Error": f"Failed to create membership: {e}"}), 500


def get_membership(userId, clubId):
    try:
        membership = membership_service.get_membership(userId, clubId)
        if not membership:
            return jsonify({"Error": "Membership not found"}), 404
        return jsonify(membership), 200
    except Exception as e:
        return jsonify({"Error": f"Failed to get membership: {e}"}), 500


def get_memberships_by_club(clubId):
    try:
        memberships = membership_service.get_memberships_by_club(clubId)
        return jsonify(memberships), 200
    except Exception as e:
        return jsonify({"Error": f"Failed to get memberships: {e}"}), 500


def get_memberships_by_user(userId):
    try:
        memberships = membership_service.get_memberships_by_user(userId)
        return jsonify(memberships), 200
    except Exception as e:
        return jsonify({"Error": f"Failed to get memberships: {e}"}), 500


def update_membership(clubId, userId):
    current_user = g.current_user
    if not _is_officer_or_admin(current_user["sub"], clubId, current_user.get("role")):
        return jsonify({"Error": "Only officers or admins can update memberships"}), 403

    membership = membership_service.get_membership(userId, clubId)
    if not membership:
        return jsonify({"Error": "Membership not found"}), 404

    try:
        body = UpdateMembershipSchema(**request.get_json())
    except ValidationError as e:
        return jsonify({"errors": e.errors()}), 422

    if body.role is not None:
        is_admin = current_user.get("role") == UserRole.ADMIN
        if body.role == ClubRole.PRESIDENT:
            if not is_admin:
                return jsonify({"Error": "Only admins can assign the president role"}), 403
        elif not (is_admin or _is_club_president(current_user["sub"], clubId)):
            return (
                jsonify({"Error": "Only the club president or an admin can change member roles"}),
                403,
            )

    if body.role == ClubRole.MEMBER or body.status == MembershipStatus.INACTIVE:
        if membership["Role"] in [ClubRole.OFFICER, ClubRole.PRESIDENT]:
            if not membership_service.club_has_active_officer(clubId, exclude_user_id=userId):
                return (
                    jsonify(
                        {
                            "Error": "Club must have at least one active officer or president"
                        }
                    ),
                    400,
                )

    try:
        if body.role == ClubRole.PRESIDENT:
            membership_service.demote_other_presidents(clubId, exclude_user_id=userId)

        rowcount = membership_service.update_membership(
            userId, clubId, role=body.role, status=body.status
        )
        if rowcount is None:
            return jsonify({"Error": "No fields provided to update"}), 400
        return jsonify({"message": "Success"}), 200
    except Exception as e:
        return jsonify({"Error": f"Failed to update membership: {e}"}), 500


def delete_membership(clubId, userId):
    current_user = g.current_user
    if not _is_officer_or_admin(current_user["sub"], clubId, current_user.get("role")):
        return jsonify({"Error": "Only officers or admins can remove memberships"}), 403

    membership = membership_service.get_membership(userId, clubId)
    if not membership:
        return jsonify({"Error": "Membership not found"}), 404

    if membership["Role"] in [ClubRole.OFFICER, ClubRole.PRESIDENT]:
        if not membership_service.club_has_active_officer(clubId, exclude_user_id=userId):
            return (
                jsonify(
                    {"Error": "Club must have at least one active officer or president"}
                ),
                400,
            )

    try:
        membership_service.delete_membership(userId, clubId)
        return jsonify({"message": "Success"}), 200
    except Exception as e:
        return jsonify({"Error": f"Failed to delete membership: {e}"}), 500


def get_club_memberships_count(clubId: int):
    try:
        # make sure the club exists
        club = club_service.get_club(clubId)
        if club is None:
            return jsonify({"Error": f"Club with {clubId} Id doesn't exist!"}), 404

        memberships_count = membership_service.get_memberships_count(clubId)
        return jsonify(memberships_count), 200
    except Exception as e:
        return jsonify({"Error": f"Failed to fetch memberships count for club {clubId}"}), 500
