CREATE TABLE sender_emails (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_in INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);