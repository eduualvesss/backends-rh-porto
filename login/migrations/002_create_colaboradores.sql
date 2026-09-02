CREATE TABLE colaboradores (
  id                SERIAL PRIMARY KEY,
  nome              VARCHAR(150) NOT NULL,
  email             VARCHAR(255) NOT NULL UNIQUE,
  cpf               VARCHAR(11) NOT NULL UNIQUE,   -- só dígitos, sem pontuação (validação/limpeza no controller)
  telefone          VARCHAR(20),
  cargo             VARCHAR(100) NOT NULL,
  departamento      VARCHAR(100) NOT NULL,
  data_admissao     DATE NOT NULL,
  status            VARCHAR(20) NOT NULL DEFAULT 'ativo',  -- 'ativo' | 'inativo'
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW()
);
