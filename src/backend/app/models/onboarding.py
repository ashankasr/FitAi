"""
Onboarding schemas for user profile data collection.
"""
from typing import Optional, List, Literal
from pydantic import BaseModel, Field


class Demographics(BaseModel):
    """User demographic information."""
    age: int = Field(ge=13, le=120, description="User age in years")
    sex: Literal["male", "female", "other"] = Field(description="User sex")
    height: float = Field(ge=100, le=250, description="Height in centimeters")
    weight: float = Field(ge=30, le=300, description="Weight in kilograms")
    bmi: Optional[float] = Field(default=None, description="Body Mass Index")
    body_fat_percentage: Optional[float] = Field(
        default=None, ge=5, le=60, description="Body fat percentage"
    )


class ActivityLevel(BaseModel):
    """User's current activity level."""
    structured_exercise_days: int = Field(
        ge=0, le=7, description="Days per week of structured exercise"
    )
    daily_steps: int = Field(ge=0, description="Average daily step count")
    sedentary_hours: Optional[float] = Field(
        default=8, ge=0, le=24, description="Hours spent sedentary per day"
    )
    last_regular_exercise: str = Field(description="When user last exercised regularly")


class MedicalHistory(BaseModel):
    """User's medical history for safety screening."""
    has_cardiovascular_disease: bool = Field(
        default=False, description="Diagnosed cardiovascular conditions"
    )
    has_diagnosed_chronic_conditions: bool = Field(
        default=False, description="Diagnosed chronic health conditions"
    )
    chronic_conditions_details: Optional[str] = Field(
        default=None, description="Details of chronic conditions"
    )
    has_back_pain: bool = Field(default=False, description="Recurring back pain")
    back_pain_details: Optional[str] = Field(
        default=None, description="Details of back pain"
    )
    taking_medications: bool = Field(default=False, description="Currently on medications")
    medications_details: Optional[str] = Field(
        default=None, description="Details of medications"
    )
    family_history: Optional[str] = Field(
        default=None, description="Relevant family health history"
    )


class FitnessGoals(BaseModel):
    """User's fitness goals."""
    primary_goal: str = Field(description="Main fitness goal")
    secondary_goals: List[str] = Field(
        default_factory=list, description="Additional goals"
    )
    target_weight_loss: Optional[float] = Field(
        default=None, description="Target weight loss in kg"
    )
    target_timeframe: Optional[int] = Field(
        default=None, description="Target timeframe in months"
    )


class Constraints(BaseModel):
    """User's lifestyle constraints and preferences."""
    available_days_per_week: int = Field(
        ge=1, le=7, description="Days available for training"
    )
    minutes_per_session: int = Field(
        ge=15, le=180, description="Available minutes per session"
    )
    has_gym_access: bool = Field(default=False, description="Access to gym equipment")
    equipment_available: List[str] = Field(
        default_factory=list, description="Available equipment"
    )
    dietary_restrictions: List[str] = Field(
        default_factory=list, description="Dietary restrictions"
    )
    meals_per_day: Optional[int] = Field(
        default=3, ge=1, le=8, description="Number of meals per day"
    )
    sleep_hours_per_night: Optional[float] = Field(
        default=7, ge=3, le=12, description="Average sleep hours"
    )
    stress_level: Optional[Literal["low", "moderate", "high"]] = Field(
        default="moderate", description="Current stress level"
    )
    additional_notes: Optional[str] = Field(
        default=None, description="Additional notes or constraints"
    )


class OnboardingData(BaseModel):
    """Complete onboarding data submission."""
    demographics: Demographics
    activity_level: ActivityLevel
    medical_history: MedicalHistory
    goals: FitnessGoals
    constraints: Constraints


class OnboardingResponse(BaseModel):
    """Response for onboarding data submission."""
    success: bool = True
    message: str = Field(default="Onboarding data saved successfully")
    user_id: int
