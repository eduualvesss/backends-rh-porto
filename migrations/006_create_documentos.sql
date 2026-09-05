-- Documentos pessoais do colaborador (CTPS, CNH, documentos de dependentes)
-- Requisito do RH (Especificacoes_Sistema_RH.docx, secao 3) — desejavel na v1, nao obrigatorio.
--
-- A tabela guarda só o REGISTRO/METADADO do arquivo (nome, tipo, caminho).
-- O arquivo em si fica num serviço de storage à parte (Supabase Storage, S3, ou
-- disco local via Multer) — decisão ainda pendente, não bloqueia esta migration.

CREATE TABLE documentos (
  id                    SERIAL PRIMARY KEY,
  colaborador_id        INTEGER NOT NULL REFERENCES colaboradores(id),
  tipo                  VARCHAR(30) NOT NULL CHECK (tipo IN ('ctps', 'cnh', 'dependente', 'outro')),
  dependente_nome       VARCHAR(150),
  nome_arquivo          VARCHAR(255) NOT NULL,
  caminho_armazenamento VARCHAR(500) NOT NULL,
  tipo_mime             VARCHAR(100),
  tamanho_bytes         INTEGER,
  uploaded_by           INTEGER REFERENCES users(id),
  created_at            TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_documentos_colaborador ON documentos (colaborador_id);