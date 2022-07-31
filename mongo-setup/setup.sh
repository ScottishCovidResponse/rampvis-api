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
