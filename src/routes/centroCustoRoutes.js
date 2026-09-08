//"mapa" das rotas, sem lógica de verdade
const express = require('express');
const router = express.Router();
const { listarCentrosCusto, consultarPorCentroCusto } = require('../controllers/centroCustoController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorize');

// reaproveita colaboradores.view — mesma informação de colaboradores, só que sob outro recorte
router.get('/centros-custo', authMiddleware, authorize('colaboradores.view'), listarCentrosCusto);
router.get('/centros-custo/:centroCustoId/historico', authMiddleware, authorize('colaboradores.view'), consultarPorCentroCusto);

module.exports = router;
