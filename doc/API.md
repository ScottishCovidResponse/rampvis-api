# List of APIs  

 
## COVID 19 data by NHS Board 26 May 2020 
The data from the file `COVID-19+data+by+NHS+Board+26+May+2020.xlsx` can be accessed via the following APIs

URL: http://vis.scrc.uk 
 
```bash
curl --location --request GET '<URL>/api/v1/scotland/<table>'
curl --location --request GET '<URL>/api/v1/scotland/<table>/:<region>'
```

- Accepted `table` values `cumulative, icupatients, hospconfirmed, hospsuspected`


- Accepted `region` values  `nhs_ayrshire_arran, nhs_borders, nhs_dumfries_galloway, nhs_fife, nhs_forth_valley, nhs_grampian, nhs_greater_glasgow_clyde, nhs_highland, nhs_lanarkshire, nhs_lothian,
nhs_orkney, nhs_shetland, nhs_tayside, nhs_western_isles_scotland, golden_jubilee_nationalhospital, scotland`


```bash
# For example, this will return all entries from - Table 2 - ICU patients
curl --location --request GET 'http://vis.scrc.uk/api/v1/scotland/icupatients'

# Example response
[
    {
        "date": "16/04/2020",
        "nhs_ayrshire_arran": "13",
        "nhs_borders": "6",
        "nhs_dumfries_galloway": "6",
        "nhs_fife": "6",
        "nhs_forth_valley": "5",
        "nhs_grampian": "16",
        "nhs_greater_glasgow_clyde": "70",
        "nhs_highland": "6",
        "nhs_lanarkshire": "30",
        "nhs_lothian": "28",
        "nhs_orkney": "*",
        "nhs_shetland": "*",
        "nhs_tayside": "6",
        "nhs_western_isles_scotland": "*",
        "golden_jubilee_nationalhospital": "*",
        "scotland": "196"
    },
    {
        "date": "19/04/2020",
        "nhs_ayrshire_arran": "10",
        "nhs_borders": "6",
        "nhs_dumfries_galloway": "5",
        "nhs_fife": "5",
        "nhs_forth_valley": "*",
        "nhs_grampian": "13",
        "nhs_greater_glasgow_clyde": "62",
        "nhs_highland": "6",
        "nhs_lanarkshire": "27",
        "nhs_lothian": "29",
        "nhs_orkney": "*",
        "nhs_shetland": "*",
        "nhs_tayside": "6",
        "nhs_western_isles_scotland": "*",
        "golden_jubilee_nationalhospital": "*",
        "scotland": "174"
    },
    ...
]
```

```bash
# For example, this will return the time series for nhs_ayrshire_arran from Table 1 - Cumulative cases
curl --location --request GET 'http://vis.scrc.uk/api/v1/scotland/cumulative/nhs_ayrshire_arran'

# Example response
 [{
        "date": "13/03/2020",
        "value": "*"
    },
    {
        "date": "18/03/2020",
        "value": "9"
    },
    {
        "date": "19/03/2020",
        "value": "12"
    },
    ...
]
```


## Covid Deaths Data Week 20 
The data from the file `covid-deaths-data-week-20.xlsx` can be accessed via the following APIs

URL: http://vis.scrc.uk 
 
```bash
curl --location --request GET '<URL>/api/v1/scotland/covid-deaths/data-week/gender-age'
curl --location --request GET '<URL>/api/v1/scotland/covid-deaths/data-week/location'
curl --location --request GET '<URL>/api/v1/scotland/covid-deaths/data-week/type'
```
