from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ApplicationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    track: str
    application_type: str
    portfolio_url: str | None = None
    linkedin_url: str | None = None
    cv_path: str | None = None
    status: str
    created_at: datetime
