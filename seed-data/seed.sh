#!/usr/bin/env bash

echo "
------------------------------------------------
Drop collections from rampvis database
------------------------------------------------
"
mongo mongodb://mongodb01:27017 < mongo-drop.js


echo "
------------------------------------------------
Restoring data from backups
------------------------------------------------
"
mongoimport --host=mongodb01 --port=27017 --db=rampvis --collection=users ./rampvis/users.json
mongorestore --host=mongodb01 --port=27017 --nsInclude=rampvis.onto_vis ./rampvis/onto_vis.bson
mongorestore --host=mongodb01 --port=27017 --nsInclude=rampvis.onto_data ./rampvis/onto_data.bson
mongorestore --host=mongodb01 --port=27017 --nsInclude=rampvis.onto_page ./rampvis/onto_page.bson


echo "
------------------------------------------------
Clear indexes from Elasticsearch
------------------------------------------------
"
# List of indexes
curl -X GET "es01:9200/_cat/indices"
# Delete monstache log
curl -X DELETE "es01:9200/monstache.stats.*?pretty"
# Delete search indices
curl -X DELETE "es01:9200/rampvis.onto_*?pretty"
# List of indexes
curl -X GET "es01:9200/_cat/indices"

echo "
------------------------------------------------
Index database to Elasticsearch
------------------------------------------------
"
chmod +x ./search-indexer/linux-amd64/monstache
./search-indexer/linux-amd64/monstache -f ./search-indexer/monstache.dev.toml

echo "
------------------------------------------------
New indexes on Elasticsearch
------------------------------------------------
"
# List of indexes
curl -X GET "es01:9200/_cat/indices"
