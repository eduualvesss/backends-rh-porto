// lógica de negócio fica toda aqui
// cada função = uma ação que o front pode disparar
const Colaborador = require('../models/Colaborador');
const Atestado = require('../models/Atestado');
const logAction = require('../utils/registrarLog');

const LIMITE_DIAS_INSS = 15; // regra do INSS: >= 15 dias somados numa janela de 60 dias aciona alerta

// datas do body vêm como string 'YYYY-MM-DD' — parseia em UTC, senão a conta de dias
// desliza um dia dependendo do fuso local (mesmo padrão usado em feriasController)
function parseDateUTC(valor) {
  const [ano, mes, dia] = String(valor).split('-').map(Number);
  return new Date(Date.UTC(ano, mes - 1, dia));
}

async function registrarAtestado(req, res) {
  const { id } = req.params;

  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: 'id inválido' });
  }

  try {
    const colaborador = await Colaborador.findById(id);
    if (!colaborador) return res.status(404).json({ error: 'colaborador não encontrado' });

    const { data_inicio, data_fim, cid } = req.body;

    if (!data_inicio || !data_fim) {
      return res.status(400).json({ error: 'data_inicio e data_fim são obrigatórios' });
    }

    const inicioUTC = parseDateUTC(data_inicio);
    const fimUTC = parseDateUTC(data_fim);

    if (Number.isNaN(inicioUTC.getTime()) || Number.isNaN(fimUTC.getTime())) {
      return res.status(400).json({ error: 'data_inicio ou data_fim inválida' });
    }

    if (fimUTC < inicioUTC) {
      return res.status(400).json({ error: 'data_fim não pode ser anterior a data_inicio' });
    }

    // dias inclusive nos dois extremos: 01/09 a 03/09 = 3 dias.
    // "dias" nunca vem do body — sempre calculado aqui, não é confiável vindo do cliente
    const dias = Math.round((fimUTC - inicioUTC) / 86400000) + 1;

    const atestado = await Atestado.create(id, data_inicio, data_fim, dias, cid);

    // referência da janela é o data_fim do atestado que acabou de entrar —
    // é o evento que pode empurrar a soma acima do limite
    const somaJanela60Dias = await Atestado.somaJanela60Dias(id, atestado.data_fim);
    const limiteAtingido = somaJanela60Dias >= LIMITE_DIAS_INSS;

    // fire and forget — helper já trata erro internamente, não precisa atrasar a resposta
    logAction({
      userId: req.user.id,
      action: 'CREATE',
      resource: 'atestado',
      resourceId: atestado.id,
      afterData: atestado,
      ipAddress: req.ip,
    });

    return res.status(201).json({
      atestado,
      soma_janela_60_dias: somaJanela60Dias,
      limite_atingido: limiteAtingido,
    });
  } catch (err) {
    console.error('Erro ao registrar atestado:', err);
    return res.status(500).json({ error: 'erro ao registrar atestado' });
  }
}

async function listarAtestados(req, res) {
  const { id } = req.params;

  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: 'id inválido' });
  }

  try {
    const colaborador = await Colaborador.findById(id);
    if (!colaborador) return res.status(404).json({ error: 'colaborador não encontrado' });

    const atestados = await Atestado.findByColaborador(id);
    return res.json({ colaborador_id: Number(id), count: atestados.length, atestados });
  } catch (err) {
    console.error('Erro ao listar atestados:', err);
    return res.status(500).json({ error: 'erro ao listar atestados' });
  }
}

module.exports = { registrarAtestado, listarAtestados };
