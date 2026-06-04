from pydantic import BaseModel
from typing import Optional
from models.enums import ClubCategory, ClubStatus

class CreateClubSchema(BaseModel):
    name: str
    description: Optional[str] = None
    category: ClubCategory
    status: Optional[ClubStatus] = ClubStatus.Active

class UpdateClubSchema(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[ClubCategory] = None
    status: Optional[ClubStatus] = None