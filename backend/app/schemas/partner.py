from pydantic import BaseModel, EmailStr


class PartnerCreate(BaseModel):
    organization: str
    name: str
    email: EmailStr
    track: str | None = None
    message: str | None = None
