import logging as log
import sys
import json
from abc import ABC, abstractmethod
from injector import inject
import pymongo
from bson.objectid import ObjectId
from bson import json_util
from flask import current_app


class DatabaseBase(ABC):
    def __init__(self):
        pass

    @abstractmethod
    def connect(self):
        pass

    @abstractmethod
    def health(self):
        pass

    @abstractmethod
    def find_example_data_of_vis(self, vis_id):
        pass


class MongoDB(DatabaseBase):
    def __init__(self):
        super().__init__()

        self.client = None
        self.db = None
        self.connect()

    def connect(self):
        try:
            config = current_app.config
            host = config['mongodb']['url']

            self.client = pymongo.MongoClient(host, 27017)
            self.db = self.client['rampvis']
            log.info('Connected to MongoDB')

        except Exception as e:
            log.error(f'MongoDB connection error: {e}')
            sys.exit(1)

    def health(self):
        return 'MongoDB service is in good health!'

    def get_vis(self, vis_id):
        doc = self.db['onto_vis'].find_one({'_id': ObjectId(vis_id)})
        return doc

    def find_example_data_of_vis(self, vis_id):
        # Find 'example pages binding vis_id'
        cursor = self.db['onto_page'].find({'bindingType': 'example', 'bindings': {
            '$elemMatch': {'visId': vis_id}}})

        data_ids = []
        for doc in cursor:
            data_ids = doc.get('bindings')[0].get('dataIds')

        # Find example data with data_ids
        res = self.db['onto_data'].find(
            {'_id': {'$in': [ObjectId(id) for id in data_ids]}})

        data = []
        for d in res:
            id = str(d['_id'])
            del d['_id']
            data.append({**d, 'id': id})

        # return json.dumps(data, default=json_util.default)
        return data


class DatabaseService:
    @ inject
    def __init__(self, database: DatabaseBase):
        self.database = database
        print(f'Database instance is {self.database}')

    def health(self):
        return self.database.health()

    def find_example_data_of_vis(self, vis_id):
        return self.database.find_example_data_of_vis(vis_id)
