"""
User management endpoints with Supabase database.
"""
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Depends

from ..models import User, UserCreate, UserResponse
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
