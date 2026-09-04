CREATE TABLE colaboradores (
  -- controle
  id                      SERIAL PRIMARY KEY,
  created_at              TIMESTAMP DEFAULT NOW(),
  updated_at              TIMESTAMP DEFAULT NOW(),

  -- básicos
  nome                    VARCHAR(150) NOT NULL,
  cpf                     VARCHAR(11) UNIQUE NOT NULL, -- só dígitos, sem pontuação
  data_nascimento         DATE,
  data_admissao           DATE NOT NULL,
  data_demissao           DATE,
  status                  VARCHAR(20) NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'desligado')),
  etnia                   VARCHAR(40),
  possui_deficiencia      BOOLEAN DEFAULT FALSE,
  tipo_contrato           VARCHAR(40),

  -- demográficos — necessários para os indicadores do US09
  genero                  VARCHAR(30),
  escolaridade            VARCHAR(60),
  estado_civil            VARCHAR(30),

  -- identificação
  rg                      VARCHAR(20),
  rg_orgao_emissor        VARCHAR(20),
  rg_data_emissao         DATE,
  pis                     VARCHAR(20),
  ctps_numero             VARCHAR(20),
  ctps_serie              VARCHAR(20),
  titulo_zona             VARCHAR(10),
  titulo_secao            VARCHAR(10),
  titulo_data_emissao     DATE,

  -- pessoais
  nome_mae                VARCHAR(150),
  nome_pai                VARCHAR(150),
  cidade_nascimento       VARCHAR(100),
  uf_nascimento           CHAR(2),
  tamanho_camisa          VARCHAR(5),

  -- contratuais
  cbo                     VARCHAR(20),
  prazo_contrato          VARCHAR(40),
  duracao_contrato        VARCHAR(40),
  fonte_recurso           VARCHAR(80),

  -- financeiros
  banco                   VARCHAR(60),
  agencia                 VARCHAR(20),
  conta_corrente          VARCHAR(30),
  valor_vale_alimentacao  NUMERIC(10,2)
);

-- quase toda listagem filtra por ativo/desligado
CREATE INDEX idx_colaboradores_status ON colaboradores (status);
