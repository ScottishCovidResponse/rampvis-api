FROM node:14.16.0

# Copy the external configs
WORKDIR /usr/rampvis-api/data-api
COPY /config ../config
COPY .env ../
COPY .prettierrc.js ../

# process the node
COPY /data-api/package*.json ./
RUN npm i && npm i -g nodemon
COPY ./data-api .
ENV PORT=2000 NODE_ENV=development DB_URL=mongodb://rampvis-mongodb:27017
EXPOSE 2000
CMD nodemon ./src/server.ts
