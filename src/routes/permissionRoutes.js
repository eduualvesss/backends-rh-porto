//"mapa" das rotas, sem lógica de verdade
const express = require('express');
const router = express.Router();
const {
  listUserPermissions,
  grantPermission,
  revokePermission,
} = require('../controllers/permissionController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorize');

// authMiddleware entra antes de authorize — authorize depende de req.user já preenchido
// usuarios.manage: só quem administra usuários mexe nas permissões de outros
router.get('/usuarios/:id/permissoes', authMiddleware, authorize('usuarios.manage'), listUserPermissions);
router.post('/usuarios/:id/permissoes', authMiddleware, authorize('usuarios.manage'), grantPermission);
router.delete('/usuarios/:id/permissoes/:key', authMiddleware, authorize('usuarios.manage'), revokePermission);

module.exports = router;
