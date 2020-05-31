// This file is solely for running the app with pm2

module.exports = {
    apps: [{
        name: "scrc-vis-api",
        script: "./dist/server.js",
        instances: "max",
        exec_mode: "cluster",
        // watch: true,
        kill_timeout: 13000,            // By default, pm2 waits 1600ms before sending SIGKILL signal if the applications doesn’t exit itself.
                                        // Application often require to be connected to your database or other resources before serving HTTP requests.
                                        // opens DB connections, starts listening to a port, notifies pm2 that the application is ready
        wait_ready: true,
        listen_timeout: 6000,
        autorestart: true,              // enable/disable automatic restart when an app crashes or exits
        max_restarts: 5,                // defaults to 15
        instance_var: 'INSTANCE_ID',
        env: {
            PORT: 3000,
            NODE_ENV: "development"
        },
        env_staging: {
            PORT: 3000,
            NODE_ENV: "staging",
        },
        env_production: {
            PORT: 3000,
            NODE_ENV: "production",
        },
    }]
}
