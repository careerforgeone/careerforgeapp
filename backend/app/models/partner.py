from sqlalchemy import Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from ..database import Base


class PartnerInterest(Base):
    __tablename__ = "partner_interests"

    id = Column(Integer, primary_key=True, index=True)
    organization = Column(String, nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, index=True)
    track = Column(String, nullable=True)
    message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
