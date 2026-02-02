"""
User management endpoints with Supabase database.
"""
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Depends

from ..models import User, UserCreate, UserResponse, OnboardingData, OnboardingResponse
from ..database import get_supabase_client, SupabaseClient

router = APIRouter(prefix="/users", tags=["Users"])


def get_db() -> SupabaseClient:
    """Dependency for getting Supabase client."""
    return get_supabase_client()


@router.get(
    "",
    response_model=List[User],
    summary="List Users",
    description="Retrieve all users from the database.",
)
async def list_users(db: SupabaseClient = Depends(get_db)) -> List[User]:
    """
    Get a list of all users.
    """
    response = db.table("users").select("*").execute()
    
    return [
        User(
            id=row["id"],
            email=row["email"],
            name=row["name"],
            is_active=row.get("is_active", True),
            created_at=row["created_at"],
            updated_at=row.get("updated_at"),
        )
        for row in response.data
    ]


@router.get(
    "/{user_id}",
    response_model=User,
    summary="Get User",
    description="Retrieve a specific user by ID.",
)
async def get_user(user_id: int, db: SupabaseClient = Depends(get_db)) -> User:
    """
    Get a user by their ID.
    
    Args:
        user_id: The unique user identifier.
        
    Returns:
        The user data.
        
    Raises:
        HTTPException: If user not found.
    """
    response = db.table("users").select("*").eq("id", user_id).execute()
    
    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found",
        )
    
    row = response.data[0]
    return User(
        id=row["id"],
        email=row["email"],
        name=row["name"],
        is_active=row.get("is_active", True),
        created_at=row["created_at"],
        updated_at=row.get("updated_at"),
    )


@router.post(
    "",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create User",
    description="Create a new user account.",
)
async def create_user(user_data: UserCreate, db: SupabaseClient = Depends(get_db)) -> UserResponse:
    """
    Create a new user.
    
    Args:
        user_data: The user creation data.
        
    Returns:
        The created user wrapped in a response.
    """
    # Check for duplicate email
    existing = db.table("users").select("id").eq("email", user_data.email).execute()
    if existing.data:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )
    
    # Insert new user (password would be hashed in production)
    new_user = {
        "email": user_data.email,
        "name": user_data.name,
        "is_active": user_data.is_active,
        "password_hash": user_data.password,  # In production: hash the password!
        "created_at": datetime.utcnow().isoformat(),
    }
    
    response = db.table("users").insert(new_user).execute()
    
    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user",
        )
    
    row = response.data[0]
    user = User(
        id=row["id"],
        email=row["email"],
        name=row["name"],
        is_active=row.get("is_active", True),
        created_at=row["created_at"],
        updated_at=row.get("updated_at"),
    )
    
    return UserResponse(success=True, data=user)


@router.put(
    "/{user_id}",
    response_model=User,
    summary="Update User",
    description="Update an existing user.",
)
async def update_user(
    user_id: int,
    user_data: UserCreate,
    db: SupabaseClient = Depends(get_db),
) -> User:
    """
    Update a user's information.
    
    Args:
        user_id: The unique user identifier.
        user_data: The updated user data.
        
    Returns:
        The updated user.
    """
    # Check if user exists
    existing = db.table("users").select("id").eq("id", user_id).execute()
    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found",
        )
    
    # Update user
    update_data = {
        "email": user_data.email,
        "name": user_data.name,
        "is_active": user_data.is_active,
        "updated_at": datetime.utcnow().isoformat(),
    }
    
    response = db.table("users").update(update_data).eq("id", user_id).execute()
    
    row = response.data[0]
    return User(
        id=row["id"],
        email=row["email"],
        name=row["name"],
        is_active=row.get("is_active", True),
        created_at=row["created_at"],
        updated_at=row.get("updated_at"),
    )


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete User",
    description="Delete a user by ID.",
)
async def delete_user(user_id: int, db: SupabaseClient = Depends(get_db)) -> None:
    """
    Delete a user.
    
    Args:
        user_id: The unique user identifier.
        
    Raises:
        HTTPException: If user not found.
    """
    # Check if user exists
    existing = db.table("users").select("id").eq("id", user_id).execute()
    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found",
        )
    
    db.table("users").delete().eq("id", user_id).execute()


