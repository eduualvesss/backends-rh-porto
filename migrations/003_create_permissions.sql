CREATE TABLE permissions (
  id          SERIAL PRIMARY KEY,
  key         VARCHAR(60) UNIQUE NOT NULL,
  description VARCHAR(120)
);

CREATE TABLE user_permissions (
  user_id       INTEGER NOT NULL REFERENCES users(id),
  permission_id INTEGER NOT NULL REFERENCES permissions(id),
  granted_at    TIMESTAMP DEFAULT NOW(),
  granted_by    INTEGER REFERENCES users(id),
  PRIMARY KEY (user_id, permission_id)
);

INSERT INTO permissions (key, description) VALUES
  ('colaboradores.view',   'Ver lista e ficha de colaboradores'),
  ('colaboradores.create', 'Cadastrar novo colaborador'),
  ('colaboradores.edit',   'Editar dados de colaborador'),
  ('colaboradores.delete', 'Desligar colaborador'),
  ('documentos.upload',    'Anexar documento a colaborador'),
  ('documentos.view',      'Visualizar e baixar documentos'),
  ('auditlog.view',        'Consultar o log de auditoria'),
  ('usuarios.manage',      'Criar usuarios e gerenciar permissoes'),
  ('relatorios.export',    'Exportar relatorios');
