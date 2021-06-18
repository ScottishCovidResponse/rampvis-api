# Stat API 

## Development

Requirements

- Python 3.8.3
- `data-api/config`
- Mongodb
- Elasticsearch 

Setting up a Python environment.

```bash
pip install virtualenv
virtualenv venv
source ./venv/bin/activate
pip install -r requirements.txt
```

Start a development instance.

```bash
source ./venv/bin/activate
uvicorn app.main:app --reload --port 3000
```

Open: http://localhost:3000/stat/v1/ping to ping the server.


## Config

Described in [README.md]( ../data-api/README.md)