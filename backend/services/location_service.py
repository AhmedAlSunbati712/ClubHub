# Josephine Conley, CS61, Spring 2026
# database queries for location creation and lookups, checking to make sure location exists
# used Claude to test and find service bugs, then tested bugs in Postman to pinpoint fixes

from config import get_connection

def valid_location(locationId):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT COUNT(*) as count FROM Events WHERE LocationID = %s",
            [locationId]
        )
        row = cursor.fetchone()
        return row["count"] > 0
    finally:
        cursor.close()
        connection.close()

def create_location(building,room,capacity):
    connection = get_connection()
    cursor = connection.cursor()
    try:
        cursor.execute(
            "INSERT INTO Locations (Building, Room, Capacity) VALUES (%s, %s, %s)",
            [building,room,capacity]
        )
        connection.commit()
        return cursor.lastrowid
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        cursor.close()
        connection.close()

def get_location(locationId):
	connection = get_connection()
	cursor = connection.cursor(dictionary=True)
	try:
		cursor.execute("SELECT * FROM Locations WHERE LocationID = %s", [locationId])
		return cursor.fetchone()
	finally:
		cursor.close()
		connection.close()

def get_locations(building=None, room=None):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        query = "SELECT * FROM Locations WHERE 1=1"
        params = []
        if building:
            query += " AND Building = %s"
            params.append(building)
        if room:
            query += " AND Room LIKE %s"
            params.append(f"%{room}%")
        cursor.execute(query, params)
        return cursor.fetchall()
    finally:
        cursor.close()
        connection.close()

def update_location(locationId, building=None, room=None, capacity=None):
    fields = []
    params = []

    if building is not None:
        fields.append("Building = %s")
        params.append(building)
    if room is not None:
        fields.append("Room = %s")
        params.append(room)
    if capacity is not None:
        fields.append("Capacity = %s")
        params.append(capacity)

    if not fields:
        return None

    connection = get_connection()
    cursor = connection.cursor()
    try:
        params.append(locationId)
        cursor.execute(f"UPDATE Locations SET {', '.join(fields)} WHERE LocationID = %s", params)
        connection.commit()
        return cursor.rowcount
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        cursor.close()
        connection.close()

def delete_location(locationId):
    connection = get_connection()
    cursor = connection.cursor()
    try:
        cursor.execute("DELETE FROM Locations WHERE LocationID = %s", [locationId])
        connection.commit()
        return cursor.rowcount
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        cursor.close()
        connection.close()
