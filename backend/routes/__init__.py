"""
app.py     Ahmed Al Sunbati
CS61, Spring 2026

Description: Imports all blueprints so that the flask app can import them and register them to start listening for requests
             on the routes defined by them.
"""
from .users import bp as users_bp
from .events import bp as events_bp, clubs_bp as clubs_events_bp
from .rsvps import bp as rsvps_bp
from .checkins import bp as checkins_bp
from .auths import bp as auth_bp
from .clubs import bp as clubs_bp
from .memberships import bp as memberships_bp
from .locations import bp as locations_bp
from .admin import bp as admin_bp

all_blueprints = [
    users_bp,
    events_bp,
    clubs_events_bp,
    rsvps_bp,
    checkins_bp,
    auth_bp,
    clubs_bp,
    memberships_bp,
    locations_bp,
    admin_bp,
]
