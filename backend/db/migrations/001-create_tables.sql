-- backend/db/migrations/001_create_tables.sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  asin TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  canadian_score INTEGER NOT NULL,
  raw_data TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE votes (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  vote INTEGER NOT NULL,
  review TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
