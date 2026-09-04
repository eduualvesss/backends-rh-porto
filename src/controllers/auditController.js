// lógica de negócio fica toda aqui
// cada função = uma ação que o front pode disparar
const AuditLog = require('../models/AuditLog');

async function listAuditLogs(req, res) {
  try {
    const { page = 1, limit = 20, userId, action } = req.query;

    const logs = await AuditLog.findAll({ page, limit, userId, action });

    return res.json({
      page: Number(page),
      limit: Number(limit),
      count: logs.length,
      logs,
    });
  } catch (err) {
    console.error('Erro ao buscar logs de auditoria:', err);
    return res.status(500).json({ error: 'Erro ao buscar logs de auditoria' });
  }
}

module.exports = { listAuditLogs };
