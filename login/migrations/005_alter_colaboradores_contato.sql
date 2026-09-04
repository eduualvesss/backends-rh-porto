-- Adiciona campos de contato/cargo que existiam no schema do Cadu (US04)
-- mas nao existiam no schema original desta tabela (migration 004).
--
-- Decisoes tomadas em 02/09, alinhadas com o Cadu:
--   - email: obrigatorio e UNICO (nao pode haver dois colaboradores com o mesmo email)
--   - telefone, cargo, departamento: obrigatorios
--   - status continua 'ativo' / 'desligado' (o Cadu ajusta o codigo dele pra usar
--     'desligado' em vez de 'inativo')
--
-- PRE-REQUISITO OBRIGATORIO: a tabela precisa estar vazia antes de rodar isso
-- (ja foi esvaziada manualmente no Neon antes deste passo).

ALTER TABLE colaboradores
  ADD COLUMN email VARCHAR(150) UNIQUE NOT NULL,
  ADD COLUMN telefone VARCHAR(20) NOT NULL,
  ADD COLUMN cargo VARCHAR(100) NOT NULL,
  ADD COLUMN departamento VARCHAR(100) NOT NULL;

-- Nao criar indice separado para email: o UNIQUE acima ja cria um automaticamente.
