# Introduction
This is the RESTful API of the RAMPVIS system. This repository consist of a two projects.

1. [data-api](https://github.com/ScottishCovidResponse/rampvis-api/tree/master/data-api) 
   - APIs, e.g., Authentication, user, ontology operations, and data.
   - Implemented in Node.js, Typescript, and JS libraries.

2. [stat-api](https://github.com/ScottishCovidResponse/rampvis-api/tree/master/stat-api) 
   - APIs, e.g., Data, search, grouping, ranking, analytical algorithms, agents, etc.
   - Implemented in FastAPI, Python, and other python libraries.


# Requirements

In order to run the projects locally you will need a MongoDB and a Elasticsearch instance.

## Mongodb
We are using a free MongoDB Atlas managed instance for our development and a community version for production.

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