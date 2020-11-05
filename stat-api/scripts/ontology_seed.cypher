CREATE OR REPLACE DATABASE neo4j;

//
// Create constraints
//
CREATE CONSTRAINT cnt_analytics IF NOT EXISTS ON (a:Analytics) ASSERT a.name IS UNIQUE;
CREATE CONSTRAINT cnt_model IF NOT EXISTS ON (m:Model) ASSERT m.name IS UNIQUE;
CREATE CONSTRAINT cnt_source IF NOT EXISTS ON (s:Source) ASSERT s.name IS UNIQUE;
CREATE CONSTRAINT cnt_data IF NOT EXISTS ON (d:Data) ASSERT (d.url_prefix, d.endpoint) IS NODE KEY;
// CALL db.constraints;

// TODO: create constraint(s) on relationship(s)

CREATE INDEX idx_data IF NOT EXISTS FOR (d:Data) ON (d.description, d.header);
CREATE INDEX idx_vis IF NOT EXISTS FOR (v:Vis) ON (v.description);
// CALL db.indexes

//
// Create type nodes
//
CREATE (:Analytics {name: 'similarity'});
CREATE (:Analytics {name: 'uncertainty'});

CREATE (:Model {name: 'ic-model'});
CREATE (:Model {name: '1km2'});
CREATE (:Model {name: 'lhstm'});
CREATE (:Model {name: 'c&t'});

CREATE (:Source {name: 'scotland'});
CREATE (:Source {name: 'hospital'});

CREATE (:VisType {name: 'dashboard'});
CREATE (:VisType {name: 'plot'});


//
// Create data_node
//
MERGE (d: Data {url_prefix: 'API_N', endpoint: "/data/scotland/nhs-board/?", description: "COVID 19 data_node by NHS Board 22 July 2020 xlsx", header:""})
  MERGE (s:Source {name: 'scotland'})
  MERGE (d)-[:SOURCE]->(s);

MERGE (d: Data {url_prefix: 'API_N', endpoint: "/data/scotland/covid-deaths/?", description: "covid deaths data_node week 30 xlsx", header:""})
  MERGE (s:Source {name: 'scotland'})
  MERGE (d)-[:SOURCE]->(s);

MERGE (d: Data {url_prefix: 'API_P', endpoint: "/stat/scotland/nhs-board/?", description: "COVID 19 data_node by NHS Board 26 May 2020 XL sheet", header:""})
  MERGE (s:Source {name: 'scotland'})
  MERGE (d)-[:SOURCE]->(s)
  MERGE (a:Analytics {name: 'similarity'})
  MERGE (d)-[:DATA_TYPE {name: 'analytics'}]->(a);


