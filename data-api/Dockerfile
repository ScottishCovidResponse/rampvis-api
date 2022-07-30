FROM python:3.9

WORKDIR /usr/src/data-api

COPY ./requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /tmp/requirements.txt

COPY . /usr/src/data-api

CMD ["uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0", "--port", "4010"]
