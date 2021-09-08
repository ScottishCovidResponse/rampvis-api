from abc import ABC, abstractmethod


class SearchService(ABC):
    def __init__(self):
        pass

    @abstractmethod
    def connect(self):
        pass

    @abstractmethod
    def ping(self):
        pass

    @abstractmethod
    def build_query(self):
        pass

    @abstractmethod
    def search(self) -> list:
        pass
