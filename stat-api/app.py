from controllers import app

@app.route('/controllers/health')
def index():
    return "Hello Analytics"


if __name__ == '__main__':
    app.run(debug=True)
