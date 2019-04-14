from flask import Flask
from flask_cors import CORS
from . import app as routes

app = Flask(__name__)

CORS(app)

app.register_blueprint(routes.bp)
