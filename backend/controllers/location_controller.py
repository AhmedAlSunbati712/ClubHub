# Josephine Conley, CS61, Spring 2026
# handles CRUD operations for locations
# used Claude to test and find service bugs, then tested bugs in Postman to pinpoint fixes

from flask import g, request, jsonify
from pydantic import ValidationError
from schemas import CreateLocationSchema, UpdateLocationSchema
from services import location_service


def create_location():
    try:
        body = CreateLocationSchema(**request.get_json())
    except ValidationError as e:
        return jsonify({"errors": e.errors()}), 422

    try:
        locationId = location_service.create_location(
            building=body.building, room=body.room, capacity=body.capacity
        )
        return jsonify({"locationId": locationId}), 201
    except Exception as e:
        return jsonify({"Error": f"Failed to create location: {e}"}), 500


def get_location(locationId):
    try:
        location = location_service.get_location(locationId)
        if not location:
            return jsonify({"Error": f"Location with id {locationId} not found"}), 404
        return jsonify(location), 200
    except Exception as e:
        return jsonify({"Error": f"Failed to get location: {e}"}), 500


def get_locations():
    building = request.args.get("building")
    room = request.args.get("room")
    try:
        locations = location_service.get_locations(building=building, room=room)
        return jsonify(locations), 200
    except Exception as e:
        return jsonify({"Error": f"Failed to get locations: {e}"}), 500


def update_location(locationId):
    location = location_service.get_location(locationId)
    if not location:
        return jsonify({"Error": f"Location with id {locationId} not found"}), 404

    try:
        body = UpdateLocationSchema(**request.get_json())
    except ValidationError as e:
        return jsonify({"errors": e.errors()}), 422

    try:
        rowcount = location_service.update_location(
            locationId, building=body.building, room=body.room, capacity=body.capacity
        )
        if rowcount is None:
            return jsonify({"Error": "No fields provided to update"}), 400
        return jsonify({"message": "Success"}), 200
    except Exception as e:
        return jsonify({"Error": f"Failed to update location: {e}"}), 500


def delete_location(locationId):
    location = location_service.get_location(locationId)
    if not location:
        return jsonify({"Error": f"Location with id {locationId} not found"}), 404

    if location_service.valid_location(locationId):
        return jsonify({"Error": "Cannot delete a location that has events"}), 409

    try:
        location_service.delete_location(locationId)
        return jsonify({"message": "Success"}), 200
    except Exception as e:
        return jsonify({"Error": f"Failed to delete location: {e}"}), 500
