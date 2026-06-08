"""
app.py     Ahmed Al Sunbati
CS61, Spring 2026

Description: Flask app for the backend. Loads in all blueprints, registers them and starts listening on the given port.
AI-Citation: Authorization headers were being dropped on requests from the frontend to the backend. Used AI to debug and
             added supports_credentials=True to the flask cross-origin resource sharing to allow the browser to send
             HTTP Auth headers across different domains.
"""

from flask import Flask
from flask_cors import CORS
from routes import all_blueprints
from config import ENV


def create_app():
    app = Flask(__name__)
    CORS(app, origins=["http://localhost:5173"], supports_credentials=True)

    for blueprint in all_blueprints:
        app.register_blueprint(blueprint)
    return app


if __name__ == "__main__":
    app = create_app()
    app.run(port=ENV.PORT)
