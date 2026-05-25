import os
from dotenv import load_dotenv
load_dotenv()


def load_env_var(name, default = None):
    value = os.getenv(name)
    if not value and not default:
        raise RuntimeError(f'Missing required environment variable: {name}')
    if not value:
        return default
    return value

class ENV:
    PORT = load_env_var("PORT", 5000)
    
    DB_HOST = load_env_var("DB_HOST", "localhost")
    DB_PORT = load_env_var("DB_PORT", 3306)
    DB_USER = load_env_var("DB_USER")
    DB_PASSWORD = load_env_var("DB_PASSWORD")
    DB_NAME = load_env_var("DB_NAME", "clubhub")
    
    JWT_SECRET = load_env_var("JWT_SECRET")
    JWT_EXPIRY_HOURS = load_env_var("JWT_EXPIRY_HOURS", 24)