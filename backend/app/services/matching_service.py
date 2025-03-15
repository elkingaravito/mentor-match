from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import datetime, time
from app.models.user import User
from app.models.matching import MatchScore, Expertise, Availability
from app.schemas.matching import MentorMatch

class MatchingService:
    def __init__(self, db: Session):
        self.db = db

    def calculate_expertise_match(self, mentee_expertise: List[Expertise], mentor_expertise: List[Expertise]) -> float:
        if not mentee_expertise or not mentor_expertise:
            return 0.0

        total_score = 0
        for mentee_exp in mentee_expertise:
            mentor_exp = next(
                (exp for exp in mentor_expertise if exp.name == mentee_exp.name),
                None
            )
            if mentor_exp:
                # Score based on mentor's expertise level
                level_scores = {
                    "beginner": 0.3,
                    "intermediate": 0.7,
                    "expert": 1.0
                }
                total_score += level_scores[mentor_exp.level]

        return total_score / len(mentee_expertise)

    def calculate_availability_match(self, mentee_availability: List[Availability], mentor_availability: List[Availability]) -> float:
        if not mentee_availability or not mentor_availability:
            return 0.0

        total_slots = len(mentee_availability)
        matching_slots = 0

        for mentee_slot in mentee_availability:
            for mentor_slot in mentor_availability:
                if (
                    mentee_slot.day_of_week == mentor_slot.day_of_week and
                    self._times_overlap(
                        mentee_slot.start_time,
                        mentee_slot.end_time,
                        mentor_slot.start_time,
                        mentor_slot.end_time
                    )
                ):
                    matching_slots += 1
                    break

        return matching_slots / total_slots

    def _times_overlap(self, start1: str, end1: str, start2: str, end2: str) -> bool:
        """Check if two time ranges overlap"""
        start1 = datetime.strptime(start1, "%H:%M").time()
        end1 = datetime.strptime(end1, "%H:%M").time()
        start2 = datetime.strptime(start2, "%H:%M").time()
        end2 = datetime.strptime(end2, "%H:%M").time()

        return start1 < end2 and start2 < end1

    def get_available_slots(self, mentee: User, mentor: User) -> List[Availability]:
        """Get overlapping availability slots between mentee and mentor"""
        available_slots = []
        
        for mentee_slot in mentee.availability:
            for mentor_slot in mentor.availability:
                if (
                    mentee_slot.day_of_week == mentor_slot.day_of_week and
                    self._times_overlap(
                        mentee_slot.start_time,
                        mentee_slot.end_time,
                        mentor_slot.start_time,
                        mentor_slot.end_time
                    )
                ):
                    # Return mentor's availability within mentee's available time
                    available_slots.append(mentor_slot)
                    break

        return available_slots

    def find_matches(self, mentee_id: int, limit: int = 10) -> List[MentorMatch]:
        """Find and score potential mentor matches for a mentee"""
        mentee = self.db.query(User).filter(User.id == mentee_id).first()
        if not mentee:
            return []

        # Get all mentors
        mentors = self.db.query(User).filter(User.role == "mentor").all()
        
        matches = []
        for mentor in mentors:
            # Calculate match scores
            expertise_match = self.calculate_expertise_match(mentee.expertise, mentor.expertise)
            availability_match = self.calculate_availability_match(mentee.availability, mentor.availability)
            
            # Calculate overall score (weighted average)
            overall_score = (expertise_match * 0.7) + (availability_match * 0.3)

            # Get available slots
            available_slots = self.get_available_slots(mentee, mentor)

            if overall_score > 0:  # Only include if there's some match
                # Create or update match score record
                match_score = self.db.query(MatchScore).filter(
                    MatchScore.mentor_id == mentor.id,
                    MatchScore.mentee_id == mentee_id
                ).first()

                if not match_score:
                    match_score = MatchScore(
                        mentor_id=mentor.id,
                        mentee_id=mentee_id,
                        score=overall_score,
                        expertise_match=expertise_match,
                        availability_match=availability_match,
                        overall_fit=overall_score
                    )
                    self.db.add(match_score)
                else:
                    match_score.score = overall_score
                    match_score.expertise_match = expertise_match
                    match_score.availability_match = availability_match
                    match_score.overall_fit = overall_score
                    match_score.updated_at = datetime.utcnow()

                matches.append(MentorMatch(
                    mentor=mentor,
                    match_score=match_score,
                    available_slots=available_slots
                ))

        self.db.commit()
        
        # Sort by score and return top matches
        matches.sort(key=lambda x: x.match_score.score, reverse=True)
        return matches[:limit]