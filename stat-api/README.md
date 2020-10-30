## Stat API 

Key dependencies:
- Python 3.x
- Flask

Start development instance:

```
conda remove --name data-mining-api --all
conda env create -f environment.yml
conda activate data-mining-api

# development start
./run-dev.sh
```

Open http://127.0.0.1:5000/api-py/v1/health to check health.

