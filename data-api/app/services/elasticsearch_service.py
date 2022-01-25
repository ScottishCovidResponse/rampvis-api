import sys
from abc import ABC, abstractmethod
from elasticsearch import Elasticsearch
import logging
from loguru import logger
from fastapi import Depends

from app.core.settings import GLOBAL_CONFIG_OBJ
from .search_service import SearchService


class ElasticsearchService(SearchService):
    def __init__(self):
        super().__init__()

        self.client = None
        self.connect()

    def connect(self):
        tracer = logging.getLogger("elasticsearch")
        tracer.setLevel(logging.CRITICAL)  # or desired level
        tracer.addHandler(logging.FileHandler("indexer.log"))

        try:
            host = GLOBAL_CONFIG_OBJ["es"]["host"]

            self.client = Elasticsearch(host)
            logger.info(f"Connected to ES host = {host}")

        except Exception as e:
            logger.error(f"ES connection error: {e}")
            sys.exit(1)

    def ping(self):
        if self.client.ping():
            return "ES service is in good health!"
        else:
            # raise ValueError('Search engine connection failed')
            return "ES service is not in good health!"

    def build_query(
        self,
        must_keys: list,
        should_keys: list,
        filter_keys: list,
        must_not_keys: list = None,
        minimum_should_match: int = 1,
    ) -> dict:

        # Convert to lowercase
        must_keys = [d.lower() for d in must_keys]
        should_keys = [d.lower() for d in should_keys]
        filter_keys = [d.lower() for d in filter_keys]
        must_not_keys = [d.lower() for d in must_not_keys]

        if len(should_keys) == 0:
            minimum_should_match = 0

        if not must_not_keys:
            must_not_keys = [d.lower() for d in must_not_keys]

        must_clause = [{"match": {"keywords": d}} for d in must_keys]
        should_clause = [{"match": {"keywords": d}} for d in should_keys]
        filter_clause = [{"term": {"dataType": d}} for d in filter_keys]
        must_not_clause = [{"match": {"keywords": d}} for d in must_not_keys]

        query = {
            "bool": {
                "must": must_clause,
                "should": should_clause,
                "must_not": must_not_clause,
                "minimum_should_match": minimum_should_match,
                "filter": {"bool": {"should": filter_clause}},
            }
        }

        return query

    def search(self, query: dict, use_gpu=False) -> list:
        size = 5000
        if use_gpu == True:
            size = 15000

        res = self.client.search(
            index="rampvis.onto_data", size=size, body={"query": query}
        )

        data_search = [{**d["_source"], "id": d["_id"]} for d in res["hits"]["hits"]]
        return data_search
