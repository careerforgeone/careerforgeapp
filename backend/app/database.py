from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from .core.config import settings

connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def ensure_application_payment_columns():
    """Add payment columns to databases created before the payment fields existed."""
    columns = {
        column["name"] for column in inspect(engine).get_columns("applications")
    }
    additions = {
        "payment_status": "BOOLEAN NOT NULL DEFAULT FALSE",
        "payment_amount": "INTEGER",
        "payment_paid_at": "TIMESTAMP WITH TIME ZONE",
    }
    with engine.begin() as connection:
        for name, definition in additions.items():
            if name not in columns:
                connection.execute(text(f"ALTER TABLE applications ADD COLUMN {name} {definition}"))
        if "paid" in columns:
            connection.execute(text("ALTER TABLE applications DROP COLUMN paid"))


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
