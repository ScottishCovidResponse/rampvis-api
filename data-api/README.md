
# Data API

Key dependencies:

- Node version 12.17.0
- Mongodb 4.2.6

Start development instance:

```bash
npm install

export PORT=2000
export NODE_ENV='development'
npm run dev
```


---

**Note** In order to access the content or the structure of the `config` folder please contact administrator.


`config` folder and configuration file structure:

```
# folder structure

config
├── default.json
├── production.json
├── keys
│   ├── <name>.key            
│   └── <name>.key.pub


# default | production.json file structure

{
  "allowOrigins": [
    <list_of_allowed_origins>
  ],
  "apiUrl": "/api/v1",
  "mongodb": {
    "url": <mongodb_url>,
    "db": <dbname>,
    "collection": {
      "users": <collection_name>,
      "bookmarks": <collection_name>,
      "thumbnails": <collection_name>,
      "activities": <collection_name>,
      "pages": <collection_name>
    },
    "indexes": {
      "title": "text",
      "description": "text"
    }
  },
  "github": {
    "clientId": <value>,
    "clientSecret": <value>
    "callbackUrl": <value>,
    "successRedirect": <value>,
    "failureRedirect": <value>"
  },
  "jwt": {
    "algorithm": "RS256",
    "pvtKey": <name.key>,
    "pubKey": "config/keys/<name>.key.pub"
  },
  "session": {
    "secret": <secret>
  }
}

```
