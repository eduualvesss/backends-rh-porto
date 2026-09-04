// aqui fica só a parte que conversa com o banco
// controller não sabe SQL, só chama essas funções — separação de responsabilidade
const pool = require('../config/db');

async function grant({ userId, permissionKey, grantedBy }) {
  const permission = await pool.query(
    'SELECT id FROM permissions WHERE key = $1',
    [permissionKey]
  );

  // key errada é erro de programação/chamada, não caso de negócio —
  // falha alto e claro em vez de inserir permission_id inválido
  if (permission.rows.length === 0) {
    throw new Error(`Permissão inválida: ${permissionKey}`);
  }

  const permissionId = permission.rows[0].id;

  // ON CONFLICT DO NOTHING: conceder uma permissão que o usuário já tem
  // não é erro, é no-op — evita que o caller precise checar antes
  const result = await pool.query(
    `INSERT INTO user_permissions (user_id, permission_id, granted_by)
     VALUES ($1, $2, $3)
     ON CONFLICT DO NOTHING
     RETURNING *`,
    [userId, permissionId, grantedBy]
  );
  return result.rows[0] || null;
}

async function revoke({ userId, permissionKey }) {
  const result = await pool.query(
    `DELETE FROM user_permissions
     USING permissions
     WHERE user_permissions.permission_id = permissions.id
       AND user_permissions.user_id = $1
       AND permissions.key = $2
     RETURNING user_permissions.*`,
    [userId, permissionKey]
  );
  return result.rows[0] || null;
}

async function listForUser(userId) {
  const result = await pool.query(
    `SELECT p.key, p.description, up.granted_at, up.granted_by
     FROM user_permissions up
     JOIN permissions p ON p.id = up.permission_id
     WHERE up.user_id = $1
     ORDER BY p.key`,
    [userId]
  );
  return result.rows;
}

async function findRoleById(userId) {
  const result = await pool.query(
    'SELECT role FROM users WHERE id = $1',
    [userId]
  );
  return result.rows[0] ? result.rows[0].role : null;
}

module.exports = { grant, revoke, listForUser, findRoleById };
