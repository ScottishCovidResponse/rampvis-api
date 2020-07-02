from os import environ

from app import create_app
from config import config_dict

get_config_mode = environ.get('', 'Debug')
config_mode = config_dict[get_config_mode.capitalize()]

app = create_app(config_mode)

if __name__ == '__main__':
    app.run()


@app.route('/stat/v1/health')
def index():
    return "Hello!"