@router.post(
    "/{user_id}/onboarding",
    response_model=OnboardingResponse,
    summary="Save Onboarding Data",
    description="Save user onboarding profile data including demographics, activity level, medical history, goals, and constraints.",
)
async def save_onboarding_data(
    user_id: int,
    onboarding_data: OnboardingData,
    db: SupabaseClient = Depends(get_db),
) -> OnboardingResponse:
    """
    Save complete onboarding data for a user.
    
    Args:
        user_id: The unique user identifier.
        onboarding_data: Complete onboarding profile data.
        
    Returns:
        Success response with user_id.
        
    Raises:
        HTTPException: If user not found or save fails.
    """
    # Check if user exists
    existing = db.table("users").select("id").eq("id", user_id).execute()
    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found",
        )
    
    # Prepare profile data
    profile_data = {
        "user_id": user_id,
        # Demographics
        "age": onboarding_data.demographics.age,
        "sex": onboarding_data.demographics.sex,
        "height_cm": onboarding_data.demographics.height,
        "weight_kg": onboarding_data.demographics.weight,
        "bmi": onboarding_data.demographics.bmi,
        "body_fat_percentage": onboarding_data.demographics.body_fat_percentage,
        # Activity Level
        "structured_exercise_days": onboarding_data.activity_level.structured_exercise_days,
        "daily_steps": onboarding_data.activity_level.daily_steps,
        "sedentary_hours": onboarding_data.activity_level.sedentary_hours,
        "last_regular_exercise": onboarding_data.activity_level.last_regular_exercise,
        # Medical History
        "has_cardiovascular_disease": onboarding_data.medical_history.has_cardiovascular_disease,
        "has_chronic_conditions": onboarding_data.medical_history.has_diagnosed_chronic_conditions,
        "chronic_conditions_details": onboarding_data.medical_history.chronic_conditions_details,
        "has_back_pain": onboarding_data.medical_history.has_back_pain,
        "back_pain_details": onboarding_data.medical_history.back_pain_details,
        "taking_medications": onboarding_data.medical_history.taking_medications,
        "medications_details": onboarding_data.medical_history.medications_details,
        "family_history": onboarding_data.medical_history.family_history,
        # Goals
        "primary_goal": onboarding_data.goals.primary_goal,
        "secondary_goals": onboarding_data.goals.secondary_goals,
        "target_weight_loss_kg": onboarding_data.goals.target_weight_loss,
        "target_timeframe_months": onboarding_data.goals.target_timeframe,
        # Constraints
        "available_days_per_week": onboarding_data.constraints.available_days_per_week,
        "minutes_per_session": onboarding_data.constraints.minutes_per_session,
        "has_gym_access": onboarding_data.constraints.has_gym_access,
        "equipment_available": onboarding_data.constraints.equipment_available,
        "dietary_restrictions": onboarding_data.constraints.dietary_restrictions,
        "meals_per_day": onboarding_data.constraints.meals_per_day,
        "sleep_hours_per_night": onboarding_data.constraints.sleep_hours_per_night,
        "stress_level": onboarding_data.constraints.stress_level,
        "additional_notes": onboarding_data.constraints.additional_notes,
        # Timestamps
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }
    
    try:
        # Check if profile exists - update if so, insert if not
        existing_profile = db.table("user_profiles").select("id").eq("user_id", user_id).execute()
        
        if existing_profile.data:
            # Update existing profile
            db.table("user_profiles").update(profile_data).eq("user_id", user_id).execute()
        else:
            # Insert new profile
            db.table("user_profiles").insert(profile_data).execute()
        
        return OnboardingResponse(
            success=True,
            message="Onboarding data saved successfully",
            user_id=user_id,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save onboarding data: {str(e)}",
        )

