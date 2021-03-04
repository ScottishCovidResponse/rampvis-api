import logging as log
import sys
from abc import ABC, abstractmethod
from injector import inject
from elasticsearch import Elasticsearch
from flask import current_app


class SearchEngine(ABC):
    def __init__(self):
        pass

    @abstractmethod
    def connect(self):
        pass

    @abstractmethod
    def health(self):
        pass

    @abstractmethod
    def build_query(self):
        pass

    @abstractmethod
    def search(self):
        pass


class ES(SearchEngine):
    def __init__(self):
        super().__init__()

        self.client = None
        self.connect()

    def connect(self):
        try:
            config = current_app.config
            host = config['es']['host']
            
            self.client = Elasticsearch(host)
            log.info('Connected to ES')

        except Exception as e:
            log.error(f'ES connection error: {e}')
            sys.exit(1)

    def health(self):
        if self.client.ping():
            return 'ES service is in good health!'
        else:
            # raise ValueError('Search engine connection failed')
            return 'ES service is not in good health!'

    def build_query(self, must_keys: str, should_keys: str, filter_keys: str, must_not_keys: str = None, minimum_should_match: int = 1) -> dict:
        # Lowercase
        must_keys = [d.lower() for d in must_keys]
        should_keys = [d.lower() for d in should_keys]
        filter_keys = [d.lower() for d in filter_keys]

        if not must_not_keys:
            must_not_keys = [d.lower() for d in must_not_keys]

        must_clause = [{'match': {'keywords': d}} for d in must_keys]
        should_clause = [{'match': {'keywords': d}} for d in should_keys]
        filter_clause = [{'term': {'dataType': d}} for d in filter_keys]

        query = {
            "bool": {
                "must": must_clause,
                "should": should_clause,
                "minimum_should_match": minimum_should_match,
                "filter": {
                    "bool": {
                        "should": filter_clause
                    }
                },
            }
        }

        return query

    def search(self, query: dict) -> list:
        res = self.client.search(index='rampvis.onto_data',
                                 size=1000,
                                 body={"query": query})

        data_search = [{**d['_source'],  'id': d['_id']}
                       for d in res["hits"]["hits"]]
        return data_search


class SearchService:
    @ inject
    def __init__(self, se: SearchEngine):
        self.se = se
        print(f'Search instance is {self.se}')

    def health(self):
        return self.se.health()

    def build_query(self, must_keys: str, should_keys: str, filter_keys: str, must_not_keys: str = '', minimum_should_match: int = 1):
        return self.se.build_query(must_keys, should_keys, filter_keys, must_not_keys, minimum_should_match)

    def search(self, query: dict) -> list:
        return self.se.search(query)
