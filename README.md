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


### Housekeeping / Stat APIs

```bash
curl --location --request GET <endpoints>

# available endpoints
http://vis.scrc.uk/stat/v1/scotland/region/cumulative/mse
http://vis.scrc.uk/stat/v1/scotland/region/cumulative/f-test
http://vis.scrc.uk/stat/v1/scotland/region/cumulative/pearson-correlation
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





