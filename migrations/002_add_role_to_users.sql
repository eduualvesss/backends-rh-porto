-- coluna usada pelo US02 (Permissões) — 'admin' libera tudo direto,
-- 'usuario' depende da tabela granular user_permissions (ainda não criada)
ALTER TABLE users
ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'usuario';
