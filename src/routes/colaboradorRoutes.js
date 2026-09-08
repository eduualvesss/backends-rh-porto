//"mapa" das rotas, sem lógica de verdade
const express = require('express');
const router = express.Router();
const {
  registrarColaborador,
  listarColaboradores,
  buscarColaborador,
  buscarColaboradorPorCpf,
  gerarFichaAdmissao,
  atualizarColaborador,
  removerColaborador,
} = require('../controllers/colaboradorController');
const { consultarPorColaborador } = require('../controllers/centroCustoController');
const { consultarFerias } = require('../controllers/feriasController');
const { registrarAtestado, listarAtestados } = require('../controllers/atestadoController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorize');
const documentoRoutes = require('./documentoRoutes');

// diferente do /cpf/:cpf abaixo, aqui a ordem não importa: "/:id/documentos" tem um
// segmento a mais que "/:id" e "/:id/ficha-admissao", então nunca colide com eles —
// fica no topo só por organização (rotas de sub-recurso agrupadas)
router.use('/:id/documentos', documentoRoutes);

// authMiddleware entra antes de tudo — sem token válido, ninguém mexe em colaborador
// authorize vem depois: confere a permissão específica de cada ação
router.post('/', authMiddleware, authorize('colaboradores.create'), registrarColaborador);
router.get('/', authMiddleware, authorize('colaboradores.view'), listarColaboradores);
// precisa vir antes de /:id, senão "cpf" seria capturado como :id
router.get('/cpf/:cpf', authMiddleware, authorize('colaboradores.view'), buscarColaboradorPorCpf);
router.get('/:id', authMiddleware, authorize('colaboradores.view'), buscarColaborador);
router.get('/:id/ficha-admissao', authMiddleware, authorize('colaboradores.view'), gerarFichaAdmissao);
router.get('/:id/centro-custo', authMiddleware, authorize('colaboradores.view'), consultarPorColaborador);
router.get('/:id/ferias', authMiddleware, authorize('colaboradores.view'), consultarFerias);
// escrita sobre o cadastro do colaborador — reaproveita colaboradores.edit, não cria permissão nova
router.post('/:id/atestados', authMiddleware, authorize('colaboradores.edit'), registrarAtestado);
router.get('/:id/atestados', authMiddleware, authorize('colaboradores.view'), listarAtestados);
router.put('/:id', authMiddleware, authorize('colaboradores.edit'), atualizarColaborador);
router.delete('/:id', authMiddleware, authorize('colaboradores.delete'), removerColaborador);

module.exports = router;