import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = BASE_DIR / "backend"
FRONTEND_DIR = BASE_DIR / "frontend"
UPLOAD_FOLDER = BACKEND_DIR / "uploads"
DB_PATH = BACKEND_DIR / "studysaathi.db"

# Ensure upload directory exists
UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)

# Local AI Configuration (Ollama)
OLLAMA_BASE_URL = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
DEFAULT_MODEL = os.environ.get("STUDYSAATHI_MODEL", "llama3.2:3b")

# Application Settings
SECRET_KEY = os.environ.get("SECRET_KEY", "studysaathi-hacktoberfest-local-secret-key-2026")
HOST = "0.0.0.0"
PORT = 5000
DEBUG = True
