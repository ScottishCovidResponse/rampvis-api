# base image
FROM node:12.17.0


# set working directory
RUN mkdir -p /usr/src/api
WORKDIR /usr/src/api

# add `/app/node_modules/.bin` to $PATH
ENV PATH /usr/src/api/node_modules/.bin:$PATH
ENV PORT 2000
ENV NODE_ENV 'development'

# install and cache app dependencies
COPY package.json /usr/src/api/package.json
RUN npm install
RUN npm install typescript@3.8.3

# add app
COPY . /usr/src/api

EXPOSE 2000

# start app
CMD  npm run dev
