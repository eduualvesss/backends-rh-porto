CREATE TABLE audit_logs (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER REFERENCES users(id),
  action        VARCHAR(20) NOT NULL,   -- 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN'
  resource      VARCHAR(40) NOT NULL,   -- ex: 'colaborador', 'usuario'
  resource_id   INTEGER,
  before_data   JSONB,                  -- estado antes (nullable, só em UPDATE/DELETE)
  after_data    JSONB,                  -- estado depois (nullable, só em CREATE/UPDATE)
  ip_address    VARCHAR(45),
  created_at    TIMESTAMP DEFAULT NOW()
);