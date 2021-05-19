
# Data API

## Development 

### Requirements

- Node version 14.15.0
- `data-api/config` - please contact a developer for getting access
- Mongodb
- Elasticsearch 

Start a development instance.

```bash
npm install
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
