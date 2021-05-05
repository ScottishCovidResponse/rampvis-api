
# Data API

## Development 

Prerequisites

- Node version 12.17.0
- `data-api/config` - please contact GitHub administrator for access
- Mongodb 4.2.6
- Elasticsearch 

Start a local instance of Elasticsearch single node.
```bash
docker run -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:7.12.1
```

Multi-node cluster
```bash
docker compose -f docker-compose-dev-es.yml up -d
docker compose -f docker-compose-dev-es.yml [stop | start | rm]
```

Start development instance:

```bash
npm install

export PORT=2000
export NODE_ENV='development'
npm run dev
```

### Config

`data-api/config` folder and configuration files structure:

```bash
config
├── default.json
├── production.json
├── keys
│   ├── xxx.key            
│   └── xxx.key.pub

```

`data-api/config/default.json` & `data-api/config/production.json` file structure/example:

```json
{
  "allowOrigins": [
    "http://vis.scrc.uk",
    "http://0.0.0.0:5000",
    "http://localhost:5000",
    "xxx"
  ],
  "mongodb": {
    "url": "mongodb+srv://xxx",
    "db": "rampvis",
    "collection": {
      "users": "users",
      "bookmarks": "bookmarks",
      "thumbnails": "thumbnails",
      "activities": "activities",
      "onto_page": "onto_page",
      "onto_vis": "onto_vis",
      "onto_binding": "onto_binding",
      "onto_data": "onto_data",
      "pages": "pages"
    }
  },
  "es": {
    "host": "http://localhost:9200",
    "index": {
      "onto_page": "onto_page"
    }
  },
  "github": {
    "clientId": "xxx",
    "clientSecret": "xxx",
    "callbackUrl": "http://localhost:2000/api/v1/auth/github-callback",
    "successRedirect": "http://localhost:5000/github-callback",
    "failureRedirect": "http://localhost:5000/error-403"
  },
  "jwt": {
    "algorithm": "RS256",
    "pvtKey": "config/keys/xxx.key",
    "pubKey": "config/keys/xxx.key.pub"
  },
  "session": {
    "secret": "xxx"
  },
  "urlCode" :{
    "API_JS": "http://localhost:2000/api/v1",
    "API_PY": "http://localhost:3000/stat/v1"
  }
}
```
