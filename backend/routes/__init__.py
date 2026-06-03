from .users import bp as users_bp
from .events import bp as events_bp, clubs_bp as clubs_events_bp
from .rsvps import bp as rsvps_bp
from .checkins import bp as checkins_bp

all_blueprints = [users_bp, events_bp, clubs_events_bp, rsvps_bp, checkins_bp]