// lógica de negócio fica toda aqui
// cada função = uma ação que o front pode disparar
const Colaborador = require('../models/Colaborador');

async function getAniversariantes(req, res) {
  const { mes } = req.query;

  let mesFiltro;
  if (mes === undefined) {
    mesFiltro = new Date().getMonth() + 1; // getMonth() é 0-11, mês de calendário é 1-12
  } else {
    mesFiltro = Number(mes);
    if (!Number.isInteger(mesFiltro) || mesFiltro < 1 || mesFiltro > 12) {
      return res.status(400).json({ error: 'mes deve ser um número entre 1 e 12' });
    }
  }

  try {
    const [aniversariantesNascimento, aniversariantesEmpresa] = await Promise.all([
      Colaborador.findAniversariantesNascimento(mesFiltro),
      Colaborador.findAniversariantesEmpresa(mesFiltro),
    ]);

    return res.json({
      mes: mesFiltro,
      aniversariantes_nascimento: aniversariantesNascimento,
      aniversariantes_empresa: aniversariantesEmpresa,
    });
  } catch (err) {
    console.error('Erro ao buscar aniversariantes:', err);
    return res.status(500).json({ error: 'erro ao buscar aniversariantes' });
  }
}

// arredonda pra 1 casa decimal — total 0 (sem colaboradores) não pode gerar divisão por zero
function calcularPercentual(quantidade, total) {
  if (!total) return 0;
  return Math.round((quantidade / total) * 1000) / 10;
}

// cada grupo (genero, escolaridade...) já vem contado do model — o total do grupo
// é a soma das próprias quantidades, não precisa de outra query
function comPercentual(linhas) {
  const total = linhas.reduce((soma, linha) => soma + linha.quantidade, 0);
  return linhas.map((linha) => ({
    categoria: linha.categoria,
    quantidade: linha.quantidade,
    percentual: calcularPercentual(linha.quantidade, total),
  }));
}

async function getIndicadores(req, res) {
  try {
    const [porGenero, porEscolaridade, porEstadoCivil, porFaixaEtaria, desligamentos] = await Promise.all([
      Colaborador.getPorGenero(),
      Colaborador.getPorEscolaridade(),
      Colaborador.getPorEstadoCivil(),
      Colaborador.getPorFaixaEtaria(),
      Colaborador.getIndicadorDesligamentos(),
    ]);

    return res.json({
      por_genero: comPercentual(porGenero),
      por_escolaridade: comPercentual(porEscolaridade),
      por_estado_civil: comPercentual(porEstadoCivil),
      por_faixa_etaria: comPercentual(porFaixaEtaria),
      desligamentos: {
        total: desligamentos.total,
        desligados: desligamentos.desligados,
        percentual: calcularPercentual(desligamentos.desligados, desligamentos.total),
      },
    });
  } catch (err) {
    console.error('Erro ao buscar indicadores:', err);
    return res.status(500).json({ error: 'erro ao buscar indicadores' });
  }
}

module.exports = { getAniversariantes, getIndicadores };
