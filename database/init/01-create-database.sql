-- Create default database if not exists
SELECT 'CREATE DATABASE memory_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'memory_db')\gexec

-- Connect to the database
\c memory_db;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";