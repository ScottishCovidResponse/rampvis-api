# Introduction
This is the RESTful API of the RAMPVIS system. This repository consist of a two projects.

1. [data-api](https://github.com/ScottishCovidResponse/rampvis-api/tree/master/data-api)
   - Implemented in Typescript, Node.js, Express, and other JavaScript libraries.
   - APIs for Authentication, user management, ontology operations, data service, etc.

2. [stat-api](https://github.com/ScottishCovidResponse/rampvis-api/tree/master/stat-api)
   - Implemented in Python, FastAPI, and other Python libraries.
   - APIs for data service, search algorithms, grouping, ranking and propagation algorithms, analytical algorithms, scheduler agents, etc.


# Requirements

In order to run these projects locally you will need a MongoDB (> 4.4.\*) and a Elasticsearch (> 7.12.\*) instance. 

## Mongodb
We are using a freely available MongoDB Atlas-managed instance for development and a community version for production.

## Elasticsearch 

Start a local instance of Elasticsearch single node.
```bash
docker run --name esaticsearch \
  -p 9200:9200 -p 9300:9300 \
  -e "discovery.type=single-node" \
  docker.elastic.co/elasticsearch/elasticsearch:7.12.1
```

Start a multi-node Elasticsearch cluster.
```bash
docker-compose -f docker-compose-dev-es.yml up -d
docker-compose -f docker-compose-dev-es.yml [stop | start | rm | down]
```