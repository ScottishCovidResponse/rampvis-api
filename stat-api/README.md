## Stat API - Python

Getting started-
```
# setup environment, e.g., using conda
conda activate stat-api-env

conda install --file requirements.txt

# start the server
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
