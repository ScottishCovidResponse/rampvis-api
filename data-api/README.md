
# Data API
APIs for Authentication, user management, ontology operations, data service, etc.

## Development 

Requirements

- Node version 14.17.1
- `data-api/config`
- Mongodb
- Elasticsearch 

Start a development instance.

```bash
npm install
npm run dev
```

### Config

We did not share the folder `data-api/config` due to security reasons. You need to create a `data-api/config` folder and its contensts following the structure mentioned below:

```bash
config
├── default.json
├── production.json
├── keys
│   ├── xxx.key            
│   └── xxx.key.pub

```

The `data-api/config/default.json` or the `data-api/config/production.json` file structure (example) as follows:

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

If you have any queries or need any help please contact one of the software engineers of this project. 
