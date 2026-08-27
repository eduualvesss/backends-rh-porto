//"mapa" das rotas, sem lógica de verdade
const express = require('express');
const router = express.Router();
const { listAuditLogs } = require('../controllers/auditController');
const authMiddleware = require('../middlewares/authMiddleware');

// authMiddleware entra antes de listAuditLogs — se barrar, listAuditLogs nem roda
router.get('/audit-logs', authMiddleware, listAuditLogs);

module.exports = router;
