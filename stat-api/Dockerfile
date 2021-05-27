# Full Anaconda Version
# FROM continuumio/anaconda3:latest
# WORKDIR /hart_api/python
# COPY ./api-python/environment.yml ./
# RUN conda update -n base -c defaults conda
# RUN conda env create -f environment.yml && \
#     echo ". /opt/conda/etc/profile.d/conda.sh" >> ~/.bashrc && \ 
#     echo "conda activate $(head -1 environment.yml | cut -d' ' -f2)" >> ~/.bashrc
# COPY . .
# EXPOSE 3000
# ENV FLASK_APP=run.py FLASK_ENV=development
# CMD flask run --host=0.0.0.0 --port=3000

# Lightweight Version
# CHECK - can we update python to 3.8*? It might be why the environment was rejected
FROM continuumio/miniconda3:latest
WORKDIR /usr/rampvis-api/api-python
COPY /config ../config
COPY ./api-python/environment.yml ./
RUN conda update -n base -c defaults conda
RUN conda install python=3.8
RUN conda env create -f environment.yml && \
    echo "conda activate $(head -1 environment.yml | cut -d' ' -f2)" >> ~/.bashrc
COPY ./api-python .
ENV PATH /opt/conda/envs/rampvis-api/bin:$PATH
EXPOSE 3000
ENV FLASK_APP=run.py FLASK_ENV=development
CMD flask run --host=0.0.0.0 --port=3000
