## Stat API - Python

Getting started-
```
flask run
```

## Deployment - Notes
``` bash
cd api-scrc-vis
git pull

cd stat-api

pip3 install -r requirements.txt

pm2 stop stat-api
pm2 start app.py --name stat-api --interpreter python3
```
