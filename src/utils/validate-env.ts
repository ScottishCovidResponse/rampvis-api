import { cleanEnv, port, str } from 'envalid';

function validateEnv() {
    // log an error message and exit if any required env vars are missing or invalid.
    cleanEnv(process.env, {
        NODE_ENV: str({choices: ['development', 'staging', 'production']}),
        PORT: port(),
        // MONGO_PASSWORD: str(),
        // MONGO_PATH: str(),
        // MONGO_USER: str(),
        // JWT_SECRET: str(),
    });
}

export default validateEnv;
