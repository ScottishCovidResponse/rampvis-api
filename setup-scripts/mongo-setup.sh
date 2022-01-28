#!/usr/bin/env bash

echo "
------------------------------------------------
 Enable Replicaset:
------------------------------------------------
"
if [ -f /data/mongo-init.flag ]; then
    echo "Replicaset already initialized"
else
    echo "Init replicaset"
    mongo mongodb://mongodb01:27017 mongo-setup.js
    touch /data/mongo-init.flag
fi


echo "
------------------------------------------------
 Seed MongoDB: Craete user
------------------------------------------------
"
#  mongo mongodb://mongodb01:27017
# use rampvis
# db.users.insert(})


echo "
------------------------------------------------
Seeding MongoDB
------------------------------------------------
"

echo "
------------------------------------------------
Restoring data from backups
------------------------------------------------
"
# mongoimport --host=mongodb01 --port=27017 --db=rampvis --collection=users ./mongo-data/rampvis/users.json
# mongorestore --host=mongodb01 --port=27017 --db=rampvis --collection=onto_vis ./mongo-data/rampvis/onto_vis.bson
# mongorestore --host=mongodb01 --port=27017 --db=rampvis --collection=onto_data ./mongo-data/rampvis/onto_data.bson
# mongorestore --host=mongodb01 --port=27017 --db=rampvis --collection=onto_page ./mongo-data/rampvis/onto_page.bson

echo "
------------------------------------------------
Seeding complete!
------------------------------------------------
"