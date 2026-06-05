# Josephine Conley, CS61, Spring 2026
# handles CRUD operations for logins

from flask import g, jsonify, request
from pydantic import ValidationError
from schemas.auth import LoginSchema
from services import auth_service

def login():
    try:
        body = LoginSchema(**request.get_json())
    except ValidationError as e:
        return jsonify({"Errors": e.errors()}), 422
    
    user = auth_service.get_user_by_email(body.email)
    if not user:
        return jsonify({"Error": "Invalid email or password"}), 401
    
    if not auth_service.verify_password(body.password, user["HashedPassword"]):
        return jsonify({"Error": "Invalid email or password"}), 401
    
    token = auth_service.create_token(user)
    return jsonify({"token": token}), 200
	
def me():
    current_user = g.current_user
    try:
        user = auth_service.get_user_by_id(current_user["sub"])
        if not user:
            return jsonify({"Error": "User not found"}), 404
        return jsonify(user), 200
    except Exception as e:
        return jsonify({"Error": f"Failed to get user: {e}"}), 500
