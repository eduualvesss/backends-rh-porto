CREATE TABLE atestados (
  id              SERIAL PRIMARY KEY,
  colaborador_id  INTEGER NOT NULL REFERENCES colaboradores(id),
  data_inicio     DATE NOT NULL,
  data_fim        DATE NOT NULL,
  dias            INTEGER NOT NULL,
  cid             VARCHAR(10),
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_atestados_colaborador ON atestados (colaborador_id);