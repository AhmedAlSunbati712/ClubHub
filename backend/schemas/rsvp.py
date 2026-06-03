# Noah Larbalestier, CS61, Spring 2026
# request body schema for updating an RSVP status
from pydantic import BaseModel
from models.enums import RSVPStatus

class UpdateRSVPSchema(BaseModel):
    status: RSVPStatus
