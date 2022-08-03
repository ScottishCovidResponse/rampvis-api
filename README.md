# About

This project implements RESTful APIs for the RAMPVIS system. This repository consist of the following top-level folders.

1. data-api

   - Implemented in Python, FastAPI, and other Python libraries.
   - APIs for all data.
   - API implements processing functions, e.g., analytical algorithms, propagation, scheduler agents, etc.

2. infrastructure-api
   - Implemented in Typescript, Node.js, Express.js, and other JavaScript libraries.
   - APIs for ontology and database operations; authentication and user management; other infrastructure related services.
   - Thumbnail and search index services.

## Getting Started

### Prerequisites

- This is tested in Ubuntu 22.04

### Start Development Instance

We created multiple `docker compose` / `docker-compose` scripts and each script handles a set of services. This helps with troubleshooting any issues. Sequentially start the following services:

Ensure docker is running. Stop and clean everything if required. For example,

```bash
# stop containers
docker compose -f docker-compose-ext.yml stop
docker compose -f docker-compose-int.yml stop
docker compose -f docker-compose-seed.yml stop

# remove containers
docker compose -f docker-compose-ext.yml rm
docker compose -f docker-compose-int.yml rm
docker compose -f docker-compose-seed.yml rm

# remove images
docker rmi mongo-setup seed-data rampvis-api_data-api rampvis-api_infrastructure-api

# remove volumes, this will also remove database and search indices
docker volume rm rampvis-api_mongostatus rampvis-api_esdata01 rampvis-api_esdata02 rampvis-api_esdata03 rampvis-api_mongodata01 rampvis-api_mongodata02 rampvis-api_mongodata03

```

Create an overlay network to allow communication between docker applications:

```bash
docker swarm init
docker network create --driver overlay --attachable rampvis-api-network
# inspect the network
docker network inspect rampvis-api-network
```

#### [1] Start External Services

The infrastructure APIs are dependent on database and search engine- MongoDB, Elasticsearch, and Kibana.

```bash
# start the services
docker compose -f docker-compose-ext.yml up -d
# check the status
docker compose -f docker-compose-ext.yml ps
```

#### [2] Start Internal Services

Start the data-api and infrastructure-api

```bash
# start the services
docker compose -f docker-compose-int.yml up -d
# check the status
docker compose -f docker-compose-int.yml ps
```

> Getting started locally --
> In order to start and debug the services locally see the [data-api README](./data-api/README.md) and [infrastructure-api README](./infrastructure-api/README.md) files.

#### [3] Inject the Seed Data

This script will clear the databases and search indices, and seed the MongoDB data from the `rampvis` folder. Do not run this if there is already available data that you do not want to remove.

```bash
# start the services
docker compose -f docker-compose-seed.yml up -d
# check the status
docker compose -f docker-compose-seed.yml ps
```

Injecting data and creating index may take some time, to inspect the log, run:

```bash
docker compose -f docker-compose-seed.yml logs seed-data --follow
```

### Containers and Network

This figure illustrates the containers and their swarm network connections.

![fishy](./containers.png)

The [rampvis-ui](https://github.com/ScottishCovidResponse/rampvis-ui) and [rampvis-ontology-management-ui](https://github.com/saifulkhan/rampvis-ontology-management-ui) are in a different repository.

## BibTex

```bash
@article{Khan:2022:TSC,
  author        = {Khan, Saiful and Nguyen, Phong H. and Abdul-Rahman, Alfie and Freeman, Euan and Turkay, Cagatay and Chen, Min},
  title         = {Rapid Development of a Data Visualization Service in an Emergency Response},
  journal       = {IEEE Transactions on Services Computing},
  volume        = {15},
  pages         = {1251-1264},
  year          = {2022},
  doi           = {10.1109/TSC.2022.3164146}
}

@article{Khan2022:IEEE-TVCG,,
   author = {Saiful Khan, Phong Nguyen, Alfie Abdul-Rahman, Benjamin Bach, Min Chen, Euan Freeman, and Cagatay Turkay},
   title = {Propagating Visual Designs to Numerous Plots and Dashboards},
   journal = {IEEE Transactions on Visualization and Computer Graphics},
   pages = {86-95},
   volume = {28},
   year = {2022},
   doi = {10.1109/TVCG.2021.3114828},
   arxiv = {https://arxiv.org/abs/2107.08882}
}
```

## Contact

URL: https://sites.google.com/view/rampvis/teams
Email: saiful.etc@gmail.com
