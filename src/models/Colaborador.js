// aqui fica só a parte que conversa com o banco
// controller não sabe SQL, só chama essas funções — separação de responsabilidade
const pool = require('../config/db');

// mapa campo do body (camelCase) -> coluna do banco (snake_case)
// os 8 campos originais (nome, email, cpf, telefone, cargo, departamento, dataAdmissao/data_admissao, status)
// ficam tratados à parte porque são obrigatórios — isso aqui é só o resto do schema completo (migration 005)
const CAMPOS_OPCIONAIS = {
  dataNascimento: 'data_nascimento',
  etnia: 'etnia',
  possuiDeficiencia: 'possui_deficiencia',
  tipoContrato: 'tipo_contrato',
  genero: 'genero',
  escolaridade: 'escolaridade',
  estadoCivil: 'estado_civil',
  rg: 'rg',
  rgOrgaoEmissor: 'rg_orgao_emissor',
  rgDataEmissao: 'rg_data_emissao',
  pis: 'pis',
  ctpsNumero: 'ctps_numero',
  ctpsSerie: 'ctps_serie',
  tituloZona: 'titulo_zona',
  tituloSecao: 'titulo_secao',
  tituloDataEmissao: 'titulo_data_emissao',
  nomeMae: 'nome_mae',
  nomePai: 'nome_pai',
  cidadeNascimento: 'cidade_nascimento',
  ufNascimento: 'uf_nascimento',
  tamanhoCamisa: 'tamanho_camisa',
  cbo: 'cbo',
  prazoContrato: 'prazo_contrato',
  duracaoContrato: 'duracao_contrato',
  fonteRecurso: 'fonte_recurso',
  banco: 'banco',
  agencia: 'agencia',
  contaCorrente: 'conta_corrente',
  valorValeAlimentacao: 'valor_vale_alimentacao',
};

async function createColaborador(dados) {
  const { nome, email, cpf, telefone, cargo, departamento, dataAdmissao, status } = dados;

  // colunas obrigatórias (schema original) sempre entram no INSERT
  const colunas = ['nome', 'email', 'cpf', 'telefone', 'cargo', 'departamento', 'data_admissao', 'status'];
  const valores = [nome, email, cpf, telefone, cargo, departamento, dataAdmissao, status || 'ativo'];

  // resto do schema completo — só entra se veio preenchido no body
  for (const [campo, coluna] of Object.entries(CAMPOS_OPCIONAIS)) {
    if (dados[campo] !== undefined) {
      colunas.push(coluna);
      valores.push(dados[campo]);
    }
  }

  // $1, $2... são placeholders — pg escapa o valor sozinho, evita SQL injection
  // NUNCA concatenar valor direto na string da query
  const placeholders = valores.map((_, i) => `$${i + 1}`);

  const result = await pool.query(
    `INSERT INTO colaboradores (${colunas.join(', ')})
     VALUES (${placeholders.join(', ')})
     RETURNING *`,
    valores
  );
  return result.rows[0];
}

