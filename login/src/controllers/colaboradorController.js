// lógica de negócio fica toda aqui
// cada função = uma ação que o front pode disparar
const Colaborador = require('../models/Colaborador');
const logAction = require('../utils/registrarLog');

// algoritmo padrão de validação de CPF (dígitos verificadores) — só formato/matemática,
// não confirma que a pessoa existe de verdade
function validarCPF(cpf) {
  if (!cpf || cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false; // todos dígitos iguais passam na conta mas são inválidos

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += Number(cpf[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== Number(cpf[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += Number(cpf[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== Number(cpf[10])) return false;

  return true;
}

// mapeia código de erro do Postgres pro status HTTP certo — sempre pelo código (err.code),
// nunca pelo texto da mensagem, que muda entre versões/idioma do Postgres
function tratarErroPostgres(err, res, acao) {
  if (err.code === '23505') return res.status(409).json({ error: 'cpf ou email já cadastrado' });
  if (err.code === '23514') return res.status(400).json({ error: 'valor inválido para um dos campos (ex.: status)' });
  if (err.code === '23502') return res.status(400).json({ error: 'campo obrigatório faltando' });

  console.error(`Erro ao ${acao} colaborador:`, err);
  return res.status(500).json({ error: `erro ao ${acao} colaborador` });
}

async function registrarColaborador(req, res) {
  const { nome, email, cpf, telefone, cargo, departamento, dataAdmissao } = req.body;

  // telefone entrou como NOT NULL no banco (migration 005) — checa aqui pra devolver
  // 400 claro em vez de deixar estourar 500 genérico por constraint do banco
  if (!nome || !email || !cpf || !telefone || !cargo || !departamento || !dataAdmissao) {
    return res.status(400).json({ error: 'nome, email, cpf, telefone, cargo, departamento e dataAdmissao são obrigatórios' });
  }

  // aceita CPF com ou sem pontuação no body, mas só guarda dígito no banco
  const cpfLimpo = String(cpf).replace(/\D/g, '');
  if (!validarCPF(cpfLimpo)) {
    return res.status(400).json({ error: 'cpf inválido' });
  }

  try {
    // checa duplicata ANTES de tentar inserir
    // (banco também bloqueia por UNIQUE, mas aqui dá erro mais claro pro front)
    const emailExistente = await Colaborador.findByEmail(email);
    if (emailExistente) {
      return res.status(409).json({ error: 'email já cadastrado' });
    }

    const cpfExistente = await Colaborador.findByCpf(cpfLimpo);
    if (cpfExistente) {
      return res.status(409).json({ error: 'cpf já cadastrado' });
    }

    // body inteiro vai pro model — createColaborador só aproveita os campos que
    // existem em CAMPOS_OPCIONAIS, o resto é ignorado (whitelist, não passa direto pro SQL)
    const colaborador = await Colaborador.createColaborador({
      ...req.body,
      cpf: cpfLimpo,
    });

    // fire and forget — helper já trata erro internamente, não precisa atrasar a resposta
    logAction({
      userId: req.user.id,
      action: 'CREATE',
      resource: 'colaborador',
      resourceId: colaborador.id,
      afterData: colaborador,
      ipAddress: req.ip,
    });

    return res.status(201).json(colaborador);
  } catch (err) {
    return tratarErroPostgres(err, res, 'cadastrar');
  }
}

async function listarColaboradores(req, res) {
  try {
    const { page = 1, limit = 20, departamento, status } = req.query;
    const colaboradores = await Colaborador.findAll({ page, limit, departamento, status });

    return res.json({
      page: Number(page),
      limit: Number(limit),
      count: colaboradores.length,
      colaboradores,
    });
  } catch (err) {
    console.error('Erro ao listar colaboradores:', err);
    return res.status(500).json({ error: 'erro ao listar colaboradores' });
  }
}

async function buscarColaborador(req, res) {
  try {
    const colaborador = await Colaborador.findById(req.params.id);
    if (!colaborador) return res.status(404).json({ error: 'colaborador não encontrado' });

    return res.json(colaborador);
  } catch (err) {
    console.error('Erro ao buscar colaborador:', err);
    return res.status(500).json({ error: 'erro ao buscar colaborador' });
  }
}

async function atualizarColaborador(req, res) {
  const { id } = req.params;
  const { nome, email, cpf, telefone, cargo, departamento, dataAdmissao, status } = req.body;

  try {
    const antes = await Colaborador.findById(id);
    if (!antes) return res.status(404).json({ error: 'colaborador não encontrado' });

    const fields = { nome, telefone, cargo, departamento, status };
    if (dataAdmissao !== undefined) fields.data_admissao = dataAdmissao; // body em camelCase, coluna em snake_case

    // resto do schema completo (migration 005) — mesma conversão camelCase -> snake_case
    // usada em createColaborador, via CAMPOS_OPCIONAIS
    for (const [campo, coluna] of Object.entries(Colaborador.CAMPOS_OPCIONAIS)) {
      if (req.body[campo] !== undefined) fields[coluna] = req.body[campo];
    }

    if (email !== undefined) {
      const emailExistente = await Colaborador.findByEmail(email);
      if (emailExistente && emailExistente.id !== Number(id)) {
        return res.status(409).json({ error: 'email já cadastrado' });
      }
      fields.email = email;
    }

    if (cpf !== undefined) {
      const cpfLimpo = String(cpf).replace(/\D/g, '');
      if (!validarCPF(cpfLimpo)) {
        return res.status(400).json({ error: 'cpf inválido' });
      }
      const cpfExistente = await Colaborador.findByCpf(cpfLimpo);
      if (cpfExistente && cpfExistente.id !== Number(id)) {
        return res.status(409).json({ error: 'cpf já cadastrado' });
      }
      fields.cpf = cpfLimpo;
    }

    const colaborador = await Colaborador.updateColaborador(id, fields);
    if (!colaborador) return res.status(400).json({ error: 'nenhum campo válido para atualizar' });

    // fire and forget — helper já trata erro internamente, não precisa atrasar a resposta
    logAction({
      userId: req.user.id,
      action: 'UPDATE',
      resource: 'colaborador',
      resourceId: colaborador.id,
      beforeData: antes,
      afterData: colaborador,
      ipAddress: req.ip,
    });

    return res.json(colaborador);
  } catch (err) {
    return tratarErroPostgres(err, res, 'atualizar');
  }
}

async function removerColaborador(req, res) {
  const { id } = req.params;

  try {
    const antes = await Colaborador.findById(id);
    if (!antes) return res.status(404).json({ error: 'colaborador não encontrado' });

    // deleteColaborador agora é exclusão lógica (UPDATE), não DELETE físico
    const colaborador = await Colaborador.deleteColaborador(id);

    // action vira UPDATE — é o que realmente aconteceu no banco (status = 'desligado'),
    // não um DELETE de verdade
    logAction({
      userId: req.user.id,
      action: 'UPDATE',
      resource: 'colaborador',
      resourceId: Number(id),
      beforeData: antes,
      afterData: colaborador,
      ipAddress: req.ip,
    });

    return res.status(204).send();
  } catch (err) {
    console.error('Erro ao remover colaborador:', err);
    return res.status(500).json({ error: 'erro ao remover colaborador' });
  }
}

module.exports = {
  registrarColaborador,
  listarColaboradores,
  buscarColaborador,
  atualizarColaborador,
  removerColaborador,
};