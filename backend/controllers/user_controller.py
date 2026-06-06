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
    body.role = (
        UserRole.STUDENT
    )  # making sure that role for a newly created user is always a student
    try:
        userId = user_service.create_user(
            body.name, body.email, body.role, body.password
        )
        user = {
            "userId": userId,
            "name": body.name,
            "email": body.email,
            "role": body.role,
        }
        return jsonify(user), 201
    except Exception as e:
        return jsonify({"Error": f"Failed to create user: {e}"}), 500


def get_user_by_id(userId: int):
    current_user = g.current_user
    current_user_id = int(current_user.get("sub"))
    if current_user_id != userId and current_user.get("role") != UserRole.ADMIN:
        return jsonify({"Error": "Action is not authorized"}), 403

    try:
        user = user_service.get_user_by_id(userId)
        if not user:
            return jsonify({"Error": f"User with id {userId} not found"}), 404
        return jsonify(user), 200
    except Exception as e:
        return jsonify({"Error": f"Failed to get user with id {userId}: {e}"}), 500


def get_users():
    user_id = request.args.get("id", type=int)
    role = request.args.get("role")
    name = request.args.get("name")
    email = request.args.get("email")

    try:
        users = user_service.get_users(
            userId=user_id, name=name, email=email, userRole=role
        )
        return jsonify(users), 200
    except Exception as e:
        return jsonify({"Error": f"Failed to get users: {e}"}), 500


def update_user(userId: int):
    current_user = g.current_user
    current_user_id = int(current_user.get("sub"))
    if current_user_id != userId and current_user.get("role") != UserRole.ADMIN:
        return jsonify({"Error": "Action is not authorized"}), 403
    try:
        body = UpdateUserSchema(**request.get_json())
    except ValidationError as e:
        return jsonify({"errors": e.errors()}), 422

    if body.role is not None and current_user.get("role") != UserRole.ADMIN:
        return jsonify({"Error": "Only admins can update user roles"}), 403

    try:
        rowcount = user_service.update_user(
            userId,
            name=body.name,
            email=body.email,
            role=body.role,
            password=body.password,
        )
        if rowcount is None:
            return jsonify({"Error": "No fields provided to update"}), 400
        if rowcount == 0:
            return jsonify({"Error": f"User with id {userId} not found"}), 404
        return jsonify({"message": "Success"}), 200
    except Exception as e:
        return jsonify({"Error": f"Failed to get update user {userId}: {e}"}), 500


def delete_user(userId: int):
    current_user = g.current_user
    current_user_id = int(current_user.get("sub"))
    if current_user_id != userId and current_user.get("role") != UserRole.ADMIN:
        return jsonify({"Error": "Action is not Authorized"}), 403
    try:
        rowcount = user_service.delete_user(userId)
        if rowcount == 0:
            return jsonify({"Error": f"User with id {userId} not found"}), 404
        return jsonify({"message": "Success"}), 200
    except Exception as e:
        return jsonify({"Error": f"Failed to delete user {userId}: {e}"}), 500


def get_user_rsvps(userId: int):
    current_user = g.current_user
    current_user_id = int(current_user.get("sub"))
    if current_user_id != userId and current_user.get("role") != UserRole.ADMIN:
        return jsonify({"Error": "Action is not Authroized"}), 403
    try:
        user_rsvps, rowcount = user_service.get_user_rsvps(userId);
        if rowcount == 0:
            return jsonify([]), 200
        return jsonify(user_rsvps), 200
    except Exception as e:
        return jsonify({"Error": f"Failed to get rsvps for user {userId}: {e}"}), 500
