-- Dados de exemplo para desenvolvimento e teste.
-- NAO rodar em producao. Todos os dados sao ficticios.
--
-- Variacao proposital: aniversarios espalhados pelos 12 meses (US08),
-- generos e escolaridades diferentes (US09), um desligado e um com
-- deficiencia (filtros). Dado uniforme esconde bug.
--
-- CPFs ficticios, mas com digito verificador valido, para nao serem
-- rejeitados pela validacao do US04.

INSERT INTO colaboradores (
  nome, cpf, data_nascimento, data_admissao, data_demissao, status,
  etnia, possui_deficiencia, tipo_contrato,
  genero, escolaridade, estado_civil,
  rg, rg_orgao_emissor, pis,
  nome_mae, cidade_nascimento, uf_nascimento, tamanho_camisa,
  cbo, prazo_contrato, fonte_recurso,
  banco, agencia, conta_corrente, valor_vale_alimentacao
) VALUES

('Ana Beatriz Ferreira Lima', '10433218100', '1992-01-14', '2021-03-01', NULL, 'ativo',
 'Parda', FALSE, 'CLT',
 'Feminino', 'Ensino Superior Completo', 'Solteiro(a)',
 '4738291', 'SDS-PE', '12345678901',
 'Marta Ferreira Lima', 'Recife', 'PE', 'M',
 '2124-05', 'Indeterminado', 'Recurso Proprio',
 'Banco do Brasil', '1234', '56789-0', 600.00),

('Carlos Henrique Souza', '96001338914', '1988-02-27', '2019-07-15', NULL, 'ativo',
 'Branca', FALSE, 'CLT',
 'Masculino', 'Pos-graduacao', 'Casado(a)',
 '5829103', 'SDS-PE', '23456789012',
 'Rosa Maria Souza', 'Olinda', 'PE', 'G',
 '2124-10', 'Indeterminado', 'Recurso Proprio',
 'Caixa Economica', '4321', '11223-4', 600.00),

('Daniela Rocha Albuquerque', '08386379499', '1995-03-08', '2023-01-09', NULL, 'ativo',
 'Preta', FALSE, 'CLT',
 'Feminino', 'Ensino Superior Incompleto', 'Solteiro(a)',
 '6193847', 'SDS-PE', '34567890123',
 'Lucia Rocha Albuquerque', 'Jaboatao dos Guararapes', 'PE', 'P',
 '4110-10', 'Indeterminado', 'Convenio',
 'Nubank', '0001', '99887-7', 450.00),

('Eduardo Nunes Pereira', '02654235114', '1990-04-30', '2020-11-03', NULL, 'ativo',
 'Parda', TRUE, 'CLT',
 'Masculino', 'Ensino Medio Completo', 'Casado(a)',
 '7284910', 'SDS-PE', '45678901234',
 'Terezinha Nunes Pereira', 'Caruaru', 'PE', 'GG',
 '4110-05', 'Indeterminado', 'Recurso Proprio',
 'Itau', '5678', '33445-6', 450.00),

('Fernanda Cavalcanti Melo', '16155940789', '1985-05-19', '2018-02-20', NULL, 'ativo',
 'Branca', FALSE, 'CLT',
 'Feminino', 'Mestrado', 'Divorciado(a)',
 '3948172', 'SDS-PE', '56789012345',
 'Sonia Cavalcanti Melo', 'Recife', 'PE', 'M',
 '1421-05', 'Indeterminado', 'Recurso Proprio',
 'Bradesco', '2468', '77665-5', 750.00),

('Gabriel Torres dos Santos', '81618495950', '1998-06-25', '2024-04-01', NULL, 'ativo',
 'Preta', FALSE, 'Estagio',
 'Masculino', 'Ensino Superior Incompleto', 'Solteiro(a)',
 '8172639', 'SDS-PE', '67890123456',
 'Joana Torres dos Santos', 'Paulista', 'PE', 'M',
 '3171-05', 'Determinado', 'Convenio',
 'Banco do Brasil', '1234', '22334-5', 300.00),

('Helena Barbosa Andrade', '31034131656', '1993-08-11', '2022-06-13', NULL, 'ativo',
 'Amarela', FALSE, 'CLT',
 'Feminino', 'Ensino Superior Completo', 'Uniao Estavel',
 '2917364', 'SDS-PE', '78901234567',
 'Cristina Barbosa Andrade', 'Recife', 'PE', 'P',
 '2521-05', 'Indeterminado', 'Recurso Proprio',
 'Santander', '9876', '44556-6', 600.00),

('Igor Mendonca Vasconcelos', '47525534144', '1987-09-05', '2017-09-18', NULL, 'ativo',
 'Parda', FALSE, 'CLT',
 'Masculino', 'Pos-graduacao', 'Casado(a)',
 '1029384', 'SDS-PE', '89012345678',
 'Angela Mendonca Vasconcelos', 'Garanhuns', 'PE', 'G',
 '1425-10', 'Indeterminado', 'Recurso Proprio',
 'Itau', '5678', '88776-4', 750.00),

('Juliana Freitas Correia', '92832764851', '1996-11-22', '2023-08-07', NULL, 'ativo',
 'Branca', FALSE, 'PJ',
 'Feminino', 'Ensino Superior Completo', 'Solteiro(a)',
 '5647382', 'SDS-PE', '90123456789',
 'Patricia Freitas Correia', 'Recife', 'PE', 'M',
 '2611-05', 'Determinado', 'Convenio',
 'Nubank', '0001', '66554-3', 500.00),

-- desligado de proposito: testa o filtro de status e a exclusao logica
('Leonardo Aguiar Pinto', '35030564160', '1991-12-03', '2019-05-06', '2025-10-31', 'desligado',
 'Parda', FALSE, 'CLT',
 'Masculino', 'Ensino Medio Completo', 'Solteiro(a)',
 '9384756', 'SDS-PE', '01234567890',
 'Vera Aguiar Pinto', 'Recife', 'PE', 'GG',
 '4110-05', 'Indeterminado', 'Recurso Proprio',
 'Bradesco', '2468', '11009-8', 450.00);
