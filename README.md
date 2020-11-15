# Projects
- [data-api](https://github.com/ScottishCovidResponse/rampvis-api/tree/master/data-api) - REST API for data
- [stat-api](https://github.com/ScottishCovidResponse/rampvis-api/tree/master/stat-api) - REST API for stat/housekeeping functions   

# Data APIs 

## Source 1 
 
Source name: `COVID-19+data+by+NHS+Board+22+July+2020.xlsx` 

### Endpoints
```
<url>/api/v1/scotland/nhs-board?table=<table_name>
<url>/api/v1/scotland/nhs-board?table=<table_name>&region=<region_name>
```
Accepted values of
- url: http://vis.scrc.uk
- table_name: cumulative_cases, hospital_confirmed, hospital_suspected, icu_patients
- region_name:  nhs_ayrshire_arran, nhs_borders, nhs_dumfries_galloway, nhs_fife, nhs_forth_valley, nhs_grampian, nhs_greater_glasgow_clyde, nhs_highland, nhs_lanarkshire, nhs_lothian, nhs_orkney, nhs_shetland, nhs_tayside, nhs_western_isles_scotland, golden_jubilee_nationalhospital, scotland

### Dynamic data
Same as above but use `scotland_dynamic` instead of `scotland`. The data will be cycled from 1st April to 26th May every 3 seconds.


## Source 2

Source name:  `covid-deaths-data-week-30.xlsx`

### Endpoints

```
<url>/api/v1/scotland/covid-deaths/?table=<table_name>&group=<group_name>
```
Accepted values of
- url: http://vis.scrc.uk
- table_name: covid_deaths 
- group_name: gender_age, location, type

 

# Stat APIs 

## Source 1

Source name: `COVID 19 data by NHS Board 26 May 2020 XL sheet`

`url`: `http://vis.scrc.uk`

### Endpoints

```
<url>/stat/v1/scotland/nhs-board/?table=<table_name>&metrics=<metrics>
```
Accepted values of
- table_name: cumulative_cases
- metrics: mse, f_test, pearson_correlation

 

## Correlation metrics of static (latest) data

### Endpoints

The API returns correlation metrics between two variables. The end point is `http://vis.scrc.uk/stat/v1/correlation/`. It takes on 4 parameters:
- `var1` defines the first variable as `country/filename`
  - `country`: `scotland`
  - `filename`: `cumulative_cases`, `hospital_confirmed`, `hospital_suspected`, `icu_patients`
- `var2` defines the second variable as `country/filename`
- `metrics` a list of metrics as a string separated by comma: `ZNCC`, `pearsonr`, `spearmanr`, `kendalltau`, `SSIM`, `PSNR`, `MSE`, `NRMSE`, `ME`, `MAE`, `MSLE`, `MedAE`, `f-test`
- `smooth` (optional, default is `none`) [smooth the data](https://scipy-cookbook.readthedocs.io/items/SignalSmooth.html): `none`, `flat`, `hanning`, `hamming`, `bartlett`, `blackman`

**Output**
The API return a JSON object as follows
```
{ 
  var1_names: [columns in var1 file], 
  var2_names: [columns in var2 file],
  metric1: [2d array],
  metric2: [2d array]
}
```

**Example**

```bash
http://vis.scrc.uk/stat/v1/correlation/?var1=scotland/hospital_confirmed&var2=scotland/hospital_confirmed&metrics=zncc,pearsonr,f-test&smooth=hanning returns ZNCC, Pearson and F-test metrics between hospital_confirmed and hospital_confirmed in Scotland and the data is smoothed using Hanning option.
```


## Correlation metrics of dynamic data
Return correlation metrics for the dynamic data stream. So, it will change every 3 seconds for testing.

### Endpoints

- The API is the same as above but using this end point `http://vis.scrc.uk/stat/v1/correlation_dynamic/`. 
- `smooth` is currently not supported.

**Example**
```bash
http://vis.scrc.uk/stat/v1/correlation_dynamic/?var1=scotland/hospital_confirmed&var2=scotland/hospital_confirmed&metrics=zncc,pearsonr,f-test
```


# Simulation of stream data

A scheduler is used to simulate a data stream. A job will be run every 3 seconds to:
- initially, the **current date** will be set to 1st April 2020
- copy data for `csv-data/scotland` to `csv-data/scotland_dynamic` up to the current date
- the current date will be increased by one
- the stream will stop when it reaches the last available date (26th May 2020).

### Endpoints
- `/stat/v1/stream_data/start` to start or reset the stream from the first day (1st April 2020)
- `/stat/v1/stream_data/stop` to pause the stream
- `/stat/v1/stream_data/resume` to resume the stream (keep the current date as it is)
- `/stat/v1/stream_data/status` displays the status of the stream

# Simulation of deriving metrics dynamically

A scheduler is used to compute metrics based on dynamic data stream. A job will be run every 3 seconds which is synchronized with the test stream.

### Endpoints
- `/stat/v1/process_data/start` to start the stream
- `/stat/v1/process_data/stop` to pause the stream
- `/stat/v1/process_data/resume` to resume the stream
- `/stat/v1/process_data/status` displays the status of the stream


# Model 

## Scotland EERA model data

1. 
```
"endpoint": "/api/v1/scotland/model/eera/outcome-cases-hosp-death-aggregated/",
"col": ["iter","day","inc_case","inc_death_hospital","inc_death"],
```

2. 
```
"endpoint": "/api/v1/scotland/model/eera/outcome-hosp-rec-death-age-groups/"
"col": ["iter","day","H","R","D"],
```

 Example:
```
# To get all columns no need to specify any query params, e.g. 
/api/v1/scotland/model/eera/outcome-cases-hosp-death-aggregated/ : will return all columns

# You can specify column names, e.g.,  /api/v1/scotland/model/eera/outcome-cases-hosp-death-aggregated/?col=iter&col=day&col=inc_case : will return iter, day, inc_case columns
```