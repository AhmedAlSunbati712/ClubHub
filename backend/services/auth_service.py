import bcrypt
from config import ENV, get_connection
from datetime import datetime, timedelta, timezone
import jwt

def hash_password(plaintext_password):
    password_bytes = plaintext_password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password_bytes, salt)
    return hashed_password.decode("utf-8")

def verify_password(plaintext_pw, plaintext_hashed_pw):
    pw_bytes = plaintext_pw.encode("utf-8")
    hashed_pw_bytes = plaintext_hashed_pw.encode("utf-8")
    return bcrypt.checkpw(pw_bytes, hashed_pw_bytes)

def create_token(user):
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user["UserID"],
        "role": user["Role"],
        "iat": now,
        "exp": now + timedelta(hours=ENV.JWT_EXPIRY_HOURS)
    }
    return jwt.encode(payload, ENV.JWT_SECRET, algorithm="HS256")

def decode_token(token):
    return jwt.decode(token, ENV.JWT_SECRET, algorithms=["HS256"])

def get_user_by_email(email):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)
    try: 
        cursor.execute("SELECT * FROM Users WHERE Email = %s", [email])
        return cursor.fetchone()
    finally:
        cursor.close()
        connection.close()

def get_user_by_id(userId):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM Users WHERE UserID = %s", [userId])
        return cursor.fetchone()
    finally:
        cursor.close()
        connection.close()
