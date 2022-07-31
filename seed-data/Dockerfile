FROM mongo:4.4.11

WORKDIR /usr/src/seed-data

# Install prerequisites
RUN apt-get update && apt-get install -y \
curl

COPY . /usr/src/seed-data

RUN chmod +x /usr/src/seed-data/seed.sh

CMD ["bash", "-c", "/usr/src/seed-data/seed.sh"]