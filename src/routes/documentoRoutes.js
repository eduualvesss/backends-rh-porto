// "mapa" das rotas, sem lógica de verdade
// mergeParams: true — sem isso, :id (do colaborador) não chega aqui, já que este router
// é montado dentro de colaboradorRoutes.js via router.use('/:id/documentos', ...)
const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  uploadDocumento,
  listarDocumentos,
  downloadDocumento,
  removerDocumento,
} = require('../controllers/documentoController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorize');
const { upload, tratarErroUpload } = require('../middlewares/uploadDocumento');

router.post(
  '/',
  authMiddleware,
  authorize('documentos.upload'),
  upload.single('arquivo'),
  tratarErroUpload, // pega erro de tipo/tamanho vindo do multer antes do controller
  uploadDocumento
);
router.get('/', authMiddleware, authorize('documentos.view'), listarDocumentos);
router.get('/:documentoId/download', authMiddleware, authorize('documentos.view'), downloadDocumento);
// catálogo de permissões não tem "documentos.delete" — reaproveita documentos.upload
// (quem pode anexar documento também pode desfazer o próprio anexo)
router.delete('/:documentoId', authMiddleware, authorize('documentos.upload'), removerDocumento);

module.exports = router;
