//"mapa" das rotas, sem lógica de verdade
const express = require('express');
const router = express.Router();
const { getAniversariantes, getIndicadores } = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorize');

// reaproveita colaboradores.view — é a mesma informação de colaboradores, só que agregada
router.get('/dashboard/aniversariantes', authMiddleware, authorize('colaboradores.view'), getAniversariantes);
router.get('/dashboard/indicadores', authMiddleware, authorize('colaboradores.view'), getIndicadores);

module.exports = router;
