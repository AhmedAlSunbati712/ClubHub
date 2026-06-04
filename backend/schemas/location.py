from pydantic import BaseModel
from typing import Optional

class CreateLocationSchema(BaseModel):
    building: str
    room: str
    capacity: int

class UpdateLocationSchema(BaseModel):
    building: Optional[str] = None
    room: Optional[str] = None
    capacity: Optional[int] = None