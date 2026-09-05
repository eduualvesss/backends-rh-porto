CREATE TABLE ferias (
  id                          SERIAL PRIMARY KEY,
  colaborador_id              INTEGER NOT NULL REFERENCES colaboradores(id),
  periodo_aquisitivo_inicio   DATE NOT NULL,
  periodo_aquisitivo_fim      DATE NOT NULL,
  data_inicio_gozo            DATE,
  data_fim_gozo               DATE,
  dias_gozados                INTEGER,
  dias_vendidos               INTEGER DEFAULT 0,
  created_at                  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ferias_colaborador ON ferias (colaborador_id);