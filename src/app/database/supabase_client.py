"""
Supabase client using REST API via httpx.
A lightweight alternative that doesn't require additional compilation.
"""
from functools import lru_cache
from typing import Any, Optional
import httpx

from ..config import get_settings


class SupabaseClient:
    """
    Lightweight Supabase client using REST API.
    """
    
    def __init__(self, url: str, key: str):
        self.url = url.rstrip("/")
        self.key = key
        self.rest_url = f"{self.url}/rest/v1"
        self.headers = {
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        }
        self._client = httpx.Client(headers=self.headers, timeout=30.0)
    
    def table(self, name: str) -> "TableQuery":
        """Get a table query builder."""
        return TableQuery(self, name)
    
    def close(self):
        """Close the HTTP client."""
        self._client.close()


class TableQuery:
    """
    Query builder for Supabase table operations.
    """
    
    def __init__(self, client: SupabaseClient, table: str):
        self.client = client
        self.table = table
        self._url = f"{client.rest_url}/{table}"
        self._filters: list[str] = []
        self._select_cols = "*"
    
    def select(self, columns: str = "*") -> "TableQuery":
        """Select columns to return."""
        self._select_cols = columns
        return self
    
    def eq(self, column: str, value: Any) -> "TableQuery":
        """Add equality filter."""
        self._filters.append(f"{column}=eq.{value}")
        return self
    
    def neq(self, column: str, value: Any) -> "TableQuery":
        """Add not equal filter."""
        self._filters.append(f"{column}=neq.{value}")
        return self
    
    def _build_params(self) -> dict:
        """Build query parameters."""
        params = {"select": self._select_cols}
        for f in self._filters:
            key, val = f.split("=", 1)
            params[key] = val
        return params
    
    def execute(self) -> "QueryResponse":
        """Execute SELECT query."""
        response = self.client._client.get(
            self._url,
            params=self._build_params(),
        )
        response.raise_for_status()
        return QueryResponse(response.json())
    
    def insert(self, data: dict | list) -> "TableQuery":
        """Prepare insert operation."""
        self._insert_data = data if isinstance(data, list) else [data]
        return self
    
    def update(self, data: dict) -> "TableQuery":
        """Prepare update operation."""
        self._update_data = data
        return self
    
    def delete(self) -> "TableQuery":
        """Prepare delete operation."""
        self._delete = True
        return self
    
    def execute(self) -> "QueryResponse":
        """Execute the query."""
        params = self._build_params() if self._filters else {}
        
        # Handle DELETE
        if hasattr(self, "_delete") and self._delete:
            response = self.client._client.delete(
                self._url,
                params=params,
            )
            response.raise_for_status()
            return QueryResponse([])
        
        # Handle UPDATE
        if hasattr(self, "_update_data"):
            response = self.client._client.patch(
                self._url,
                json=self._update_data,
                params=params,
            )
            response.raise_for_status()
            return QueryResponse(response.json())
        
        # Handle INSERT
        if hasattr(self, "_insert_data"):
            response = self.client._client.post(
                self._url,
                json=self._insert_data[0] if len(self._insert_data) == 1 else self._insert_data,
            )
            response.raise_for_status()
            result = response.json()
            return QueryResponse(result if isinstance(result, list) else [result])
        
        # Default: SELECT
        response = self.client._client.get(
            self._url,
            params=params,
        )
        response.raise_for_status()
        return QueryResponse(response.json())


class QueryResponse:
    """Response wrapper for query results."""
    
    def __init__(self, data: list):
        self.data = data if isinstance(data, list) else [data]


@lru_cache
def get_supabase_client() -> SupabaseClient:
    """
    Get a cached Supabase client instance.
    
    Returns:
        SupabaseClient instance.
        
    Raises:
        ValueError: If Supabase URL or key is not configured.
    """
    settings = get_settings()
    
    if not settings.supabase_url or settings.supabase_url == "your_supabase_project_url":
        raise ValueError(
            "Supabase URL must be configured. "
            "Set SUPABASE_URL in your .env file."
        )
    
    if not settings.supabase_key or settings.supabase_key == "your_supabase_anon_key":
        raise ValueError(
            "Supabase Key must be configured. "
            "Set SUPABASE_KEY in your .env file."
        )
    
    return SupabaseClient(settings.supabase_url, settings.supabase_key)


# Alias for compatibility
supabase_client: Optional[SupabaseClient] = None


def init_supabase() -> SupabaseClient:
    """Initialize the global Supabase client."""
    global supabase_client
    supabase_client = get_supabase_client()
    return supabase_client
