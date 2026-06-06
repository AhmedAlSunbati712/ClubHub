from config import get_connection
from .auth_service import hash_password
from datetime import datetime


def create_user(name, email, role, password):
    """
    Description: Create a user given their name, email and role
    """
    hashed_password = hash_password(password)
    connection = get_connection()
    cursor = connection.cursor()
    try:
        cursor.execute(
            "INSERT INTO Users (Name, Email, Role, HashedPassword) VALUES (%s, %s, %s, %s)",
            [name, email, role, hashed_password],
        )
        connection.commit()
        return cursor.lastrowid
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        cursor.close()
        connection.close()


def get_user_by_id(userId):
    """
    Description: Get a user by their id.
    """

    connection = get_connection()
    cursor = connection.cursor(
        dictionary=True
    )  # dictionary = True to return a dictionary instead of a tuple
    try:
        cursor.execute(
            "SELECT UserID, Name, Email, Role FROM Users WHERE UserID = %s", [userId]
        )
        return cursor.fetchone()
    except Exception as e:
        raise e
    finally:
        cursor.close()
        connection.close()


def get_users(userId=None, name=None, email=None, userRole=None):
    """
    Description: Get users given a query that combines in set of fields
    """

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        query = "SELECT UserID, Name, Email, Role FROM Users WHERE 1=1"
        params = []

        if userId:
            query += " AND UserID = %s"
            params.append(userId)
        if name:
            query += " AND Name LIKE %s"
            params.append(f"%{name}%")
        if email:
            query += " AND Email LIKE %s"
            params.append(f"%{email}%")
        if userRole:
            query += " AND Role = %s"
            params.append(userRole)

        cursor.execute(query, params)
        return cursor.fetchall()
    except Exception as e:
        raise e
    finally:
        cursor.close()
        connection.close()


def update_user(userId, name=None, email=None, role=None, password=None):
    """
    Description: Update a set of field for a user given their id.
    """

    if not name and not email and not role and not password:
        return None

    connection = get_connection()
    cursor = connection.cursor()
    try:
        fields = []
        params = []

        if name:
            fields.append("Name = %s")
            params.append(name)
        if email:
            fields.append("Email = %s")
            params.append(email)
        if role:
            fields.append("Role = %s")
            params.append(role)
        if password:
            fields.append("HashedPassword = %s")
            params.append(hash_password(password))

        params.append(userId)
        cursor.execute(
            f"UPDATE Users SET {', '.join(fields)} WHERE UserID = %s", params
        )
        connection.commit()
        return cursor.rowcount
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        cursor.close()
        connection.close()


def delete_user(userId):
    """
    Description: Delete a record for a user given their id.
    """

    connection = get_connection()
    cursor = connection.cursor()
    # TODO: We need to enforce the business rule here that a user account can't be deleted if they are the sole office of a club
    try:
        cursor.execute("DELETE FROM Users WHERE UserID = %s", [userId])
        connection.commit()
        return cursor.rowcount
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        cursor.close()
        connection.close()


def get_user_rsvps(userId: int):
    connection = get_connection()
    cursor = connection.cursor(dictionary = True)
    
    try:
            query = """
              SELECT
                RSVPs.EventID,
                RSVPs.RSVPStatus,
                Events.Title,
                Events.EventDateTime,
                Events.Status,
                Clubs.ClubName,
                Locations.Building,
                Locations.Room
              FROM RSVPs
              JOIN Events ON RSVPs.EventID = Events.EventID
              JOIN Clubs ON Events.ClubID = Clubs.ClubID
              JOIN Locations ON Events.LocationID = Locations.LocationID
              WHERE RSVPs.UserID = %s
              AND Events.EventDateTime >= %s
              AND Events.Status NOT IN ('Cancelled', 'Completed')
            """
            cursor.execute(query, [userId, datetime.now()])
            user_rsvps = cursor.fetchall()
            return user_rsvps, len(user_rsvps)
    except Exception as e:
        raise e
    finally:
        cursor.close()
        connection.close()
