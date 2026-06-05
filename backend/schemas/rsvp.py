# Noah Larbalestier, CS61, Spring 2026
# request body schema for updating an RSVP status
# used Claude to test and find service bugs, then tested bugs in Postman to pinpoint fixes
from pydantic import BaseModel
from models.enums import RSVPStatus


class UpdateRSVPSchema(BaseModel):
    status: RSVPStatus
