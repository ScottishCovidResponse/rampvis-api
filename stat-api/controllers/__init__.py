from flask import Flask
from flask_cors import CORS

from controllers.scotland.region import region
from controllers.correlation import correlation

app = Flask(__name__, instance_relative_config=True)
CORS(app)

app.register_blueprint(region, url_prefix='/stat/v1/scotland/region')
app.register_blueprint(correlation, url_prefix='/stat/v1/correlation')