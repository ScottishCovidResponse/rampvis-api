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
curl --location --request GET http://vis.scrc.uk/2000/api/v1/scotland/icupatients

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
    }]
```