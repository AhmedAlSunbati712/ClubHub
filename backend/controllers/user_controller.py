from flask import request, jsonify
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
    userId = user_service.create_user(body.name, body.email, body.role)
    user = {userId: userId, name: body.name, email: body.email, role: body.role}
    return jsonify(user), 201