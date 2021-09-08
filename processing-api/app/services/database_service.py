import sys
import json
from abc import ABC, abstractmethod
import pymongo
from bson.objectid import ObjectId
from bson import json_util
from loguru import logger


class DatabaseService(ABC):
    def __init__(self):
        pass

    @abstractmethod
    def connect(self):
        pass

    @abstractmethod
    def ping(self):
        pass

    @abstractmethod
    def find_example_data_of_vis(self, vis_id):
        pass
