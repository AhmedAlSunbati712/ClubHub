# Noah Larbalestier, CS61, Spring 2026
# handles event CRUD — enforces officer/admin permissions and capacity constraints
# used Claude to test and find service bugs, then tested bugs in Postman to pinpoint fixes
from flask import g, request, jsonify
from pydantic import ValidationError
from schemas import CreateEventSchema, UpdateEventSchema
from services import event_service
from models.enums import UserRole, ClubRole


def _is_officer_or_admin(userId, clubId, user_role):
    if user_role == UserRole.ADMIN:
        return True
    club_role = event_service.get_user_club_role(userId, clubId)
    return club_role in [ClubRole.OFFICER, ClubRole.PRESIDENT]


def create_event():
    try:
        body = CreateEventSchema(**request.get_json())
    except ValidationError as e:
        return jsonify({"errors": e.errors()}), 422

    current_user = g.current_user
    if not _is_officer_or_admin(
        current_user["sub"], body.clubId, current_user.get("role")
    ):
        return jsonify({"Error": "Only officers or admins can create events"}), 403

    # enforce event capacity <= location capacity
    try:
        loc_capacity = event_service.get_location_capacity(body.locationId)
        if loc_capacity is None:
            return jsonify({"Error": f"No location with id {body.locationId} exists"}), 400
        if body.eventCapacity > loc_capacity:
            return jsonify({"Error": f"Event capacity ({body.eventCapacity}) exceeds location capacity ({loc_capacity})"}), 400
    except Exception as e:
        return jsonify({"Error": f"Failed to validate location capacity: {e}"}), 500


    try:
        eventId = event_service.create_event(
            clubId=body.clubId,
            title=body.title,
            description=body.description,
            eventDateTime=body.eventDateTime,
            locationId=body.locationId,
            eventCapacity=body.eventCapacity,
        )
        return jsonify({"eventId": eventId}), 201
    except Exception as e:
        return jsonify({"Error": f"Failed to create event: {e}"}), 500


def get_event(eventId):
    try:
        event = event_service.get_event_by_id(eventId)
        if not event:
            return jsonify({"Error": f"Event with id {eventId} not found"}), 404
        return jsonify(event), 200
    except Exception as e:
        return jsonify({"Error": f"Failed to get event: {e}"}), 500


def get_events():
    club_id = request.args.get("clubId", type=int)
    status = request.args.get("status")
    title = request.args.get("title")
    try:
        events = event_service.get_events(clubId=club_id, status=status, title=title)
        return jsonify(events), 200
    except Exception as e:
        return jsonify({"Error": f"Failed to get events: {e}"}), 500


def update_event(eventId):
    event = event_service.get_event_by_id(eventId)
    if not event:
        return jsonify({"Error": f"Event with id {eventId} not found"}), 404

    current_user = g.current_user
    if not _is_officer_or_admin(
        current_user["sub"], event["ClubID"], current_user.get("role")
    ):
        return jsonify({"Error": "Only officers or admins can update events"}), 403

    try:
        body = UpdateEventSchema(**request.get_json())
    except ValidationError as e:
        return jsonify({"errors": e.errors()}), 422

    # re-validate capacity against location (use updated values if provided, else existing)
    check_capacity = (
        body.eventCapacity # If the user wants to modify the capacity of the given event
        if body.eventCapacity is not None
        else event.get("EventCapacity") # otherwise use the original  capacity
    )
    
    check_location = (
        body.locationId if body.locationId is not None else event.get("LocationID")
    )
    
    if check_capacity is not None and check_location is not None:
        try:
            loc_capacity = event_service.get_location_capacity(check_location)
            if loc_capacity is None:
                return jsonify({"Error": f"No location with id {check_location} exists"}), 400
            if check_capacity > loc_capacity:
                return jsonify({"Error": f"Event capacity ({check_capacity}) exceeds location capacity ({loc_capacity})"}), 400
        except Exception as e:
            return jsonify({"Error": f"Failed to validate capacity of location {check_location} for event {eventId}"}), 400
        
    try:
        rowcount = event_service.update_event(
            eventId,
            locationId=body.locationId,
            title=body.title,
            description=body.description,
            eventDateTime=body.eventDateTime,
            eventCapacity=body.eventCapacity,
            status=body.status,
        )
        if rowcount is None:
            return jsonify({"Error": "No fields provided to update"}), 400
        return jsonify({"message": "Success"}), 200
    except Exception as e:
        return jsonify({"Error": f"Failed to update event: {e}"}), 500


def delete_event(eventId):
    event = event_service.get_event_by_id(eventId)
    if not event:
        return jsonify({"Error": f"Event with id {eventId} not found"}), 404

    current_user = g.current_user
    if not _is_officer_or_admin(
        current_user["sub"], event["ClubID"], current_user.get("role")
    ):
        return jsonify({"Error": "Only officers or admins can delete events"}), 403

    try:
        event_service.delete_event(eventId)
        return jsonify({"message": "Success"}), 200
    except Exception as e:
        return jsonify({"Error": f"Failed to delete event: {e}"}), 500


def get_events_by_club(clubId):
    try:
        events = event_service.get_events(clubId=clubId)
        return jsonify(events), 200
    except Exception as e:
        return jsonify({"Error": f"Failed to get events for club {clubId}: {e}"}), 500
