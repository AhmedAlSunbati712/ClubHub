from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from models.enums import UserRole

class CreateUserSchema(BaseModel):
    name: str
    email: EmailStr
    role: UserRole = UserRole.STUDENT

    @field_validator("email")
    @classmethod
    def must_be_dartmouth_email(cls, v):
        if not v.endswith("@dartmouth.edu"):
            raise ValueError("Must be a Dartmouth email address")
        return v

class UpdateUserSchema(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None