from flask import Blueprint
from controllers import user_controller

bp = Blueprint("users", __name__, url_prefix="/api/users")

@bp.post("/")
def create_user():
    return user_controller.create_user()