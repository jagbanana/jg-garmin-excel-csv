# build.py
import PyInstaller.__main__
import os
import shutil
from pathlib import Path

def build_backend():
    # Get the absolute path to main.py
    main_path = Path(__file__).parent / 'backend' / 'src' / 'main.py'
    
    if not main_path.exists():
        raise FileNotFoundError(f"Could not find main.py at {main_path}")
    
    PyInstaller.__main__.run([
        str(main_path),  # Convert Path to string
        '--name=garmin_sync_backend',
        '--onefile',
        '--hidden-import=uvicorn.logging',
        '--hidden-import=uvicorn.loops',
        '--hidden-import=uvicorn.loops.auto',
        '--hidden-import=uvicorn.protocols',
        '--hidden-import=uvicorn.protocols.http',
        '--hidden-import=uvicorn.protocols.http.auto',
        '--hidden-import=uvicorn.lifespan',
        '--hidden-import=uvicorn.lifespan.on',
        f'--add-data=backend/src{os.pathsep}src',  
        '--noconsole'
    ])

def build_frontend():
    # Build Electron app
    os.system('npm run build')

def main():
    # Clean previous builds
    for path in ['dist', 'build']:
        if os.path.exists(path):
            shutil.rmtree(path)

    # Build both components
    build_backend()
    build_frontend()

if __name__ == "__main__":
    main()