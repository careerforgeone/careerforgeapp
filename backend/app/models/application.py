from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.sql import func

from ..database import Base


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, index=True)
    state = Column(String, nullable=False)
    country = Column(String, nullable=False)
    country_code = Column(String, nullable=False)
    phone_number = Column(String, nullable=False)
    hear_about_us = Column(String, nullable=False)
    track = Column(String, nullable=False)
    application_type = Column(String, nullable=False)  # "Training" or "Internship"

    # Internship-only fields
    portfolio_url = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)

    # Path to the uploaded résumé ON THIS SERVER, e.g. "/uploads/resumes/<uuid>.pdf"
    # — the actual file lives in app/uploads/resumes/, this column just points to it.
    cv_path = Column(String, nullable=True)

    payment_reference = Column(String, unique=True, index=True, nullable=True)
    paid = Column(Boolean, default=False, nullable=False)
    status = Column(String, default="submitted", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
