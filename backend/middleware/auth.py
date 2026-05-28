from functools import wraps
from flask import g, jsonify, request
from services import auth_service
from models.enums import UserRole

def auth(admin_only: bool):
    def decorator(view_func):
        @wraps(view_func)
        def wrapped(*args, **kwargs):
            auth_header = request.headers.get("Authorization", "")

            if not auth_header or not auth_header.startswith("Bearer "):
                return jsonify({"error": "Missing or invalid authorization header"}), 401
            
            token = auth_header.split(" ", 1)[1]
            
            try:
                payload = auth_service.decode_token(token)
            except Exception:
                return jsonify({"Error": "Invalid or expired token"})
            
            if admin_only and not (payload.get["Role"] == UserRole.ADMIN):
                return jsonify({"Error": "Admin access required for this action"}), 403
            
            g.current_user = payload
            return view_func(*args, **kwargs)
        return wrapped
    return decorator