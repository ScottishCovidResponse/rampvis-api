## Stat API - Python

Getting started
```
# setup environment, e.g., using conda
conda activate stat-api-env

conda install --file requirements.txt

# start the server
flask run
```

## Simulation of stream data
### Overview
A scheduler is used to simulate a data stream. A job will be run every 5 seconds to:
- initially, the **current date** will be set to 1st April 2020
- copy data for `csv-data/scotland` to `csv-data/scotland_dynamic` up to the current date
- the current date will be increased by one
- the stream will stop when it reaches the last available date (26th May 2020).

### How to run
- `/stat/v1/stream_data/start` to start or reset the stream from the first day (1st April 2020)
- `/stat/v1/stream_data/stop` to pause the stream
- `/stat/v1/stream_data/resume` to resume the stream (keep the current date as it is)
- `/stat/v1/stream_data/status` displays the status of the stream

## Deployment - Notes
``` bash
cd api-scrc-vis
git pull

cd stat-api

pip3 install -r requirements.txt

pm2 stop stat-api
pm2 start app.py --name stat-api --interpreter python3
```
