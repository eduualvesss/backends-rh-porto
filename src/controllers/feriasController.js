// lógica de negócio fica toda aqui
// cada função = uma ação que o front pode disparar
const Ferias = require('../models/Ferias');
const Colaborador = require('../models/Colaborador');

// soma meses em UTC, ignorando hora — datas do banco (tipo DATE) vêm como meia-noite UTC,
// então toda conta de ciclo usa UTC pra não deslizar um dia por causa do fuso local
function addMonthsUTC(date, months) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  d.setUTCMonth(d.getUTCMonth() + months);
  return d;
}

function formatDateISO(date) {
  return date.toISOString().slice(0, 10);
}

// aceita tanto Date (vindo do pg) quanto string — sempre compara só a parte da data
function toISODate(valor) {
  return new Date(valor).toISOString().slice(0, 10);
}

// ciclo aquisitivo = 12 meses corridos a partir da admissão (ciclo 0, 1, 2...).
// só fica disponível pra tirar férias depois de completado (hoje >= fim do ciclo).
// "próximo período disponível" é o ciclo completo mais antigo que ainda não foi gozado;
// se todos os ciclos já completos já foram usados, devolve quando o próximo ciclo (em
// andamento) vai completar.
function calcularProximoPeriodo(dataAdmissao, historico) {
  const admissao = new Date(dataAdmissao);
  const hoje = new Date();
  const hojeUTC = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), hoje.getUTCDate()));

  for (let ciclo = 0; ; ciclo++) {
    const inicio = addMonthsUTC(admissao, ciclo * 12);
    const fim = addMonthsUTC(admissao, (ciclo + 1) * 12);

    if (hojeUTC < fim) {
      // esse ciclo ainda está em andamento — nenhum ciclo anterior sobrou disponível,
      // senão já teríamos retornado no loop antes de chegar aqui
      return {
        disponivel: false,
        periodo_aquisitivo_inicio: formatDateISO(inicio),
        periodo_aquisitivo_fim: formatDateISO(fim),
        disponivel_a_partir: formatDateISO(fim),
      };
    }

    const jaGozado = historico.some(
      (f) =>
        f.data_inicio_gozo !== null &&
        toISODate(f.periodo_aquisitivo_inicio) === formatDateISO(inicio) &&
        toISODate(f.periodo_aquisitivo_fim) === formatDateISO(fim)
    );

    if (!jaGozado) {
      return {
        disponivel: true,
        periodo_aquisitivo_inicio: formatDateISO(inicio),
        periodo_aquisitivo_fim: formatDateISO(fim),
      };
    }
  }
}

async function consultarFerias(req, res) {
  const { id } = req.params;
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: 'id inválido' });
  }

  try {
    const colaborador = await Colaborador.findById(id);
    if (!colaborador) return res.status(404).json({ error: 'colaborador não encontrado' });

    const historico = await Ferias.findByColaborador(id);
    const proximoPeriodo = calcularProximoPeriodo(colaborador.data_admissao, historico);

    return res.json({
      colaborador_id: Number(id),
      data_admissao: colaborador.data_admissao,
      historico,
      proximo_periodo: proximoPeriodo,
    });
  } catch (err) {
    console.error('Erro ao consultar histórico de férias:', err);
    return res.status(500).json({ error: 'erro ao consultar histórico de férias' });
  }
}

module.exports = { consultarFerias };
