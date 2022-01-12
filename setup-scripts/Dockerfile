FROM mongo:4.4.11
RUN mkdir /config
WORKDIR /config
COPY . .
# COPY mongo-setup.js .
# COPY mongo-setup.sh .
RUN chmod +x /config/wait-for-it.sh
RUN chmod +x /config/mongo-setup.sh
CMD ["bash", "-c", "/config/wait-for-it.sh mongodb01:27017 -- /config/mongo-setup.sh"]