async function findAll({ page = 1, limit = 20, departamento, status } = {}) {
  // page/limit podem vir como string (query params) — converte pra Number antes de calcular
  // limit é travado em 100 pra evitar que alguém peça a tabela inteira de uma vez
  // page nunca deixa o offset ficar negativo
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Number(limit) || 20, 100);
  const offset = (safePage - 1) * safeLimit;

  // WHERE é montado dinamicamente, mas só com nomes de coluna fixos —
  // os valores sempre entram via placeholder, nunca concatenados na string
  const conditions = [];
  const params = [];

  if (departamento !== undefined) {
    params.push(departamento);
    conditions.push(`departamento = $${params.length}`);
  }

  if (status !== undefined) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  params.push(safeLimit);
  const limitIndex = params.length;
  params.push(offset);
  const offsetIndex = params.length;

  const result = await pool.query(
    `SELECT * FROM colaboradores
     ${where}
     ORDER BY created_at DESC
     LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
    params
  );
  return result.rows;
}

async function findById(id) {
  const result = await pool.query('SELECT * FROM colaboradores WHERE id = $1', [id]);
  return result.rows[0];
}

async function findByEmail(email) {
  const result = await pool.query('SELECT * FROM colaboradores WHERE email = $1', [email]);
  return result.rows[0];
}

async function findByCpf(cpf) {
  const result = await pool.query('SELECT * FROM colaboradores WHERE cpf = $1', [cpf]);
  return result.rows[0];
}

async function findAniversariantesNascimento(mes) {
  const result = await pool.query(
    `SELECT id, nome, cargo, departamento, data_nascimento
     FROM colaboradores
     WHERE status = 'ativo' AND EXTRACT(MONTH FROM data_nascimento) = $1
     ORDER BY EXTRACT(DAY FROM data_nascimento)`,
    [mes]
  );
  return result.rows;
}

async function findAniversariantesEmpresa(mes) {
  // AGE(NOW(), data_admissao) dá o intervalo completo; EXTRACT(YEAR ...) pega só os anos completos
  const result = await pool.query(
    `SELECT id, nome, cargo, departamento, data_admissao,
            EXTRACT(YEAR FROM AGE(NOW(), data_admissao))::int AS anos_empresa
     FROM colaboradores
     WHERE status = 'ativo' AND EXTRACT(MONTH FROM data_admissao) = $1
     ORDER BY EXTRACT(DAY FROM data_admissao)`,
    [mes]
  );
  return result.rows;
}

async function getPorGenero() {
  // NULLIF converte string vazia em NULL, aí o COALESCE agrupa junto com quem já veio NULL
  const result = await pool.query(
    `SELECT COALESCE(NULLIF(TRIM(genero), ''), 'Não informado') AS categoria, COUNT(*)::int AS quantidade
     FROM colaboradores
     WHERE status = 'ativo'
     GROUP BY categoria
     ORDER BY quantidade DESC`
  );
  return result.rows;
}

async function getPorEscolaridade() {
  const result = await pool.query(
    `SELECT COALESCE(NULLIF(TRIM(escolaridade), ''), 'Não informado') AS categoria, COUNT(*)::int AS quantidade
     FROM colaboradores
     WHERE status = 'ativo'
     GROUP BY categoria
     ORDER BY quantidade DESC`
  );
  return result.rows;
}

async function getPorEstadoCivil() {
  const result = await pool.query(
    `SELECT COALESCE(NULLIF(TRIM(estado_civil), ''), 'Não informado') AS categoria, COUNT(*)::int AS quantidade
     FROM colaboradores
     WHERE status = 'ativo'
     GROUP BY categoria
     ORDER BY quantidade DESC`
  );
  return result.rows;
}

async function getPorFaixaEtaria() {
  // subquery calcula a faixa por linha, query de fora só agrupa e conta
  const result = await pool.query(
    `SELECT categoria, COUNT(*)::int AS quantidade
     FROM (
       SELECT
         CASE
           WHEN data_nascimento IS NULL THEN 'Não informado'
           WHEN EXTRACT(YEAR FROM AGE(NOW(), data_nascimento)) BETWEEN 18 AND 24 THEN '18-24'
           WHEN EXTRACT(YEAR FROM AGE(NOW(), data_nascimento)) BETWEEN 25 AND 34 THEN '25-34'
           WHEN EXTRACT(YEAR FROM AGE(NOW(), data_nascimento)) BETWEEN 35 AND 44 THEN '35-44'
           WHEN EXTRACT(YEAR FROM AGE(NOW(), data_nascimento)) BETWEEN 45 AND 54 THEN '45-54'
           WHEN EXTRACT(YEAR FROM AGE(NOW(), data_nascimento)) BETWEEN 55 AND 64 THEN '55-64'
           ELSE '65+'
         END AS categoria
       FROM colaboradores
       WHERE status = 'ativo'
     ) faixas
     GROUP BY categoria`
  );
  return result.rows;
}

async function getIndicadorDesligamentos() {
  // único indicador que considera ativo + desligado — os outros só olham quem está ativo
  const result = await pool.query(
    `SELECT
       COUNT(*)::int AS total,
       COUNT(*) FILTER (WHERE status = 'desligado')::int AS desligados
     FROM colaboradores`
  );
  return result.rows[0];
}

async function updateColaborador(id, fields) {
  // lista trava quais colunas podem ser tocadas — chave nunca vem direto do body pro SQL
  // schema original + resto das colunas do schema completo (migration 005)
  const allowed = [
    'nome', 'email', 'cpf', 'telefone', 'cargo', 'departamento', 'data_admissao', 'status',
    ...Object.values(CAMPOS_OPCIONAIS),
  ];
  const sets = [];
  const params = [];

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      params.push(fields[key]);
      sets.push(`${key} = $${params.length}`);
    }
  }

  if (sets.length === 0) return null; // nada pra atualizar, controller decide o que fazer

  sets.push('updated_at = NOW()');
  params.push(id);

  const result = await pool.query(
    `UPDATE colaboradores SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
    params
  );
  return result.rows[0];
}

async function deleteColaborador(id) {
  // exclusão lógica, não física — preserva histórico pra relatório de ex-funcionários
  // e por exigência trabalhista de guarda de registro (ver Checklist-Banco-Colaboradores.md)
  const result = await pool.query(
    `UPDATE colaboradores
     SET status = 'desligado', data_demissao = NOW()
     WHERE id = $1
     RETURNING *`,
    [id]
  );
  return result.rows[0];
}

module.exports = {
  createColaborador,
  findAll,
  findById,
  findByEmail,
  findByCpf,
  findAniversariantesNascimento,
  findAniversariantesEmpresa,
  getPorGenero,
  getPorEscolaridade,
  getPorEstadoCivil,
  getPorFaixaEtaria,
  getIndicadorDesligamentos,
  updateColaborador,
  deleteColaborador,
  CAMPOS_OPCIONAIS,
};