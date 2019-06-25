from flask import Flask
from . import app as routes

app = Flask(__name__)

app.register_blueprint(routes.bp)
