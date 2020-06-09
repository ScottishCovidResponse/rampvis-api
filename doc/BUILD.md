
```
npm install -g copyfiles
```

```bash
cd api-scrc-vis
pm2 stop api-scrc-vis
pm2 delete api-scrc-vis

git pull

npm run build 
npm run copy-csv
pm2 start --env production
```
