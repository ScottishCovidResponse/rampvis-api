from os import environ
from app import create_app
from config import config_by_name

env = environ.get('FLASK_ENV', 'development')
app = create_app(config_by_name[env])

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=3000, threaded=True)


@app.route('/stat/v1/hello')
def index():
    return "Hello World!"
