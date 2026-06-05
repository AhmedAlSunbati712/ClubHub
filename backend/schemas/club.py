# Josephine Conley, CS61, Spring 2026
# request body schemas for club creation and updates
# used Claude to test and find service bugs, then tested bugs in Postman to pinpoint fixes

from pydantic import BaseModel
from typing import Optional
from models.enums import ClubCategory, ClubStatus

class CreateClubSchema(BaseModel):
    name: str
    description: Optional[str] = None
    category: ClubCategory
    status: Optional[ClubStatus] = ClubStatus.ACTIVE

class UpdateClubSchema(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[ClubCategory] = None
    status: Optional[ClubStatus] = None