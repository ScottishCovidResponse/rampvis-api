## Stat API 

## Requirements
- Python 3.8.3
- conda 
- virtualenv


```bash
pip install virtualenv
virtualenv venv
source ./venv/bin/activate
pip install -r requirements.txt
```

## Running the Project in Development

```bash
source ./venv/bin/activate

uvicorn app.main:app --reload --port 3000
```

Open: http://localhost:3000/stat/v1/ping to ping the server.
