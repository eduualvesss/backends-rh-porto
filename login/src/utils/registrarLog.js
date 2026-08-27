// helper reutilizável por qualquer controller pra gravar log de auditoria
const { createLog } = require('../models/AuditLog');

async function logAction({ userId, action, resource, resourceId, beforeData, afterData, ipAddress }) {
  // falha ao gravar log NUNCA pode derrubar a ação principal do controller
  // por isso o erro é só logado no console, nunca propagado pra quem chamou
  try {
    await createLog({ userId, action, resource, resourceId, beforeData, afterData, ipAddress });
  } catch (err) {
    console.error('Falha ao registrar log de auditoria:', err);
  }
}

module.exports = logAction;
