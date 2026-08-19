import os
from pathlib import Path


class Settings:
    # SQLite by default for easy local dev — set DATABASE_URL on Render to
    # your Postgres connection string in production.
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./careerforge.db")

    JWT_SECRET: str = os.getenv("JWT_SECRET", "dev-secret-change-this-in-production")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = int(os.getenv("JWT_EXPIRE_MINUTES", "1440"))

    # Comma-separated list of allowed frontend origins, e.g.:
    # "https://your-frontend.vercel.app,http://localhost:3000"
    ALLOWED_ORIGINS: list[str] = [
        o.strip() for o in os.getenv("ALLOWED_ORIGINS", "*").split(",") if o.strip()
    ]

    # Where uploaded résumés are saved, ON THIS SERVER — this is the
    # "backend has the path" folder referenced from Application.cv_path.
    UPLOAD_ROOT: Path = Path(__file__).resolve().parent.parent / "uploads"
    RESUME_DIR: Path = UPLOAD_ROOT / "resumes"


settings = Settings()
settings.RESUME_DIR.mkdir(parents=True, exist_ok=True)
