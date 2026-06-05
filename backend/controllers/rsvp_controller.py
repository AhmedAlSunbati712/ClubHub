# Noah Larbalestier, CS61, Spring 2026
# handles RSVP creation, updates, and deletion with waitlist promotion
# used Claude to test and find service bugs, then tested bugs in Postman to pinpoint fixes
from flask import g, request, jsonify
from pydantic import ValidationError
from schemas import UpdateRSVPSchema
from services import event_service, rsvp_service
from models.enums import UserRole, ClubRole, RSVPStatus, EventStatus

def _is_officer_or_admin(userId, clubId, user_role):
    if user_role == UserRole.ADMIN:
        return True
    club_role = event_service.get_user_club_role(userId, clubId)
    return club_role in [ClubRole.OFFICER, ClubRole.PRESIDENT]

def create_rsvp(eventId):
    current_user = g.current_user
    userId = current_user["sub"]

    event = event_service.get_event_by_id(eventId)
    if not event:
        return jsonify({"Error": f"Event with id {eventId} not found"}), 404

    # EERD: do not accept RSVPs for completed or cancelled events
    if event["Status"] in [EventStatus.CANCELLED, EventStatus.COMPLETED]:
        return jsonify({"Error": "RSVPs are not accepted for completed or cancelled events"}), 400

    existing = rsvp_service.get_rsvp(eventId, userId)
    if existing and existing["RSVPStatus"] != RSVPStatus.CANCELLED:
        return jsonify({"Error": "Already RSVPed to this event"}), 409

    # use the denormalized ConfirmedCount to decide confirmed vs waitlisted
    capacity = event.get("EventCapacity")
    if capacity is not None:
        status = RSVPStatus.CONFIRMED if event["ConfirmedCount"] < capacity else RSVPStatus.WAITLISTED
    else:
        status = RSVPStatus.CONFIRMED

    try:
        if existing:
            rsvp_service.update_rsvp_status(eventId, userId, status)
        else:
            rsvp_service.create_rsvp(eventId, userId, status)

        if status == RSVPStatus.CONFIRMED:
            event_service.update_confirmed_count(eventId, 1)

        return jsonify({"status": status}), 201
    except Exception as e:
        return jsonify({"Error": f"Failed to RSVP: {e}"}), 500

def get_rsvps(eventId):
    current_user = g.current_user
    event = event_service.get_event_by_id(eventId)
    if not event:
        return jsonify({"Error": f"Event with id {eventId} not found"}), 404

    if not _is_officer_or_admin(current_user["sub"], event["ClubID"], current_user.get("role")):
        return jsonify({"Error": "Only officers or admins can view the RSVP list"}), 403

    try:
        rsvps = rsvp_service.get_rsvps_for_event(eventId)
        return jsonify(rsvps), 200
    except Exception as e:
        return jsonify({"Error": f"Failed to get RSVPs: {e}"}), 500

def update_rsvp(eventId, userId):
    current_user = g.current_user
    if current_user["sub"] != userId and current_user.get("role") != UserRole.ADMIN:
        return jsonify({"Error": "Not authorized"}), 403

    try:
        body = UpdateRSVPSchema(**request.get_json())
    except ValidationError as e:
        return jsonify({"errors": e.errors()}), 422

    existing = rsvp_service.get_rsvp(eventId, userId)
    if not existing:
        return jsonify({"Error": "RSVP not found"}), 404

    try:
        was_confirmed = existing["RSVPStatus"] == RSVPStatus.CONFIRMED
        rsvp_service.update_rsvp_status(eventId, userId, body.status)

        # if cancelling a confirmed spot, open it up for the next waitlisted person
        if body.status == RSVPStatus.CANCELLED and was_confirmed:
            event_service.update_confirmed_count(eventId, -1)
            promoted = rsvp_service.promote_oldest_waitlisted(eventId)
            if promoted:
                event_service.update_confirmed_count(eventId, 1)

        return jsonify({"message": "Success"}), 200
    except Exception as e:
        return jsonify({"Error": f"Failed to update RSVP: {e}"}), 500

def delete_rsvp(eventId, userId):
    current_user = g.current_user
    if current_user["sub"] != userId and current_user.get("role") != UserRole.ADMIN:
        return jsonify({"Error": "Not authorized"}), 403

    existing = rsvp_service.get_rsvp(eventId, userId)
    if not existing:
        return jsonify({"Error": "RSVP not found"}), 404

    try:
        was_confirmed = existing["RSVPStatus"] == RSVPStatus.CONFIRMED
        rsvp_service.delete_rsvp(eventId, userId)

        if was_confirmed:
            event_service.update_confirmed_count(eventId, -1)
            promoted = rsvp_service.promote_oldest_waitlisted(eventId)
            if promoted:
                event_service.update_confirmed_count(eventId, 1)

        return jsonify({"message": "Success"}), 200
    except Exception as e:
        return jsonify({"Error": f"Failed to delete RSVP: {e}"}), 500
