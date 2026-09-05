//"mapa" das rotas, sem lógica de verdade
const express = require('express');
const router = express.Router();
const {
  registrarColaborador,
  listarColaboradores,
  buscarColaborador,
  buscarColaboradorPorCpf,
  atualizarColaborador,
  removerColaborador,
} = require('../controllers/colaboradorController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorize');

// authMiddleware entra antes de tudo — sem token válido, ninguém mexe em colaborador
// authorize vem depois: confere a permissão específica de cada ação
router.post('/', authMiddleware, authorize('colaboradores.create'), registrarColaborador);
router.get('/', authMiddleware, authorize('colaboradores.view'), listarColaboradores);
// precisa vir antes de /:id, senão "cpf" seria capturado como :id
router.get('/cpf/:cpf', authMiddleware, authorize('colaboradores.view'), buscarColaboradorPorCpf);
router.get('/:id', authMiddleware, authorize('colaboradores.view'), buscarColaborador);
router.put('/:id', authMiddleware, authorize('colaboradores.edit'), atualizarColaborador);
router.delete('/:id', authMiddleware, authorize('colaboradores.delete'), removerColaborador);

module.exports = router;