# About

RESTful APIs of the RAMPVIS system. This repository consist of the following top-level folders.

1. data-api
   - Implemented in Python, FastAPI, and other Python libraries.
   - APIs for all data.
   - API implements processing functions, e.g., analytical algorithms, propagation, scheduler agents, etc.

2. infrastructure-api
   - Implemented in Typescript, Node.js, Express.js, and other JavaScript libraries.
   - APIs for ontology and database operations; authentication and user management; other infrastructure related services.
   - Thumbnail and search index services.

## Getting Started

Sequence of starting the services:

1. External services
2. Internal Services

### Start External Services

The infrastructure APIs are dependent on following external services:
1. MongoDB 
2. Elasticsearch. 

Start the services:

```bash
docker-compose up -d
```

Run the command to check the containers (e.g., es*, kib*, and mongod*) are started:

```bash
docker-compose ps
```

**Known Issues and Solutions**

1. The elasticsearch containers require more than 2GB VM. To setup the VM size run:

```bash
# Windows-11
wsl -d docker-desktop 
echo 262144 >> /proc/sys/vm/max_map_count
```

### Start Internal Services
The data-api and infrastructure-api are our internal services. See the [data-api README](./data-api/README.md) and [infrastructure-api README](./infrastructure-api/README.md) files.

## BibTex

[1] This repository can be cited as: 
```bash
@misc{RAMPVIS-API:git,
  author = {Saiful Khan, Phong Nguyen, Erik Rydow, Tuna Gonen, and Alexander Kachkaev},
  title = {{RAMPVIS} API},
  howpublished = {\url{https://github.com/ScottishCovidResponse/rampvis-api}},
}
```
Author order is based on GitHub contribution statistics.

[2] The API and service architecture and design work can be cited as:

```bash
TBD
```

[3] Propagation work can be cited as:

```bash
@article{Khan2022:IEEE-TVCG,,
   author = {Saiful Khan, Phong Nguyen, Alfie Abdul-Rahman, Benjamin Bach, Min Chen, Euan Freeman, and Cagatay Turkay},
   title = {Propagating Visual Designs to Numerous Plots and Dashboards},
   journal = {IEEE Transactions on Visualization and Computer Graphics},
   issue = {1},
   pages = {86-95},
   volume = {28},
   year = {2022},
   doi = {10.1109/TVCG.2021.3114828},
   arxiv = {https://arxiv.org/abs/2107.08882}
}
```
