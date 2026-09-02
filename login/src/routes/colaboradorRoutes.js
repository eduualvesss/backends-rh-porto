//"mapa" das rotas, sem lógica de verdade
const express = require('express');
const router = express.Router();
const {
  registrarColaborador,
  listarColaboradores,
  buscarColaborador,
  atualizarColaborador,
  removerColaborador,
} = require('../controllers/colaboradorController');
const authMiddleware = require('../middlewares/authMiddleware');

// authMiddleware entra antes de tudo — sem token válido, ninguém mexe em colaborador
router.post('/', authMiddleware, registrarColaborador);
router.get('/', authMiddleware, listarColaboradores);
router.get('/:id', authMiddleware, buscarColaborador);
router.put('/:id', authMiddleware, atualizarColaborador);
router.delete('/:id', authMiddleware, removerColaborador);

module.exports = router;
