# Noah Larbalestier, CS61, Spring 2026
# check-in queries — updates CheckedIn/CheckInTime on the RSVP row (no separate table)
# used Claude to test and find service bugs, then tested bugs in Postman to pinpoint fixes
from config import get_connection
from models.enums import RSVPStatus

# check-in lives on the RSVP row (CheckedIn + CheckInTime) per the EERD, not a separate table


def create_checkin(eventId, userId):
    # user must have a non-cancelled RSVP to check in
    connection = get_connection()
    cursor = connection.cursor()
    try:
        cursor.execute(
            "UPDATE RSVPs SET CheckedIn = 1, CheckInTime = NOW() WHERE EventID = %s AND UserID = %s AND RSVPStatus != %s",
            [eventId, userId, RSVPStatus.CANCELLED],
        )
        connection.commit()
        return cursor.rowcount
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        cursor.close()
        connection.close()


def delete_checkin(eventId, userId):
    connection = get_connection()
    cursor = connection.cursor()
    try:
        cursor.execute(
            "UPDATE RSVPs SET CheckedIn = 0, CheckInTime = NULL WHERE EventID = %s AND UserID = %s",
            [eventId, userId],
        )
        connection.commit()
        return cursor.rowcount
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        cursor.close()
        connection.close()


def get_checkins_for_event(eventId):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute(
            """SELECT r.UserID, r.CheckInTime, u.Name, u.Email
               FROM RSVPs r JOIN Users u ON r.UserID = u.UserID
               WHERE r.EventID = %s AND r.CheckedIn = 1""",
            [eventId],
        )
        return cursor.fetchall()
    finally:
        cursor.close()
        connection.close()
