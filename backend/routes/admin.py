# routes for /api/admin — admin dashboard metrics, admin only

from flask import Blueprint
from controllers import admin_controller
from middleware import auth

bp = Blueprint("admin", __name__, url_prefix="/api/admin")


@bp.get("/stats")
@auth.require_auth(admin_only=True)
def get_stats():
    return admin_controller.get_stats()


@bp.get("/top-clubs")
@auth.require_auth(admin_only=True)
def get_top_clubs():
    return admin_controller.get_top_clubs()
