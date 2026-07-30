-- V4: Add email verification fields to users table
-- Requirements: 15.3, 15.4

ALTER TABLE users
    ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN email_verification_token VARCHAR(255) NULL,
    ADD COLUMN email_verification_token_expires_at TIMESTAMP NULL;

CREATE INDEX idx_users_email_verification_token
    ON users (email_verification_token);
