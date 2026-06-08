# Josephine Conley, CS61, Spring 2026
# database queries for membership creation and lookups
# used Claude to test and find service bugs, then tested bugs in Postman to pinpoint fixes

from config import get_connection
from models.enums import ClubRole, MembershipStatus


def create_membership(userId, clubId, role, status):
    connection = get_connection()
    cursor = connection.cursor()
    try:
        cursor.execute(
            "INSERT INTO Memberships (UserID, ClubID, Role, Status, JoinDate) VALUES (%s, %s, %s, %s, CURDATE())",
            [userId, clubId, role, status],
        )
        connection.commit()
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        cursor.close()
        connection.close()


def get_membership(userId, clubId):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT m.UserID, m.ClubID, u.Name, u.Email, m.Role, m.Status, m.JoinDate FROM Memberships m JOIN Users u ON u.UserID = m.UserID WHERE m.UserID = %s AND m.ClubID = %s",
            [userId, clubId],
        )
        return cursor.fetchone()
    finally:
        cursor.close()
        connection.close()


def get_memberships_by_club(clubId):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("SELECT m.UserID, m.ClubID, u.Name, u.Email, m.Role, m.Status, m.JoinDate FROM Memberships m JOIN Users u ON u.UserID = m.UserID WHERE m.ClubID = %s", [clubId])
        return cursor.fetchall()
    finally:
        cursor.close()
        connection.close()


def get_memberships_by_user(userId):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM Memberships WHERE UserID = %s", [userId])
        return cursor.fetchall()
    finally:
        cursor.close()
        connection.close()


def update_membership(userId, clubId, role=None, status=None):
    fields = []
    params = []

    if role is not None:
        fields.append("Role = %s")
        params.append(role)
    if status is not None:
        fields.append("Status = %s")
        params.append(status)

    if not fields:
        return None

    connection = get_connection()
    cursor = connection.cursor()
    try:
        params.extend([userId, clubId])
        cursor.execute(
            f"UPDATE Memberships SET {', '.join(fields)} WHERE UserID = %s AND ClubID = %s",
            params,
        )
        connection.commit()
        return cursor.rowcount
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        cursor.close()
        connection.close()


def demote_other_presidents(clubId, exclude_user_id):
    connection = get_connection()
    cursor = connection.cursor()
    try:
        cursor.execute(
            "UPDATE Memberships SET Role = %s WHERE ClubID = %s AND Role = %s AND UserID != %s",
            [ClubRole.OFFICER, clubId, ClubRole.PRESIDENT, exclude_user_id],
        )
        connection.commit()
        return cursor.rowcount
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        cursor.close()
        connection.close()


def club_has_active_officer(clubId, exclude_user_id=None):
    connection = get_connection()
    cursor = connection.cursor()
    try:
        if exclude_user_id is not None:
            cursor.execute(
                "SELECT COUNT(*) FROM Memberships WHERE ClubID = %s AND Role IN (%s, %s) AND Status = %s AND UserID != %s",
                [clubId, ClubRole.OFFICER, ClubRole.PRESIDENT, MembershipStatus.ACTIVE, exclude_user_id],
            )
        else:
            cursor.execute(
                "SELECT COUNT(*) FROM Memberships WHERE ClubID = %s AND Role IN (%s, %s) AND Status = %s",
                [clubId, ClubRole.OFFICER, ClubRole.PRESIDENT, MembershipStatus.ACTIVE],
            )
        count = cursor.fetchone()[0]
        return count > 0
    finally:
        cursor.close()
        connection.close()


def delete_membership(userId, clubId):
    connection = get_connection()
    cursor = connection.cursor()
    try:
        cursor.execute(
            "DELETE FROM Memberships WHERE UserID = %s AND ClubID = %s",
            [userId, clubId],
        )
        connection.commit()
        return cursor.rowcount
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        cursor.close()
        connection.close()

def get_memberships_count(clubId: int):
    connection = get_connection()
    cursor = connection.cursor(dictionary = True)
    try:
        query = "SELECT Count(*) as memberships_count FROM Memberships WHERE ClubID = %s"
        cursor.execute(query, [clubId])
        return cursor.fetchone()
    except Exception as e:
        raise e
    finally:
        cursor.close()
        connection.close()