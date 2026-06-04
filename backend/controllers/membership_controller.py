from flask import g, request, jsonify
from pydantic import ValidationError
from schemas import UpdateMembershipSchema
from services import membership_service
from models.enums import MembershipStatus, UserRole, ClubRole

def _is_officer_or_admin(userId, clubId, user_role):
    if user_role == UserRole.ADMIN:
        return True
    membership = membership_service.get_membership(userId, clubId)
    if not membership:
        return False
    return membership["Role"] in [ClubRole.OFFICER, ClubRole.PRESIDENT]

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
            status=MembershipStatus.PENDING
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

def get_club_memberships(clubId):
    try:
        memberships = membership_service.get_memberships_by_club(clubId)
        return jsonify(memberships), 200
    except Exception as e:
        return jsonify({"Error": f"Failed to get memberships: {e}"}), 500

def get_user_memberships(userId):
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

    # block demotion if this is the last active officer/president
    if body.role == ClubRole.MEMBER or body.status == MembershipStatus.INACTIVE:
        if membership["Role"] in [ClubRole.OFFICER, ClubRole.PRESIDENT]:
            if not membership_service.club_has_active_officer(clubId):
                return jsonify({"Error": "Club must have at least one active officer or president"}), 400

    try:
        rowcount = membership_service.update_membership(
            userId, clubId,
            role=body.role,
            status=body.status
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
        if not membership_service.club_has_active_officer(clubId):
            return jsonify({"Error": "Club must have at least one active officer or president"}), 400

    try:
        membership_service.delete_membership(userId, clubId)
        return jsonify({"message": "Success"}), 200
    except Exception as e:
        return jsonify({"Error": f"Failed to delete membership: {e}"}), 500