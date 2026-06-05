# Noah Larbalestier, CS61, Spring 2026
# request body schemas for event create and update
# used Claude to test and find service bugs, then tested bugs in Postman to pinpoint fixes
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from models.enums import EventStatus


class CreateEventSchema(BaseModel):
    clubId: int
    locationId: Optional[int] = None
    title: str
    eventDateTime: datetime
    eventCapacity: Optional[int] = None


class UpdateEventSchema(BaseModel):
    locationId: Optional[int] = None
    title: Optional[str] = None
    eventDateTime: Optional[datetime] = None
    eventCapacity: Optional[int] = None
    status: Optional[EventStatus] = None
