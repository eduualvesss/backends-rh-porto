//"mapa" das rotas, sem lógica de verdade
const express = require('express');
const router = express.Router();
const { listAuditLogs } = require('../controllers/auditController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorize');

// authMiddleware entra antes de listAuditLogs — se barrar, listAuditLogs nem roda
// authorize vem depois do authMiddleware: depende de req.user já preenchido
router.get('/audit-logs', authMiddleware, authorize('auditlog.view'), listAuditLogs);

module.exports = router;
