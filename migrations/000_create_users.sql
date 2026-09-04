CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password      VARCHAR(60) NOT NULL,   -- hash bcrypt tem sempre 60 caracteres (ex: $2b$10$...)
  created_at    TIMESTAMP DEFAULT NOW()
);
