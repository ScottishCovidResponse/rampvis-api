from flask import Flask
from controllers.scotland.region import region

app = Flask(__name__, instance_relative_config=True)


app.register_blueprint(region, url_prefix='/stat/v1/scotland/region')
