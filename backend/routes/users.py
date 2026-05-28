from flask import Blueprint
from controllers import user_controller
from middleware import auth

bp = Blueprint("users", __name__, url_prefix="/api/users")

@bp.post("/")
def create_user():
    return user_controller.create_user()

@bp.get("/<int:userId>")
@auth.require_auth()
def get_user_by_id(userId: int):
    return user_controller.get_user_by_id(userId)

@bp.get("/")
@auth.require_auth(admin_only=True)
def get_users():
    return user_controller.get_users()

@bp.put("/<int:userId>")
@auth.require_auth()
def update_user(userId: int):
    return user_controller.update_user(userId)