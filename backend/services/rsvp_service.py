# Noah Larbalestier, CS61, Spring 2026
# database queries for RSVPs, including waitlist promotion logic
# used Claude to test and find service bugs, then tested bugs in Postman to pinpoint fixes
from config import get_connection
from models.enums import RSVPStatus


def get_rsvp(eventId, userId):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT * FROM RSVPs WHERE EventID = %s AND UserID = %s", [eventId, userId]
        )
        return cursor.fetchone()
    finally:
        cursor.close()
        connection.close()


def create_rsvp(eventId, userId, status):
    connection = get_connection()
    cursor = connection.cursor()
    try:
        cursor.execute(
            "INSERT INTO RSVPs (EventID, UserID, RSVPStatus, RequestedAt) VALUES (%s, %s, %s, NOW())",
            [eventId, userId, status],
        )
        connection.commit()
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        cursor.close()
        connection.close()


def get_rsvps_for_event(eventId):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute(
            """SELECT r.UserID, r.RSVPStatus, r.RequestedAt, r.CheckedIn, r.CheckInTime,
                      u.Name, u.Email
               FROM RSVPs r JOIN Users u ON r.UserID = u.UserID
               WHERE r.EventID = %s""",
            [eventId],
        )
        return cursor.fetchall()
    finally:
        cursor.close()
        connection.close()


def update_rsvp_status(eventId, userId, status):
    connection = get_connection()
    cursor = connection.cursor()
    try:
        cursor.execute(
            "UPDATE RSVPs SET RSVPStatus = %s WHERE EventID = %s AND UserID = %s",
            [status, eventId, userId],
        )
        connection.commit()
        return cursor.rowcount
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        cursor.close()
        connection.close()


# promote the oldest waitlisted RSVP using RequestedAt order (per the EERD)
def promote_oldest_waitlisted(eventId):
    connection = get_connection()
    cursor = connection.cursor()
    try:
        cursor.execute(
            "UPDATE RSVPs SET RSVPStatus = %s WHERE EventID = %s AND RSVPStatus = %s ORDER BY RequestedAt ASC LIMIT 1",
            [RSVPStatus.CONFIRMED, eventId, RSVPStatus.WAITLISTED],
        )
        connection.commit()
        return cursor.rowcount
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        cursor.close()
        connection.close()


def delete_rsvp(eventId, userId):
    connection = get_connection()
    cursor = connection.cursor()
    try:
        cursor.execute(
            "DELETE FROM RSVPs WHERE EventID = %s AND UserID = %s", [eventId, userId]
        )
        connection.commit()
        return cursor.rowcount
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        cursor.close()
        connection.close()
