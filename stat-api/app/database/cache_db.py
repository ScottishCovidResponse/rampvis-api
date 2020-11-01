from flask import current_app
from flask_caching import Cache


class CacheDB:
    def __init__(self, app=None):
        self.app = app
        self._cache = None

        if app is not None:
            try:
                self._cache = Cache()
                self._cache.init_app(app, config={'CACHE_TYPE': 'simple'})
            except Exception as e:
                print('CacheDB: Failed to initialise, error =', e)
            else:
                print('CacheDB: initialised.')
                app.extensions['cache'] = self._cache

    def get_app(self, reference_app=None):
        """
        Helper method that implements the logic to look up an application.
        """
        if reference_app is not None:
            return reference_app
        if current_app:
            return current_app
        if self.app is not None:
            return self.app
        raise RuntimeError('CacheDB: Application not registered on db instance and no application bound to '
                           'current context')

    @property
    def cache(self, app=None):
        app = self.get_app(app)
        return app.extensions['cache']


