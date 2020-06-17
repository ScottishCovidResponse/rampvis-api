from controllers import app

@app.route('/stat/v1/health')
def index():
    return "Hello!"


if __name__ == '__main__':
    app.run(debug=True)
