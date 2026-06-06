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
