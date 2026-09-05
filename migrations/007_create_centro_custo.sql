-- Catálogo dos centros de custo (fixos, 13 no total conforme o RH)
CREATE TABLE centros_custo (
  id      SERIAL PRIMARY KEY,
  nome    VARCHAR(100) UNIQUE NOT NULL,
  codigo  VARCHAR(20) UNIQUE
);

-- Histórico: um colaborador pode passar por vários centros de custo ao longo do tempo
CREATE TABLE centro_custo_historico (
  id              SERIAL PRIMARY KEY,
  colaborador_id  INTEGER NOT NULL REFERENCES colaboradores(id),
  centro_custo_id INTEGER NOT NULL REFERENCES centros_custo(id),
  data_inicio     DATE NOT NULL,
  data_fim        DATE,
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cch_colaborador ON centro_custo_historico (colaborador_id);
CREATE INDEX idx_cch_centro_custo ON centro_custo_historico (centro_custo_id);