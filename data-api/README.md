
# API - NodeJS

## Quick start

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

## Deployment - Notes 


```
npm install -g copyfiles
```

```bash
cd api-scrc-vis
git pull

cd data-api

pm2 stop data-api
pm2 delete data-api


npm install
npm run build 
pm2 start --env production
```
 
