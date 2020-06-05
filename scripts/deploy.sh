#!/bin/bash

#
# TO CHECK - server_name
#

set -e

sudo apt update -y
sudo apt install curl

echo "
----------------------
  nvm, node, npm
----------------------
"

# nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
. ~/.nvm/nvm.sh
nvm install v12.17.0


echo "
----------------------
  git
----------------------
"

# git
sudo apt install git -y

echo "
----------------------
  PM2
----------------------
"

# install pm2 with npm
npm install -g pm2

echo "
----------------------
  Nginx
----------------------
"

# install nginx
sudo apt install nginx -y

# start nginx
sudo systemctl enable nginx
sudo systemctl start nginx


# set nginx configuration
# sudo vim /etc/nginx/nginx.conf

# nginx api and ui virtual directory
sudo rm -f /etc/nginx/conf.d/scrc-vis-app.conf
sudo touch /etc/nginx/conf.d/scrc-vis-app.conf
echo "server {" | sudo tee -a /etc/nginx/conf.d/scrc-vis-app.conf
echo "    listen 80;" | sudo tee -a /etc/nginx/conf.d/scrc-vis-app.conf
echo "    server_name vis.scrc.uk;" | sudo tee -a /etc/nginx/conf.d/scrc-vis-app.conf
echo "    root /var/www/ui-scrc-vis;" | sudo tee -a /etc/nginx/conf.d/scrc-vis-app.conf
echo "    location / {" | sudo tee -a /etc/nginx/conf.d/scrc-vis-app.conf
echo "        try_files \$uri \$uri/ /index.html;" | sudo tee -a /etc/nginx/conf.d/scrc-vis-app.conf
echo "    }" | sudo tee -a /etc/nginx/conf.d/scrc-vis-app.conf
echo "    location /api/ {" | sudo tee -a /etc/nginx/conf.d/scrc-vis-app.conf
echo "        proxy_pass http://localhost:3000;" | sudo tee -a /etc/nginx/conf.d/scrc-vis-app.conf
echo "        proxy_http_version 1.1;" | sudo tee -a /etc/nginx/conf.d/scrc-vis-app.conf
echo "        proxy_set_header Upgrade \$http_upgrade;" | sudo tee -a /etc/nginx/conf.d/scrc-vis-app.conf
echo "        proxy_set_header Connection keep-alive;" | sudo tee -a /etc/nginx/conf.d/scrc-vis-app.conf
echo "        proxy_set_header Host \$host;" | sudo tee -a /etc/nginx/conf.d/scrc-vis-app.conf
echo "        proxy_cache_bypass \$http_upgrade;" | sudo tee -a /etc/nginx/conf.d/scrc-vis-app.conf
echo "    }" | sudo tee -a /etc/nginx/conf.d/scrc-vis-app.conf
echo "}" | sudo tee -a /etc/nginx/conf.d/scrc-vis-app.conf
echo "gzip on;" | sudo tee -a /etc/nginx/conf.d/scrc-vis-app.conf
echo "gzip_http_version 1.1;" | sudo tee -a /etc/nginx/conf.d/scrc-vis-app.conf
echo "gzip_vary on;" | sudo tee -a /etc/nginx/conf.d/scrc-vis-app.conf
echo "gzip_comp_level 6;" | sudo tee -a /etc/nginx/conf.d/scrc-vis-app.conf
echo "gzip_proxied any;" | sudo tee -a /etc/nginx/conf.d/scrc-vis-app.conf
echo "gzip_types text/javascript application/javascript text/plain image/png image/gif image/jpeg text/html text/css application/json application/x-javascript application/xml application/xml+rss;" | sudo tee -a /etc/nginx/conf.d/scrc-vis-app.conf
echo "gzip_buffers 16 8k;" | sudo tee -a /etc/nginx/conf.d/scrc-vis-app.conf
echo 'gzip_disable gzip_disable "msie6";' | sudo tee -a /etc/nginx/conf.d/scrc-vis-app.conf


# restart nginx
# sudo service nginx reload
sudo systemctl restart nginx


echo "
----------------------
  api
----------------------
"
cd $HOME
rm -rf api-scrc-vis
git clone https://5bf8f45e68b1b864be643a00278c4973f0d24dc9@github.com/ScottishCovidResponse/api-scrc-vis.git
cd api-scrc-vis
git checkout master
npm install
npm run build --production

echo "
----------------------
  start api with pm2 and save configuration
----------------------
"
cd $HOME/api-scrc-vis
pm2 start --env production

pm2 startup >> startup.sh
sudo chmod 777 startup.sh
./startup.sh
pm2 save


echo "
----------------------
  ui
----------------------
"
cd $HOME
rm -rf ui-scrc-vis
git clone https://5bf8f45e68b1b864be643a00278c4973f0d24dc9@github.com/ScottishCovidResponse/ui-scrc-vis.git
cd ui-scrc-vis
git checkout master
npm install

npm install -g @angular/cli@9.1.7 > /dev/null
npm install -g typescript@3.8.3

# create angular publish directory
sudo mkdir /var/www/ui-scrc-vis -p
sudo chmod 777 /var/www/ui-scrc-vis

# build angular project and copy files
ng build --prod --output-path ./dist
sudo cp -a ./dist/. /var/www/ui-scrc-vis
rm -r ./dist
