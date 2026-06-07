# handles the admin dashboard endpoints — platform-wide metrics, admin only

from flask import request, jsonify
from services import admin_service


def get_stats():
    try:
        totals = admin_service.get_totals()
        top_clubs = admin_service.get_top_clubs()
        upcoming_events = admin_service.get_upcoming_events()
        return (
            jsonify(
                {
                    "totals": totals,
                    "topClubs": top_clubs,
                    "upcomingEvents": upcoming_events,
                }
            ),
            200,
        )
    except Exception as e:
        return jsonify({"Error": f"Failed to fetch admin stats: {e}"}), 500


def get_top_clubs():
    try:
        limit = request.args.get("limit", default=5, type=int)
        top_clubs = admin_service.get_top_clubs(limit)
        return jsonify(top_clubs), 200
    except Exception as e:
        return jsonify({"Error": f"Failed to fetch top clubs: {e}"}), 500
