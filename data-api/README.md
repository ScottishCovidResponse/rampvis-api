
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


## Deployment

Steps:

```bash
cd rampvis-api
git pull
cd data-api

pm2 stop data-api
pm2 delete data-api

npm install
npm run build 
pm2 start --env production
```
 
