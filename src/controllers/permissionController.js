// lógica de negócio fica toda aqui
// cada função = uma ação que o front pode disparar
const Permission = require('../models/Permission');
const logAction = require('../utils/registrarLog');

async function listUserPermissions(req, res) {
  try {
    const userId = req.params.id;

    if (!/^\d+$/.test(userId)) {
      return res.status(400).json({ error: 'id de usuário inválido' });
    }

    const permissions = await Permission.listForUser(userId);

    return res.json({ userId, permissions });
  } catch (err) {
    console.error('Erro ao listar permissões do usuário:', err);
    return res.status(500).json({ error: 'Erro ao listar permissões do usuário' });
  }
}

async function grantPermission(req, res) {
  try {
    const userId = req.params.id;
    const { key } = req.body;

    if (!/^\d+$/.test(userId)) {
      return res.status(400).json({ error: 'id de usuário inválido' });
    }

    if (!key) {
      return res.status(400).json({ error: 'key é obrigatória' });
    }

    const granted = await Permission.grant({
      userId,
      permissionKey: key,
      grantedBy: req.user.id,
    });

    // grant retorna null no caso de ON CONFLICT — já tinha a permissão,
    // não é erro, só não há linha nova pra devolver
    if (!granted) {
      return res.status(200).json({ message: 'usuário já possui essa permissão' });
    }

    // fire and forget — helper já trata erro internamente, não precisa atrasar a resposta
    logAction({
      userId: req.user.id,
      action: 'GRANT_PERMISSION',
      resource: 'user_permission',
      resourceId: Number(req.params.id),
      afterData: { permissionKey: key, targetUserId: Number(req.params.id) },
      ipAddress: req.ip,
    });

    return res.status(201).json(granted);
  } catch (err) {
    // Permission.grant lança Error com essa mensagem quando a key não existe
    // no catálogo — isso é erro do cliente (400), não falha do servidor
    if (err.message.startsWith('Permissão inválida')) {
      return res.status(400).json({ error: err.message });
    }

    // 23503 = violação de foreign key no Postgres — aqui significa que
    // userId não existe em users. Checar pelo código, não pelo texto,
    // porque o texto varia com locale/versão do banco
    if (err.code === '23503') {
      return res.status(404).json({ error: 'usuário não encontrado' });
    }

    console.error('Erro ao conceder permissão:', err);
    return res.status(500).json({ error: 'Erro ao conceder permissão' });
  }
}

async function revokePermission(req, res) {
  try {
    const userId = req.params.id;
    const { key } = req.params;

    if (!/^\d+$/.test(userId)) {
      return res.status(400).json({ error: 'id de usuário inválido' });
    }

    const revoked = await Permission.revoke({ userId, permissionKey: key });

    if (!revoked) {
      return res.status(404).json({ error: 'usuário não possui essa permissão' });
    }

    // fire and forget — helper já trata erro internamente, não precisa atrasar a resposta
    logAction({
      userId: req.user.id,
      action: 'REVOKE_PERMISSION',
      resource: 'user_permission',
      resourceId: Number(req.params.id),
      // beforeData porque descreve o que existia antes de ser removido
      beforeData: { permissionKey: key, targetUserId: Number(req.params.id) },
      ipAddress: req.ip,
    });

    return res.status(200).json(revoked);
  } catch (err) {
    console.error('Erro ao revogar permissão:', err);
    return res.status(500).json({ error: 'Erro ao revogar permissão' });
  }
}

module.exports = { listUserPermissions, grantPermission, revokePermission };
