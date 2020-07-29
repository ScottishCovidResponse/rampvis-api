## Stat API 

Key dependencies:
- Python
- Flask

Start development instance:

```
# tested in conda environment
conda env create -f environment.yml
conda activate rampvis-api


# start the server
./run.sh
```

## Deployment
 
Steps:

``` bash
cd rampvis-api
git pull

cd stat-api
pip3 install -r requirements.txt

pm2 stop stat-api
pm2 delete stat-api
pm2 start run.py --name stat-api --interpreter python3
```
