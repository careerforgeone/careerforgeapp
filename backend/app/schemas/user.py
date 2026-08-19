from pydantic import BaseModel, ConfigDict, EmailStr


class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "student"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str
    email: EmailStr
    role: str


class AuthResponse(BaseModel):
    user: UserOut
    token: str
