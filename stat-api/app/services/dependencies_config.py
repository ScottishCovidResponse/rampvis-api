from injector import singleton

from .database_service import DatabaseBase, MongoDB, DatabaseService
from .search_service import SearchEngine, ES, SearchService
#from ..algorithms import Ranking


def configure(binder):
    binder.bind(DatabaseService, to=DatabaseService, scope=singleton)
    binder.bind(DatabaseBase, to=MongoDB, scope=singleton)
    binder.bind(SearchService, to=SearchService, scope=singleton)
    binder.bind(SearchEngine, to=ES, scope=singleton)
    #binder.bind(Ranking, to=Ranking, scope=singleton)
