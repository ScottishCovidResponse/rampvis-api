FROM mongo:4.4.11

WORKDIR /usr/src/setup-scripts

# Install prerequisites
RUN apt-get update && apt-get install -y \
curl

COPY . /usr/src/setup-scripts

RUN chmod +x /usr/src/setup-scripts/wait-for-it.sh
RUN chmod +x /usr/src/setup-scripts/setup.sh

CMD ["bash", "-c", "/usr/src/setup-scripts/wait-for-it.sh mongodb01:27017 -- /usr/src/setup-scripts/setup.sh"]