# About

APIs for data, processing functions, algorithms and propagation. 

## Getting Started

### Prerequisites

- Python 3.9.2
- MongoDB, Elasticsearch [see](../README.md)

### Start Development Instance

Start an instance in host machine:

```bash
# create python 3.9.* environment 
pip install virtualenv
virtualenv venv

# Linux/MAC
source ./venv/bin/activate
# Windows-11
.\venv\Scripts\activate

# install dependencies
pip install -r requirements.txt

# start the server
uvicorn app.main:app --reload --port 4010 --host 0.0.0.0
```


## API Document

In development, the API documentation and testing endpoints are automatically generated and can be accessed via: http://localhost:4010/docs
![Screenshot](./docs/apis.png)

