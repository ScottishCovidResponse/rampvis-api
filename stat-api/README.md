## Stat API - Python

Getting started

```
# if using conda
conda env create -f environment.yml
conda activate stat-api-scrc-vis


# start the server
./run.sh
```

## Deployment - Notes
``` bash
cd api-scrc-vis
git pull

cd stat-api
pip3 install -r requirements.txt

pm2 stop stat-api
pm2 delete stat-api
pm2 start run.py --name stat-api --interpreter python3
```
