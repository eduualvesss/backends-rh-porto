// roda DEPOIS do authMiddleware, em rotas que exigem uma permissão específica
const Permission = require('../models/Permission');

function authorize(permissionKey) {
  return async function (req, res, next) {
    try {
      const role = await Permission.findRoleById(req.user.id);

      // admin sempre passa direto, sem checar user_permissions —
      // evita o admin se travar fora do sistema por não ter a própria permissão
      if (role === 'admin') {
        return next();
      }

      const permissions = await Permission.listForUser(req.user.id);
      const hasPermission = permissions.some((p) => p.key === permissionKey);

      if (hasPermission) {
        return next();
      }

      // mensagem genérica de propósito — não revela qual permissão faltou
      return res.status(403).json({ error: 'acesso negado' });
    } catch (err) {
      console.error(err);
      // erro na verificação nunca libera acesso, só nega
      return res.status(500).json({ error: 'erro ao verificar permissao' });
    }
  };
}

module.exports = authorize;
