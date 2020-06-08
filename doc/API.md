# List of APIs  
 
The data from the file `COVID-19+data+by+NHS+Board+26+May+2020.xlsx` can be accessed via the following APIs
 
```bash
curl --location --request GET 'http://vis.scrc.uk/api/v1/scotland/<table>'
curl --location --request GET 'http://vis.scrc.uk/api/v1/scotland/<table>/:<region>'
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
        "date": "15/04/2020",
        "nhs_ayrshire_arran": "13",
        "nhs_borders": "6",
        "nhs_dumfries_galloway": "6",
        "nhs_fife": "5",
        "nhs_forth_valley": "7",
        "nhs_grampian": "15",
        "nhs_greater_glasgow_clyde": "71",
        "nhs_highland": "5",
        "nhs_lanarkshire": "29",
        "nhs_lothian": "28",
        "nhs_orkney": "*",
        "nhs_shetland": "*",
        "nhs_tayside": "6",
        "nhs_western_isles_scotland": "*",
        "golden_jubilee_nationalhospital": "*",
        "scotland": "195"
    },
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
        "date": "17/04/2020",
        "nhs_ayrshire_arran": "11",
        "nhs_borders": "6",
        "nhs_dumfries_galloway": "5",
        "nhs_fife": "6",
        "nhs_forth_valley": "6",
        "nhs_grampian": "15",
        "nhs_greater_glasgow_clyde": "67",
        "nhs_highland": "6",
        "nhs_lanarkshire": "29",
        "nhs_lothian": "30",
        "nhs_orkney": "*",
        "nhs_shetland": "*",
        "nhs_tayside": "5",
        "nhs_western_isles_scotland": "*",
        "golden_jubilee_nationalhospital": "*",
        "scotland": "189"
    },
    {
        "date": "18/04/2020",
        "nhs_ayrshire_arran": "12",
        "nhs_borders": "6",
        "nhs_dumfries_galloway": "5",
        "nhs_fife": "6",
        "nhs_forth_valley": "*",
        "nhs_grampian": "15",
        "nhs_greater_glasgow_clyde": "65",
        "nhs_highland": "6",
        "nhs_lanarkshire": "27",
        "nhs_lothian": "28",
        "nhs_orkney": "*",
        "nhs_shetland": "*",
        "nhs_tayside": "7",
        "nhs_western_isles_scotland": "*",
        "golden_jubilee_nationalhospital": "*",
        "scotland": "182"
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
...]
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
    {
        "date": "20/03/2020",
        "value": "16"
    }
...
]
```