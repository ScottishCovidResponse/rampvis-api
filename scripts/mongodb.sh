#!/bin/bash

sudo apt update -y

echo "
----------------------
  mongodb
----------------------
"

wget -qO - https://www.mongodb.org/static/pgp/server-4.2.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.2.list

sudo apt-get update
sudo apt-get install -y mongodb-org

# set mongo to bind to all IPs, not only to listen localhost
sudo sed -i "s,\\(^[[:blank:]]*bindIp:\\) .*,\\1 0.0.0.0," /etc/mongod.conf

# create mongodb data folder
sudo mkdir /data/db -p
sudo chmod 777 /data/db

echo "
----------------------
  start mongodb
----------------------
"
sudo systemctl daemon-reload
sudo systemctl enable mongod
sudo systemctl start mongod
sudo systemctl status mongod
