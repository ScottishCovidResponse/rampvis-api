## Stat API 

Requirements
- Python 3.8.3
- conda 


Conda environment:

```
conda remove --name rampvis-api --all
conda env create -f environment.yml
conda activate rampvis-api
```

pip environment:

```bash
pip install virtualenv
virtualenv venv
source ./venv/bin/activate
pip install -r requirements.txt
```

Start development instance
```bash
./run-dev.sh
```

Open http://localhost:3000/stat/v1/hello to check!






