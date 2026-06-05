# Josephine Conley, CS61, Spring 2026
# routes for /api/auth/login and /api/auth/me
# used Claude to test and find service bugs, then tested bugs in Postman to pinpoint fixes

from flask import Blueprint
from controllers import auth_controller
from middleware import auth

bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@bp.post("/login")
def login():
    return auth_controller.login()

@bp.get("/me")
@auth.require_auth()
def me():
    return auth_controller.me()