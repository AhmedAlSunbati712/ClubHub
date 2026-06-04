from flask import g, jsonify, request
from pydantic import ValidationError
from schemas import CreateClubSchema, UpdateClubSchema
from services import club_service, membership_service
from models.enums import UserRole, ClubRole, MembershipStatus

def _is_officer_or_admin(userId, clubId, user_role):
    if user_role == UserRole.ADMIN:
        return True
    membership = membership_service.get_membership(userId, clubId)
    if not membership:
        return False
    return membership["Role"] in [ClubRole.OFFICER, ClubRole.PRESIDENT]

def create_club():
	try:
		body = CreateClubSchema(**request.get_json())
	except ValidationError as e:
		return jsonify({"Errors": e.errors()}), 422
	
	try:
		club_id = club_service.create_club(
			name=body.name, 
			description=body.description,
			category=body.category,
			status=body.status
		)
		current_user = g.current_user
		membership_service.create_membership(
			user_id=current_user["sub"],
			club_id=club_id,
			role=ClubRole.PRESIDENT,
			status=MembershipStatus.ACTIVE
		)
		return jsonify({"clubId": club_id}), 201
	except Exception as e:
		return jsonify({"Error": f"Couldn't create club: {e}"}), 500

def get_club(clubId):
    try:
        club = club_service.get_club(clubId)
        if not club:
            return jsonify({"Error": f"Could not find club with ID {clubId}"}), 404
        return jsonify(club), 200
    except Exception as e:
        return jsonify({"Error": f"Failed to get club: {e}"}), 500

def get_clubs():
    name = request.args.get("name")
    category = request.args.get("category")
    try:
        clubs = club_service.get_all_clubs(name=name, category=category)
        return jsonify(clubs), 200
    except Exception as e:
        return jsonify({"Error": f"Failed to get clubs: {e}"}), 500

def update_club(clubId):
    club = club_service.get_club(clubId)
    if not club:
        return jsonify({"Error": f"Club with id {clubId} not found"}), 404

    current_user = g.current_user
    if not _is_officer_or_admin(current_user["sub"], clubId, current_user.get("role")):
        return jsonify({"Error": "Only officers or admins can update clubs"}), 403

    try:
        body = UpdateClubSchema(**request.get_json())
    except ValidationError as e:
        return jsonify({"errors": e.errors()}), 422

    try:
        count = club_service.update_club(
            clubId,
            name=body.name,
            description=body.description,
            category=body.category,
            status=body.status
        )
        if count is None:
            return jsonify({"Error": "No fields provided to update"}), 400
        return jsonify({"message": "Success"}), 200
    except Exception as e:
        return jsonify({"Error": f"Failed to update club: {e}"}), 500

def delete_club(clubId):
    club = club_service.get_club(clubId)
    if not club:
        return jsonify({"Error": f"Club with id {clubId} not found"}), 404

    current_user = g.current_user
    if not _is_officer_or_admin(current_user["sub"], clubId, current_user.get("role")):
        return jsonify({"Error": "Only officers or admins can delete clubs"}), 403

    try:
        club_service.delete_club(clubId)
        return jsonify({"message": "Successful deletion"}), 200
    except Exception as e:
        return jsonify({"Error": f"Failed to delete club: {e}"}), 500