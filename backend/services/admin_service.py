# database queries for the admin dashboard — platform-wide metrics

from config import get_connection
from models.enums import UserRole, MembershipStatus


def get_totals():
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            SELECT
                (SELECT COUNT(*) FROM Clubs) AS clubs,
                (SELECT COUNT(*) FROM Events) AS events,
                (SELECT COUNT(*) FROM Users WHERE Role = %s) AS students,
                (SELECT COUNT(*) FROM Memberships) AS memberships
            """,
            [UserRole.STUDENT],
        )
        return cursor.fetchone()
    finally:
        cursor.close()
        connection.close()


def get_top_clubs(limit=5):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            SELECT
                Clubs.ClubID AS id,
                Clubs.ClubName AS name,
                COUNT(Memberships.UserID) AS memberCount
            FROM Clubs
            LEFT JOIN Memberships
                ON Clubs.ClubID = Memberships.ClubID
                AND Memberships.Status = %s
            GROUP BY Clubs.ClubID, Clubs.ClubName
            ORDER BY memberCount DESC, Clubs.ClubName ASC
            LIMIT %s
            """,
            [MembershipStatus.ACTIVE, limit],
        )
        return cursor.fetchall()
    finally:
        cursor.close()
        connection.close()


def get_upcoming_events(limit=5):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            SELECT
                Events.EventID AS id,
                Events.Title AS title,
                Clubs.ClubName AS club,
                Events.EventDateTime AS date,
                Events.ConfirmedCount AS filled,
                Events.EventCapacity AS capacity
            FROM Events
            JOIN Clubs ON Events.ClubID = Clubs.ClubID
            WHERE Events.EventDateTime >= NOW()
            ORDER BY Events.EventDateTime ASC
            LIMIT %s
            """,
            [limit],
        )
        return cursor.fetchall()
    finally:
        cursor.close()
        connection.close()
