# Josephine Conley, CS61, Spring 2026
# database queries for club creation and lookups, checking to make sure club is active/has at least one officer
# used Claude to test and find service bugs, then tested bugs in Postman to pinpoint fixes

from config import get_connection
from models.enums import ClubRole, MembershipStatus


def club_is_active(clubId):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute(
            """SELECT COUNT(*) as count FROM Memberships 
               WHERE ClubID = %s 
               AND Status = %s 
               AND Role IN (%s, %s)""",
            [clubId, MembershipStatus.ACTIVE, ClubRole.OFFICER, ClubRole.PRESIDENT],
        )
        row = cursor.fetchone()
        return row["count"] > 0
    finally:
        cursor.close()
        connection.close()


def create_club(name, description, category, status):
    connection = get_connection()
    cursor = connection.cursor()
    try:
        cursor.execute(
            "INSERT INTO Clubs (ClubName, Description, Category, Status) VALUES (%s, %s, %s, %s)",
            [name, description, category, status],
        )
        connection.commit()
        return cursor.lastrowid
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        cursor.close()
        connection.close()


def get_club(clubId):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM Clubs WHERE ClubID = %s", [clubId])
        return cursor.fetchone()
    finally:
        cursor.close()
        connection.close()


def get_all_clubs(name=None, category=None):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        query = "SELECT * FROM Clubs WHERE 1=1"
        params = []
        if name:
            query += " AND ClubName LIKE %s"
            params.append(f"%{name}%")
        if category:
            query += " AND Category = %s"
            params.append(category)
        cursor.execute(query, params)
        return cursor.fetchall()
    finally:
        cursor.close()
        connection.close()


def update_club(clubId, name=None, description=None, category=None, status=None):
    fields = []
    params = []

    if name is not None:
        fields.append("ClubName = %s")
        params.append(name)
    if description is not None:
        fields.append("Description = %s")
        params.append(description)
    if category is not None:
        fields.append("Category = %s")
        params.append(category)
    if status is not None:
        fields.append("Status = %s")
        params.append(status)

    if not fields:
        return None

    connection = get_connection()
    cursor = connection.cursor()
    try:
        params.append(clubId)
        cursor.execute(
            f"UPDATE Clubs SET {', '.join(fields)} WHERE ClubID = %s", params
        )
        connection.commit()
        return cursor.rowcount
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        cursor.close()
        connection.close()


def delete_club(clubId):
    connection = get_connection()
    cursor = connection.cursor()
    try:
        cursor.execute("DELETE FROM Clubs WHERE ClubID = %s", [clubId])
        connection.commit()
        return cursor.rowcount
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        cursor.close()
        connection.close()


def get_club_officers(clubId):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        query = """
            SELECT Users.UserID, Users.Name, Memberships.Role
            FROM Clubs
            JOIN Memberships ON Clubs.ClubID = Memberships.ClubID
            JOIN Users ON Users.UserID = Memberships.UserID
            WHERE Clubs.ClubID = %s
              AND Memberships.Status = %s
              AND Memberships.Role IN (%s, %s)
        """
        cursor.execute(
            query,
            [clubId, MembershipStatus.ACTIVE, ClubRole.OFFICER, ClubRole.PRESIDENT],
        )
        return cursor.fetchall()
    except Exception as e:
        raise e
    finally:
        cursor.close()
        connection.close()
