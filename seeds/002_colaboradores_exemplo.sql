INSERT INTO colaboradores
  (nome, cpf, data_nascimento, data_admissao, data_demissao, status,
   etnia, possui_deficiencia, tipo_contrato, genero, escolaridade, estado_civil,
   email, telefone, cargo, departamento)
VALUES
  ('Ana Beatriz Souza', '12345678909', '1990-01-14', '2022-03-01', NULL, 'ativo',
   'Parda', FALSE, 'CLT', 'Feminino', 'Ensino Superior Completo', 'Solteiro(a)',
   'ana.souza@empresa-exemplo.com.br', '(81) 98111-0001', 'Analista de RH', 'Recursos Humanos'),

  ('Bruno Carvalho Lima', '98765432100', '1998-02-22', '2023-06-15', NULL, 'ativo',
   'Branca', FALSE, 'Estagio', 'Masculino', 'Ensino Superior Incompleto', 'Solteiro(a)',
   'bruno.lima@empresa-exemplo.com.br', '(81) 98111-0002', 'Estagiario de TI', 'Tecnologia'),

  ('Camila Rodrigues Alves', '11223344517', '1985-03-30', '2019-09-10', NULL, 'ativo',
   'Preta', FALSE, 'PJ', 'Feminino', 'Pos-graduacao', 'Casado(a)',
   'camila.alves@empresa-exemplo.com.br', '(81) 98111-0003', 'Consultora Financeira', 'Financeiro'),

  ('Diego Ferreira Santos', '55443322150', '1992-04-08', '2021-01-20', NULL, 'ativo',
   'Parda', FALSE, 'CLT', 'Masculino', 'Ensino Medio Completo', 'Solteiro(a)',
   'diego.santos@empresa-exemplo.com.br', '(81) 98111-0004', 'Assistente Comercial', 'Comercial'),

  ('Elisa Martins Costa', '31415926590', '1988-05-19', '2020-02-12', NULL, 'ativo',
   'Branca', TRUE, 'CLT', 'Feminino', 'Ensino Superior Completo', 'Casado(a)',
   'elisa.costa@empresa-exemplo.com.br', '(81) 98111-0005', 'Analista de Marketing', 'Marketing'),

  ('Fabio Nogueira Alves', '27182818205', '1995-06-25', '2022-11-05', NULL, 'ativo',
   'Amarela', FALSE, 'Estagio', 'Masculino', 'Ensino Superior Incompleto', 'Solteiro(a)',
   'fabio.alves@empresa-exemplo.com.br', '(81) 98111-0006', 'Estagiario de Operacoes', 'Operacoes'),

  ('Gabriela Pinto Rocha', '61803398809', '1991-07-11', '2018-08-01', NULL, 'ativo',
   'Parda', FALSE, 'PJ', 'Feminino', 'Pos-graduacao', 'Uniao Estavel',
   'gabriela.rocha@empresa-exemplo.com.br', '(81) 98111-0007', 'Advogada Trabalhista', 'Juridico'),

  ('Henrique Duarte Melo', '44455566619', '1983-08-03', '2017-04-18', '2025-10-31', 'desligado',
   'Branca', FALSE, 'CLT', 'Masculino', 'Ensino Medio Completo', 'Divorciado(a)',
   'henrique.melo@empresa-exemplo.com.br', '(81) 98111-0008', 'Atendente', 'Atendimento'),

  ('Isabela Correia Dias', '77889900198', '1996-09-27', '2023-02-14', NULL, 'ativo',
   'Preta', FALSE, 'CLT', 'Feminino', 'Ensino Superior Completo', 'Solteiro(a)',
   'isabela.dias@empresa-exemplo.com.br', '(81) 98111-0009', 'Analista de Logistica', 'Logistica'),

  ('Joao Vitor Barros', '82845904509', '1999-10-05', '2024-01-08', NULL, 'ativo',
   'Parda', FALSE, 'Estagio', 'Masculino', 'Ensino Medio Completo', 'Solteiro(a)',
   'joao.barros@empresa-exemplo.com.br', '(81) 98111-0010', 'Estagiario de Facilities', 'Facilities');
