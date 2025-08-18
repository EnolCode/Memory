-- Ensure the admin user has the correct password
ALTER USER admin WITH PASSWORD 'password';

-- Grant all privileges on the database
GRANT ALL PRIVILEGES ON DATABASE memory_db TO admin;

-- Create a test table to verify connection
CREATE TABLE IF NOT EXISTS test_connection (
    id SERIAL PRIMARY KEY,
    message VARCHAR(255)
);

INSERT INTO test_connection (message) VALUES ('Database initialized successfully');