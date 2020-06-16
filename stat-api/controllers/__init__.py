from flask import Flask
from flask_cors import CORS

from controllers.scotland.region import region

app = Flask(__name__, instance_relative_config=True)
CORS(app)

app.register_blueprint(region, url_prefix='/stat/v1/scotland/region')
