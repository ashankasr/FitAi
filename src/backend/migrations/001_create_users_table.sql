-- Supabase SQL Migration: Create Users Table
-- Run this in your Supabase SQL Editor

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read all users
CREATE POLICY "Allow read access for authenticated users" ON users
    FOR SELECT
    USING (true);

-- Policy: Allow authenticated users to insert
CREATE POLICY "Allow insert for authenticated users" ON users
    FOR INSERT
    WITH CHECK (true);

-- Policy: Allow users to update their own record
CREATE POLICY "Allow update for authenticated users" ON users
    FOR UPDATE
    USING (true);

-- Policy: Allow delete for authenticated users
CREATE POLICY "Allow delete for authenticated users" ON users
    FOR DELETE
    USING (true);

-- Optional: Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Optional: Trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
