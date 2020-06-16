## Analytics Python

Getting started-
```
flask run
```

## Deployment - Notes
``` bash
pm2 start app.py --name stat-api --interpreter python3
```

## APIs

```
http://127.0.0.1:5000/stat/v1/scotland/region/cumulative/pearson-correlation
http://127.0.0.1:5000/stat/v1/scotland/region/cumulative/f-test
http://127.0.0.1:5000/stat/v1/scotland/region/cumulative/mse
```