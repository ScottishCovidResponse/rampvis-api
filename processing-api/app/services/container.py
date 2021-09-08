#
# TODO: incomplete and not used now, review later
# Ref. https://python-dependency-injector.ets-labs.org/examples/application-multiple-containers.html
#

import sys
import json
import pymongo
from loguru import logger
from fastapi import Depends
from dependency_injector import containers, providers
from dependency_injector.wiring import inject, Provide

from .database_service import DatabaseService
from .mongodb_service import MongoDBService


class Container(containers.DeclarativeContainer):

    # config = providers.Configuration()
    database_service: MongoDBService = providers.Singleton(MongoDBService)


#
# Previous implementation with flask
#
# from injector import singleton

# from .database_service import DatabaseBase, MongoDB, DatabaseService
# from .search_service import SearchEngine, ES, SearchService
# from ..algorithms import Ranking


# def configure(binder):
#     binder.bind(DatabaseService, to=DatabaseService, scope=singleton)
#     binder.bind(DatabaseBase, to=MongoDB, scope=singleton)
#     binder.bind(SearchService, to=SearchService, scope=singleton)
#     binder.bind(SearchEngine, to=ES, scope=singleton)
#     binder.bind(Ranking, to=Ranking, scope=singleton)
