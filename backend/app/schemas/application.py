from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ApplicationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    state: str
    country: str
    country_code: str
    phone_number: str
    hear_about_us: str
    track: str
    application_type: str
    portfolio_url: str | None = None
    linkedin_url: str | None = None
    cv_path: str | None = None
    payment_reference: str | None = None
    payment_status: bool
    payment_amount: int | None = None
    payment_paid_at: datetime | None = None
    status: str
    created_at: datetime
