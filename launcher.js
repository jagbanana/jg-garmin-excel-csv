// launcher.js
const { app } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

class BackendLauncher {
    constructor() {
        this.backend = null;
    }

    start() {
        const backendPath = process.env.NODE_ENV === 'development'
            ? 'python src/main.py'
            : path.join(process.resourcesPath, 'backend', 'garmin_sync_backend.exe');

        this.backend = spawn(backendPath, {
            env: { ...process.env, RUN_API: 'true' }
        });

        this.backend.stdout.on('data', (data) => {
            console.log(`Backend: ${data}`);
        });

        this.backend.stderr.on('data', (data) => {
            console.error(`Backend error: ${data}`);
        });
    }

    stop() {
        if (this.backend) {
            this.backend.kill();
        }
    }
}

module.exports = BackendLauncher;