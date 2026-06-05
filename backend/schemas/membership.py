# Josephine Conley, CS61, Spring 2026
# request body schemas for membership stautus/role updates

from pydantic import BaseModel
from typing import Optional
from models.enums import MembershipStatus, ClubRole

class UpdateMembershipSchema(BaseModel):
    status: Optional[MembershipStatus] = None
    role: Optional[ClubRole] = None