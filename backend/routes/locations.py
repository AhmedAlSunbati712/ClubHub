from flask import Blueprint
from controllers import location_controller
from middleware import auth

bp = Blueprint("locations", __name__, url_prefix="/api/locations")

@bp.post("/")
@auth.require_auth(admin_only=True)
def create_location():
    return location_controller.create_location()

@bp.get("/<int:locationId>")
def get_location(locationId: int):
    return location_controller.get_location(locationId)

@bp.get("/")
def get_locations():
    return location_controller.get_locations()

@bp.put("/<int:locationId>")
@auth.require_auth(admin_only=True)
def update_location(locationId: int):
    return location_controller.update_location(locationId)

@bp.delete("/<int:locationId>")
@auth.require_auth(admin_only=True)
def delete_location(locationId: int):
    return location_controller.delete_location(locationId)