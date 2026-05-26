from enum import Enum

class UserRole(str, Enum):
    STUDENT = "Student"
    ADMIN = "Admin"

class ClubCategory(str, Enum):
    ACADEMIC = "Academic"
    ARTS = "Arts & Performance"
    CULTURAL = "Cultural & Identity"
    COMMUNITY_SERVICE = "Community Service"
    SPORTS = "Sports & Recreation"
    POLITICAL = "Political & Advocacy"
    RELIGIOUS = "Religious & Spiritual"
    PROFESSIONAL = "Professional & Career"
    GREEK_LIFE = "Greek Life"
    MEDIA = "Media & Publications"
    OTHER = "Other"

class ClubRole(str, Enum):
    MEMBER = "Member"
    OFFICER = "Officer"
    PRESIDENT = "President"

class MembershipStatus(str, Enum):
    ACTIVE = "Active"
    PENDING = "Pending"
    INACTIVE = "Inactive"

class EventStatus(str, Enum):
    PUBLISHED = "Published"
    CANCELLED = "Cancelled"
    COMPLETED = "Completed"

class RSVPStatus(str, Enum):
    CONFIRMED = "Confirmed"
    WAITLISTED = "Waitlisted"
    CANCELLED = "Cancelled"