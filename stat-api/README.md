# Stat API 

## Development

Requirements

- Python 3.9.2
- `data-api/config`
- Mongodb
- Elasticsearch 

Setting up a Python environment.

```bash
conda create -n py-3.9.2 python=3.9.2
conda activate py-3.9.2
python --version
	Python 3.9.2
    
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