# Projects

- data-api - NodeJS based REST API for data
- stat-api - Python/Flask based REST API for housekeeping functions   

# Data APIs 

- `url`: `http://vis.scrc.uk`

## Source:  `COVID-19+data+by+NHS+Board+26+May+2020.xlsx` 

```
/api/v1/scotland/nhs-board?table=<table_name>
/api/v1/scotland/nhs-board?table=<table_name>&region=<region_name>
```
Accepted values of
- table_name: cumulative_cases, hospital_confirmed, hospital_suspected, icu_patients
- region_name:  nhs_ayrshire_arran, nhs_borders, nhs_dumfries_galloway, nhs_fife, nhs_forth_valley, nhs_grampian, nhs_greater_glasgow_clyde, nhs_highland, nhs_lanarkshire, nhs_lothian,
nhs_orkney, nhs_shetland, nhs_tayside, nhs_western_isles_scotland, golden_jubilee_nationalhospital, scotland


Following APIs are deprecated.
```bash
/api/v1/scotland/<table>
/api/v1/scotland/<table>/:<region>
```

Accepted values of
- table: cumulative, icupatients, hospconfirmed, hospsuspected
- region:  nhs_ayrshire_arran, nhs_borders, nhs_dumfries_galloway, nhs_fife, nhs_forth_valley, nhs_grampian, nhs_greater_glasgow_clyde, nhs_highland, nhs_lanarkshire, nhs_lothian,
nhs_orkney, nhs_shetland, nhs_tayside, nhs_western_isles_scotland, golden_jubilee_nationalhospital, scotland

## Source: `covid-deaths-data-week-20.xlsx`

```
/api/v1/scotland/covid-deaths/?table=<table_name>&group=<group_name>
```
Accepted values of
- table_name: covid_deaths 
- group_name: gender_age, location, type



Following APIs are deprecated.

```bash
http://vis.scrc.uk/api/v1/scotland/covid-deaths/data-week/gender-age
http://vis.scrc.uk/api/v1/scotland/covid-deaths/data-week/location
http://vis.scrc.uk /api/v1/scotland/covid-deaths/data-week/type
```


# Stat APIs 

## Source: `COVID 19 data by NHS Board 26 May 2020 XL sheet`

```
/stat/v1/scotland/nhs-board/?table=<table_name>&metrics=<metrics>
```
Accepted values of
- table_name: cumulative_cases
- metrics: mse, f-test, pearson-correlation


Following APIs are deprecated.
```bash
/stat/v1/scotland/region/cumulative/mse
/stat/v1/scotland/region/cumulative/f-test
/stat/v1/scotland/region/cumulative/pearson-correlation
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


# Simulation of stream data

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
