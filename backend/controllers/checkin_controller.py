# Noah Larbalestier, CS61, Spring 2026
# handles check-in endpoints — officer/admin only
# used Claude to test and find service bugs, then tested bugs in Postman to pinpoint fixes
from flask import g, jsonify
from services import event_service, checkin_service
from models.enums import UserRole, ClubRole, EventStatus, RSVPStatus


def _is_officer_or_admin(userId, clubId, user_role):
    if user_role == UserRole.ADMIN:
        return True
    club_role = event_service.get_user_club_role(userId, clubId)
    return club_role in [ClubRole.OFFICER, ClubRole.PRESIDENT]


def create_checkin(eventId, userId):
    current_user = g.current_user
    event = event_service.get_event_by_id(eventId)
    if not event:
        return jsonify({"Error": f"Event with id {eventId} not found"}), 404

    if not _is_officer_or_admin(
        current_user["sub"], event["ClubID"], current_user.get("role")
    ):
        return jsonify({"Error": "Only officers or admins can check in attendees"}), 403

    try:
        # returns 0 if user has no active RSVP (cancelled or doesn't exist)
        rowcount = checkin_service.create_checkin(eventId, userId)
        if rowcount == 0:
            return jsonify({"Error": "User has no active RSVP for this event"}), 400
        return jsonify({"message": "Success"}), 201
    except Exception as e:
        return jsonify({"Error": f"Failed to check in user: {e}"}), 500


def create_self_checkin(eventId):
    current_user = g.current_user
    current_user_id = int(current_user.get("sub"))
    event = event_service.get_event_by_id(eventId)
    if not event:
        return jsonify({"Error": f"Event with id {eventId} not found"}), 404

    if event["Status"] in [EventStatus.CANCELLED, EventStatus.COMPLETED]:
        return jsonify({"Error": "This event is not accepting check-ins"}), 400

    event_datetime = event.get("EventDateTime")
    if event_datetime is not None and event_datetime > checkin_service.get_current_time():
        return jsonify({"Error": "Check-in opens when the event starts"}), 400

    existing = checkin_service.get_user_checkin_state(eventId, current_user_id)
    if not existing:
        return jsonify({"Error": "User has no active RSVP for this event"}), 400
    if existing["RSVPStatus"] != RSVPStatus.CONFIRMED:
        return jsonify({"Error": "Only confirmed attendees can check in"}), 400
    if existing["CheckedIn"]:
        return jsonify({"Error": "User is already checked in"}), 409

    try:
        rowcount = checkin_service.create_checkin(eventId, current_user_id)
        if rowcount == 0:
            return jsonify({"Error": "User has no active RSVP for this event"}), 400
        return jsonify({"message": "Success"}), 201
    except Exception as e:
        return jsonify({"Error": f"Failed to check in user: {e}"}), 500


def delete_checkin(eventId, userId):
    current_user = g.current_user
    event = event_service.get_event_by_id(eventId)
    if not event:
        return jsonify({"Error": f"Event with id {eventId} not found"}), 404

    if not _is_officer_or_admin(
        current_user["sub"], event["ClubID"], current_user.get("role")
    ):
        return jsonify({"Error": "Only officers or admins can undo check-ins"}), 403

    try:
        rowcount = checkin_service.delete_checkin(eventId, userId)
        if rowcount == 0:
            return jsonify({"Error": "Check-in not found"}), 404
        return jsonify({"message": "Success"}), 200
    except Exception as e:
        return jsonify({"Error": f"Failed to undo check-in: {e}"}), 500


def get_checkins(eventId):
    current_user = g.current_user
    event = event_service.get_event_by_id(eventId)
    if not event:
        return jsonify({"Error": f"Event with id {eventId} not found"}), 404

    if not _is_officer_or_admin(
        current_user["sub"], event["ClubID"], current_user.get("role")
    ):
        return jsonify({"Error": "Only officers or admins can view check-ins"}), 403

    try:
        checkins = checkin_service.get_checkins_for_event(eventId)
        return jsonify(checkins), 200
    except Exception as e:
        return jsonify({"Error": f"Failed to get check-ins: {e}"}), 500
