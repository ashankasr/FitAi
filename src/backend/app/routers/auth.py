"""
Authentication endpoints for user login.
"""
from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr, Field

from ..database import get_supabase_client, SupabaseClient

router = APIRouter(prefix="/auth", tags=["Authentication"])


class LoginRequest(BaseModel):
    """Login request schema."""
    email: EmailStr = Field(description="User email address")
    password: str = Field(min_length=1, description="User password")


class LoginResponse(BaseModel):
    """Login response schema."""
    success: bool = True
    message: str = Field(default="Login successful")
    data: dict = Field(description="User data")


def get_db() -> SupabaseClient:
    """Dependency for getting Supabase client."""
    return get_supabase_client()


@router.post(
    "/login",
    response_model=LoginResponse,
    summary="User Login",
    description="Authenticate a user with email and password.",
)
async def login(
    credentials: LoginRequest,
    db: SupabaseClient = Depends(get_db),
) -> LoginResponse:
    """
    Authenticate a user.
    
    Args:
        credentials: Email and password.
        
    Returns:
        Login response with user data.
        
    Raises:
        HTTPException: If credentials are invalid.
    """
    # Find user by email
    response = db.table("users").select("*").eq("email", credentials.email).execute()
    
    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    user = response.data[0]
    
    # Check password (in production, use proper password hashing!)
    # For now, we're doing a simple comparison
    if user.get("password_hash") != credentials.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    # Check if user is active
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )
    
    # Update last login timestamp (optional)
    try:
        db.table("users").update(
            {"updated_at": datetime.utcnow().isoformat()}
        ).eq("id", user["id"]).execute()
    except Exception:
        pass  # Non-critical, don't fail login
    
    # Return user data (exclude password)
    user_data = {
        "id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "is_active": user.get("is_active", True),
        "created_at": user["created_at"],
    }
    
    return LoginResponse(
        success=True,
        message="Login successful",
        data=user_data,
    )


@router.post(
    "/register",
    response_model=LoginResponse,
    status_code=status.HTTP_201_CREATED,
    summary="User Registration",
    description="Register a new user account.",
)
async def register(
    credentials: LoginRequest,
    name: str = "New User",
    db: SupabaseClient = Depends(get_db),
) -> LoginResponse:
    """
    Register a new user.
    
    Args:
        credentials: Email and password.
        name: User's full name.
        
    Returns:
        Login response with new user data.
        
    Raises:
        HTTPException: If email already exists.
    """
    # Check if email already exists
    existing = db.table("users").select("id").eq("email", credentials.email).execute()
    if existing.data:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )
    
    # Create new user
    new_user = {
        "email": credentials.email,
        "name": name,
        "password_hash": credentials.password,  # In production: hash this!
        "is_active": True,
        "created_at": datetime.utcnow().isoformat(),
    }
    
    response = db.table("users").insert(new_user).execute()
    
    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user",
        )
    
    user = response.data[0]
    
    user_data = {
        "id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "is_active": user.get("is_active", True),
        "created_at": user["created_at"],
    }
    
    return LoginResponse(
        success=True,
        message="Registration successful",
        data=user_data,
    )
