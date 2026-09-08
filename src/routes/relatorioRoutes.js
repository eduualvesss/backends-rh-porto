//"mapa" das rotas, sem lógica de verdade
const express = require('express');
const router = express.Router();
const { exportarColaboradores } = require('../controllers/relatorioController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorize');

// reaproveita colaboradores.view — é a mesma informação de colaboradores, só que exportada
router.get('/relatorios/colaboradores', authMiddleware, authorize('colaboradores.view'), exportarColaboradores);

module.exports = router;
