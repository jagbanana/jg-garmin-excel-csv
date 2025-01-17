const { app } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

class BackendLauncher {
    constructor() {
        this.backend = null;
    }

    start() {
        if (process.env.NODE_ENV === 'development') {
            console.log('Starting backend in development mode...');
            // Use -m to ensure proper Python module resolution
            this.backend = spawn('python', ['-m', 'src.main'], {
                env: { ...process.env, RUN_API: 'true', PYTHONPATH: './backend' },
                cwd: path.join(process.cwd(), 'backend')
            });
        } else {
            // Production mode remains the same
            this.backend = spawn(
                path.join(process.resourcesPath, 'backend', 'garmin_sync_backend.exe'),
                [],
                { env: { ...process.env, RUN_API: 'true' } }
            );
        }

        this.backend.stdout.on('data', (data) => {
            console.log(`Backend stdout: ${data}`);
        });

        this.backend.stderr.on('data', (data) => {
            console.error(`Backend stderr: ${data}`);
        });

        this.backend.on('error', (error) => {
            console.error('Failed to start backend:', error);
        });

        this.backend.on('exit', (code) => {
            console.log(`Backend process exited with code ${code}`);
        });
    }

    stop() {
        if (this.backend) {
            this.backend.kill();
            this.backend = null;
        }
    }
}

module.exports = BackendLauncher;