"""
Script to add a user to the database.
Usage: python add_user.py --email user@example.com --name "John Doe" --password "securepass123"
"""
import argparse
import sys
from datetime import datetime

# Add parent directory to path for imports
sys.path.insert(0, ".")

from app.database import get_supabase_client


def add_user(email: str, name: str, password: str, is_active: bool = True) -> dict:
    """
    Add a new user to the database.
    
    Args:
        email: User's email address
        name: User's full name
        password: User's password (will be stored as hash in production)
        is_active: Whether the user is active
        
    Returns:
        The created user data
    """
    db = get_supabase_client()
    
    # Check if email already exists
    existing = db.table("users").select("id").eq("email", email).execute()
    if existing.data:
        raise ValueError(f"User with email '{email}' already exists!")
    
    # Create user data
    user_data = {
        "email": email,
        "name": name,
        "password_hash": password,  # In production: use bcrypt or similar!
        "is_active": is_active,
        "created_at": datetime.utcnow().isoformat(),
    }
    
    # Insert user
    response = db.table("users").insert(user_data).execute()
    
    if not response.data:
        raise RuntimeError("Failed to create user")
    
    return response.data[0]


def main():
    parser = argparse.ArgumentParser(
        description="Add a user to the FitAI database",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python add_user.py --email john@example.com --name "John Doe" --password "mypassword123"
  python add_user.py -e jane@example.com -n "Jane Smith" -p "securepass" --inactive
        """
    )
    
    parser.add_argument(
        "-e", "--email",
        required=True,
        help="User's email address"
    )
    parser.add_argument(
        "-n", "--name",
        required=True,
        help="User's full name"
    )
    parser.add_argument(
        "-p", "--password",
        required=True,
        help="User's password (min 8 characters)"
    )
    parser.add_argument(
        "--inactive",
        action="store_true",
        help="Create user as inactive"
    )
    
    args = parser.parse_args()
    
    # Validate password length
    if len(args.password) < 8:
        print("❌ Error: Password must be at least 8 characters")
        sys.exit(1)
    
    try:
        print(f"➕ Adding user: {args.email}")
        user = add_user(
            email=args.email,
            name=args.name,
            password=args.password,
            is_active=not args.inactive
        )
        
        print("\n✅ User created successfully!")
        print(f"   ID:       {user['id']}")
        print(f"   Email:    {user['email']}")
        print(f"   Name:     {user['name']}")
        print(f"   Active:   {user.get('is_active', True)}")
        print(f"   Created:  {user['created_at']}")
        
    except ValueError as e:
        print(f"❌ Validation Error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
