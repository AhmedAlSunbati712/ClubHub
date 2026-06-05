# Noah Larbalestier, CS61, Spring 2026
# database queries for events and club membership role lookups
# used Claude to test and find service bugs, then tested bugs in Postman to pinpoint fixes
from config import get_connection
from models.enums import MembershipStatus


# check if a user is an officer/president of a club (used for permission checks)
def get_user_club_role(userId, clubId):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT Role FROM Memberships WHERE UserID = %s AND ClubID = %s AND Status = %s",
            [userId, clubId, MembershipStatus.ACTIVE],
        )
        row = cursor.fetchone()
        return row["Role"] if row else None
    finally:
        cursor.close()
        connection.close()


# used to validate event capacity against the room's max occupancy
def get_location_capacity(locationId):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT Capacity FROM Locations WHERE LocationID = %s", [locationId]
        )
        row = cursor.fetchone()
        return row["Capacity"] if row else None
    finally:
        cursor.close()
        connection.close()


def create_event(clubId, title, eventDateTime, locationId=None, eventCapacity=None):
    connection = get_connection()
    cursor = connection.cursor()
    try:
        cursor.execute(
            "INSERT INTO Events (ClubID, LocationID, Title, EventDateTime, EventCapacity, ConfirmedCount) VALUES (%s, %s, %s, %s, %s, 0)",
            [clubId, locationId, title, eventDateTime, eventCapacity],
        )
        connection.commit()
        return cursor.lastrowid
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        cursor.close()
        connection.close()


def get_event_by_id(eventId):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM Events WHERE EventID = %s", [eventId])
        return cursor.fetchone()
    finally:
        cursor.close()
        connection.close()


def get_events(clubId=None, status=None, title=None):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        query = "SELECT * FROM Events WHERE 1=1"
        params = []
        if clubId is not None:
            query += " AND ClubID = %s"
            params.append(clubId)
        if status:
            query += " AND Status = %s"
            params.append(status)
        if title:
            query += " AND Title LIKE %s"
            params.append(f"%{title}%")
        cursor.execute(query, params)
        return cursor.fetchall()
    finally:
        cursor.close()
        connection.close()


def update_event(
    eventId,
    locationId=None,
    title=None,
    eventDateTime=None,
    eventCapacity=None,
    status=None,
):
    fields = []
    params = []

    if locationId is not None:
        fields.append("LocationID = %s")
        params.append(locationId)
    if title is not None:
        fields.append("Title = %s")
        params.append(title)
    if eventDateTime is not None:
        fields.append("EventDateTime = %s")
        params.append(eventDateTime)
    if eventCapacity is not None:
        fields.append("EventCapacity = %s")
        params.append(eventCapacity)
    if status is not None:
        fields.append("Status = %s")
        params.append(status)

    if not fields:
        return None

    connection = get_connection()
    cursor = connection.cursor()
    try:
        params.append(eventId)
        cursor.execute(
            f"UPDATE Events SET {', '.join(fields)} WHERE EventID = %s", params
        )
        connection.commit()
        return cursor.rowcount
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        cursor.close()
        connection.close()


# increment/decrement the denormalized confirmed count on the event row
def update_confirmed_count(eventId, delta):
    connection = get_connection()
    cursor = connection.cursor()
    try:
        cursor.execute(
            "UPDATE Events SET ConfirmedCount = GREATEST(0, ConfirmedCount + %s) WHERE EventID = %s",
            [delta, eventId],
        )
        connection.commit()
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        cursor.close()
        connection.close()


def delete_event(eventId):
    connection = get_connection()
    cursor = connection.cursor()
    try:
        cursor.execute("DELETE FROM Events WHERE EventID = %s", [eventId])
        connection.commit()
        return cursor.rowcount
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        cursor.close()
        connection.close()
