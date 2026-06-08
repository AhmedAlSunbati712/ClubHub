"""
user.py     Ahmed Al Sunbati
CS61, Spring 2026

Description: Defines schemas to validate bodys of put and post requests on the users resource.
"""
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from models.enums import UserRole


class CreateUserSchema(BaseModel):
    name: str
    email: EmailStr
    role: UserRole = UserRole.STUDENT
    password: str

    @field_validator("email")
    @classmethod
    def must_be_dartmouth_email(cls, v):
        if not v.endswith("@dartmouth.edu"):
            raise ValueError("Must be a Dartmouth email address")
        return v

    @field_validator("password")
    @classmethod
    def validate_pw(cls, v):
        if len(v) == 0:
            raise ValueError("Must be non-empty password")
        return v


class UpdateUserSchema(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    password: Optional[str] = None

    @field_validator("email")
    @classmethod
    def must_be_dartmouth_email(cls, v):
        if v and not v.endswith("@dartmouth.edu"):
            raise ValueError("Must be a Dartmouth email address")
        return v

    @field_validator("password")
    @classmethod
    def validate_pw(cls, v):
        if v is not None and len(v) == 0:
            raise ValueError("Must be non-empty password")
        return v
