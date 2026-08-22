import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[2] / ".env")


class Settings:
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", "postgresql+psycopg2://postgres:postgres@localhost:5432/careerforge"
    )

    JWT_SECRET: str = os.getenv("JWT_SECRET", "dev-secret-change-this-in-production")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = int(os.getenv("JWT_EXPIRE_MINUTES", "1440"))

    # Comma-separated list of allowed frontend origins, e.g.:
    # "https://your-frontend.vercel.app,http://localhost:3000"
    ALLOWED_ORIGINS: list[str] = [
        o.strip() for o in os.getenv("ALLOWED_ORIGINS", "*").split(",") if o.strip()
    ]

    PAYSTACK_SECRET_KEY: str = os.getenv("PAYSTACK_SECRET_KEY", "")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    APPLICATION_FEE_KOBO: int = int(
        os.getenv("APPLICATION_FEE_KOBO", str(int(os.getenv("APPLICATION_FEE", "35000")) * 100))
    )
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY") or os.getenv("API_KEY", "")
    OPENAI_BASE_URL: str = os.getenv("OPENAI_BASE_URL", "https://openrouter.ai/api/v1")
    OPENAI_CHAT_MODEL: str = os.getenv("OPENAI_CHAT_MODEL", "openai/gpt-oss-20b")
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "openai/text-embedding-3-small")

    # Where uploaded résumés are saved, ON THIS SERVER — this is the
    # "backend has the path" folder referenced from Application.cv_path.
    UPLOAD_ROOT: Path = Path(__file__).resolve().parent.parent / "uploads"
    RESUME_DIR: Path = UPLOAD_ROOT / "resumes"


settings = Settings()
settings.RESUME_DIR.mkdir(parents=True, exist_ok=True)