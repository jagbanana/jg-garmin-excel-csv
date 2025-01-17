# build.py
import PyInstaller.__main__
import os
import shutil
from pathlib import Path

def build_backend():
    # Get absolute paths
    project_root = Path(__file__).parent
    main_path = project_root / 'backend' / 'src' / 'main.py'
    src_path = project_root / 'backend' / 'src'
    
    if not main_path.exists():
        raise FileNotFoundError(f"Could not find main.py at {main_path}")
    
    PyInstaller.__main__.run([
        str(main_path),
        '--name=garmin_sync_backend',
        '--onefile',
        # Add hidden imports
        '--hidden-import=uvicorn.logging',
        '--hidden-import=uvicorn.loops',
        '--hidden-import=uvicorn.loops.auto',
        '--hidden-import=uvicorn.protocols',
        '--hidden-import=uvicorn.protocols.http',
        '--hidden-import=uvicorn.protocols.http.auto',
        '--hidden-import=uvicorn.lifespan',
        '--hidden-import=uvicorn.lifespan.on',
        '--hidden-import=garminconnect',
        # Add all local modules
        '--hidden-import=src.garmin_client',
        '--hidden-import=src.file_output',
        '--hidden-import=src.api.routes',
        '--hidden-import=src.api.server',
        # Add data files
        f'--add-data={src_path}{os.pathsep}src',
        # Modify the working directory 
        '--workpath=build',
        '--distpath=dist',
        '--specpath=build',
        '--noconsole',
        # Add the backend directory to the Python path
        f'--paths={project_root / "backend"}'
    ])

def build_frontend():
    # Build Electron app
    os.system('npx electron-builder')

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