-- migrations/010_add_campos_esocial.sql
-- Campos de FGTS, vínculo e eSocial mencionados no sistema antigo do RH.
-- PROVISÓRIO: nomes exatos e completos dependem do extrato de referência
-- que o RH ainda vai enviar (Especificacoes_Sistema_RH.docx, secao 8).
-- Todos opcionais — não travam nenhum fluxo existente.

ALTER TABLE colaboradores
  ADD COLUMN matricula VARCHAR(30),
  ADD COLUMN fgts_conta VARCHAR(30),
  ADD COLUMN categoria_esocial VARCHAR(20);