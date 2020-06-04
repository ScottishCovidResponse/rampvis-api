
# API 

## Quick start

### Using Docker

First, [install docker-compose](https://docs.docker.com/compose/install/).

Run `docker-compose up`. This will start 3 containers:

- a MongoDB instance
- the API server (on port 2000)
- a MongoExpress UI for interacting with the MongoDB isntance (on port 8081)

When the MongoDB container is created, a test user will be automatically created (user: `admin@test.com` and password: `pass123`).

You can then start [`ui-src-vis`](https://github.com/ScottishCovidResponse/ui-scrc-vis). 

To rebuild after making changes to the code, run `docker-compose build`.

The username and password for MongoDB are set in the [`docker-compose.yml`](./docker-compose.yml) file; these must match
those in the connection string defined in `config/default.josn`, `config/production.json`, `config/staging.json`.


### Not using Docker

Key dependencies:

- Node version 12.17.0
- Mongodb 4.2.6

Start development instance:

```bash
npm install

export PORT=2000
export NODE_ENV='development' # other options are 'staging', 'production'
npm run dev
```

Inject seed data:

```bash
npm run dev-seed
```

This will create a test user to allow login, user: `admin@test.com` and password: `pass123`
