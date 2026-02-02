"""
Pydantic schemas for request/response validation.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, EmailStr, ConfigDict


# ============================================================================
# Base Schemas
# ============================================================================

class BaseSchema(BaseModel):
    """Base schema with common configuration."""
    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Health & System Schemas
# ============================================================================

class HealthResponse(BaseModel):
    """Health check response."""
    status: str = Field(default="healthy", description="Service health status")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    version: str = Field(description="API version")


class ErrorResponse(BaseModel):
    """Standard error response."""
    detail: str = Field(description="Error message")
    code: Optional[str] = Field(default=None, description="Error code")


# ============================================================================
# User Schemas
# ============================================================================

class UserBase(BaseModel):
    """Base user schema with shared fields."""
    email: EmailStr = Field(description="User email address")
    name: str = Field(min_length=1, max_length=100, description="User full name")
    is_active: bool = Field(default=True, description="Whether user is active")


class UserCreate(UserBase):
    """Schema for creating a new user."""
    password: str = Field(min_length=8, description="User password (min 8 chars)")


class User(UserBase):
    """Full user schema with all fields."""
    id: int = Field(description="Unique user ID")
    created_at: datetime = Field(description="Account creation timestamp")
    updated_at: Optional[datetime] = Field(default=None, description="Last update timestamp")
    
    model_config = ConfigDict(from_attributes=True)


class UserResponse(BaseModel):
    """API response wrapper for user data."""
    success: bool = True
    data: User
