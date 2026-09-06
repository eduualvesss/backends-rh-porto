// aqui fica só a parte que conversa com o banco
// controller não sabe SQL, só chama essas funções — separação de responsabilidade
const pool = require('../config/db');

// tabela já existe desde a migration 006 — este model só chegou depois (US07)
async function create({
  colaboradorId,
  tipo,
  dependenteNome,
  nomeArquivo,
  caminhoArmazenamento,
  tipoMime,
  tamanhoBytes,
  uploadedBy,
}) {
  const result = await pool.query(
    `INSERT INTO documentos
       (colaborador_id, tipo, dependente_nome, nome_arquivo, caminho_armazenamento, tipo_mime, tamanho_bytes, uploaded_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [colaboradorId, tipo, dependenteNome || null, nomeArquivo, caminhoArmazenamento, tipoMime, tamanhoBytes, uploadedBy]
  );
  return result.rows[0];
}

async function findByColaborador(colaboradorId) {
  const result = await pool.query(
    `SELECT id, colaborador_id, tipo, dependente_nome, nome_arquivo, tipo_mime, tamanho_bytes, uploaded_by, created_at
     FROM documentos
     WHERE colaborador_id = $1
     ORDER BY created_at DESC`,
    [colaboradorId]
  );
  return result.rows;
}

// inclui caminho_armazenamento de propósito — só quem vai ler o arquivo do disco
// (download/remove) precisa dessa coluna, por isso não entra em findByColaborador
async function findById(id) {
  const result = await pool.query('SELECT * FROM documentos WHERE id = $1', [id]);
  return result.rows[0];
}

async function remove(id) {
  const result = await pool.query('DELETE FROM documentos WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
}

module.exports = { create, findByColaborador, findById, remove };
