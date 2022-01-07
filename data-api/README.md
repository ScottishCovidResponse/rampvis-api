# About

APIs for data, processing functions, algorithms and propagation. 

## Getting Started

### Prerequisites

- Python >3.9.2
- MongoDB, Elasticsearch [see](../README.md)

### Start Development Instance

Start an instance in host machine:

```bash
# create python 3.9.* environment 
pip install virtualenv
virtualenv venv
source ./venv/bin/activate
pip install -r requirements.txt

# start the server
source ./venv/bin/activate
uvicorn app.main:app --reload --port 4010 --host 0.0.0.0
```