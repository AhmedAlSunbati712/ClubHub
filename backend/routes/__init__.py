from .auths import bp as auth_bp
from .clubs import bp as clubs_bp
from .memberships import bp as memberships_bp
from .locations import bp as locations_bp
from .users import bp as users_bp
from .events import bp as events_bp, clubs_bp as clubs_events_bp
from .rsvps import bp as rsvps_bp
from .checkins import bp as checkins_bp

all_blueprints = [auth_bp, clubs_bp, memberships_bp, locations_bp, users_bp, events_bp, clubs_events_bp, rsvps_bp, checkins_bp]