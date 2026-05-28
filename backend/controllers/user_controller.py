from flask import g, request, jsonify
from pydantic import ValidationError
from schemas import CreateUserSchema, UpdateUserSchema
from services import user_service
from models.enums import UserRole

def create_user():
    try:
        body = CreateUserSchema(**request.get_json())
    except ValidationError as e:
        return jsonify({"errors": e.errors()}), 422
    body.role = UserRole.STUDENT # making sure that role for a newly created user is always a student
    try:
        userId = user_service.create_user(body.name, body.email, body.role)
        user = {"userId": userId, "name": body.name, "email": body.email, "role": body.role}
        return jsonify(user), 201
    except Exception as e:
        return jsonify({"Error": f"Failed to create user: {e}"}), 500


def get_user_by_id(userId: int):
    current_user = g.current_user
    if current_user.get("sub") != userId and current_user.get("role") != UserRole.ADMIN:
        return jsonify({"Error": "Action is not authorized"}), 403

    try:
        user = user_service.get_user_by_id(userId)
        if not user:
            return jsonify({"Error": f"User with id {userId} not found"}), 404
        return jsonify(user), 200
    except Exception as e:
        return jsonify({"Error": f"Failed to get user with id {userId}: {e}"}), 500
