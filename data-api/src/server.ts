import 'reflect-metadata';
import validateEnv from './utils/validate-env';

import { App } from './app';

validateEnv();

const app = new App();

(async () => {
    await app.init();
    app.listen();
})();
