FROM mongo:4.4.11

WORKDIR /usr/src/mongo-setup

# Install prerequisites
RUN apt-get update && apt-get install -y \
curl

COPY . /usr/src/mongo-setup

RUN chmod +x /usr/src/mongo-setup/wait-for-it.sh
RUN chmod +x /usr/src/mongo-setup/setup.sh

CMD ["bash", "-c", "/usr/src/mongo-setup/wait-for-it.sh mongodb01:27017 -- /usr/src/mongo-setup/setup.sh"]