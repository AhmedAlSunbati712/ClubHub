from flask import g, request, jsonify
from pydantic import ValidationError
from schemas import UpdateMembershipSchema
from services import membership_service
from models.enums import MembershipStatus, UserRole, ClubRole

def create_membership(clubId):
        
def get_membership(userId, clubId):

def get_club_memberships(clubId):

def get_user_memberships(userId):

def update_membership(userId, clubId):

def delete_membership(userId, clubId):
