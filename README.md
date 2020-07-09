# Projects

- data-api - NodeJS based REST API for data
- stat-api - Python/Flask based REST API for housekeeping functions   

# List of APIs  

## COVID 19 data by NHS Board 26 May 2020 
The data from the file `COVID-19+data+by+NHS+Board+26+May+2020.xlsx` can be accessed via the following APIs


```bash
curl --location --request GET 'http://vis.scrc.uk/api/v1/scotland/<table>'
curl --location --request GET 'http://vis.scrc.uk/api/v1/scotland/<table>/:<region>'
```

- Accepted `table` values `cumulative, icupatients, hospconfirmed, hospsuspected`


- Accepted `region` values  `nhs_ayrshire_arran, nhs_borders, nhs_dumfries_galloway, nhs_fife, nhs_forth_valley, nhs_grampian, nhs_greater_glasgow_clyde, nhs_highland, nhs_lanarkshire, nhs_lothian,
nhs_orkney, nhs_shetland, nhs_tayside, nhs_western_isles_scotland, golden_jubilee_nationalhospital, scotland`


These APIs to be deprecated

**Updated APIs**

```
<url>/api/v1/scotland/?table=<table_name>
<url>/api/v1/scotland/?table=<table_name>&region=<region_name>
```
Accepted values of
- `url`: `http://vis.scrc.uk/api/v1`
- `table_name`: `cumulative_cases`, `hospital_confirmed`, `hospital_suspected`, `icu_patients`
- `region_name`:  `nhs_ayrshire_arran, nhs_borders, nhs_dumfries_galloway, nhs_fife, nhs_forth_valley, nhs_grampian, nhs_greater_glasgow_clyde, nhs_highland, nhs_lanarkshire, nhs_lothian,
nhs_orkney, nhs_shetland, nhs_tayside, nhs_western_isles_scotland, golden_jubilee_nationalhospital, scotland`


### Housekeeping / Stat APIs

```bash
curl --location --request GET <endpoints>

# available endpoints
http://vis.scrc.uk/stat/v1/scotland/region/cumulative/mse
http://vis.scrc.uk/stat/v1/scotland/region/cumulative/f-test
http://vis.scrc.uk/stat/v1/scotland/region/cumulative/pearson-correlation
```

### Correlation metrics
#### API
The API returns correlation metrics between two variables. The end point is `http://vis.scrc.uk/stat/v1/correlation/`. It takes on 4 parameters:
- `var1` defines the first variable as `country/filename`
  - `country`: `scotland`
  - `filename`: `cumulative_cases`, `hospital_confirmed`, `hospital_suspected`, `icu_patients`
- `var2` defines the second variable as `country/filename`
- `metrics` a list of metrics as a string separated by comma: `ZNCC`, `pearsonr`, `spearmanr`, `kendalltau`, `SSIM`, `PSNR`, `MSE`, `NRMSE`, `ME`, `MAE`, `MSLE`, `MedAE`, `f-test`
- `smooth` (optional, default is `none`) [smooth the data](https://scipy-cookbook.readthedocs.io/items/SignalSmooth.html): `none`, `flat`, `hanning`, `hamming`, `bartlett`, `blackman`

#### Example
http://vis.scrc.uk/stat/v1/correlation/?var1=scotland/hospital_confirmed&var2=scotland/hospital_confirmed&metrics=zncc,pearsonr,f-test&smooth=hanning returns ZNCC, Pearson and F-test metrics between hospital_confirmed and hospital_confirmed in Scotland and the data is smoothed using Hanning option.

#### Output
The API return a JSON object as follows
```
{ 
  var1_names: [columns in var1 file], 
  var2_names: [columns in var2 file],
  metric1: [2d array],
  metric2: [2d array]
}

```

## Covid Deaths Data Week 20 

The data from the file `covid-deaths-data-week-20.xlsx` can be accessed via the following APIs

```bash
curl --location --request GET <endpoints> 

# available endpoints
http://vis.scrc.uk/api/v1/scotland/covid-deaths/data-week/gender-age
http://vis.scrc.uk/api/v1/scotland/covid-deaths/data-week/location
http://vis.scrc.uk /api/v1/scotland/covid-deaths/data-week/type
```
