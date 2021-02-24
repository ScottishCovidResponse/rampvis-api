## Stat API 

Requirements
- Python 3.8.3
- conda 

Start development instance

```
conda remove --name rampvis-api --all
conda env create -f environment.yml
conda activate rampvis-api

# development start
./run-dev.sh
```

Open http://localhost:3000/stat/v1/hello to check!

