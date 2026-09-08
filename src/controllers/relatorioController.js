// lógica de negócio fica toda aqui
// cada função = uma ação que o front pode disparar
const Colaborador = require('../models/Colaborador');

// RFC 4180: campo entre aspas se tiver vírgula, aspas ou quebra de linha; aspas internas duplicadas
function csvField(valor) {
  if (valor === null || valor === undefined) return '';
  // colunas de data vêm do pg como Date — YYYY-MM-DD é mais legível num relatório
  // que o timestamp completo com hora/timezone
  const str = valor instanceof Date ? valor.toISOString().slice(0, 10) : String(valor);

  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function gerarCsv(colunas, linhas) {
  const cabecalho = colunas.join(',');
  const corpo = linhas.map((linha) => colunas.map((coluna) => csvField(linha[coluna])).join(','));
  return [cabecalho, ...corpo].join('\r\n');
}

async function exportarColaboradores(req, res) {
  const { campos, status, departamento } = req.query;

  const listaCampos = campos
    ? campos.split(',').map((c) => c.trim()).filter(Boolean)
    : [];

  const invalidos = listaCampos.filter((c) => !Colaborador.COLUNAS_EXPORTACAO_PERMITIDAS.includes(c));
  if (invalidos.length > 0) {
    return res.status(400).json({ error: `campo(s) inválido(s): ${invalidos.join(', ')}` });
  }

  // mesma lista que o model usa internamente quando campos vem vazio — precisa
  // bater aqui pra montar o cabeçalho do CSV mesmo quando o resultado dá 0 linhas
  const colunas = listaCampos.length ? listaCampos : Colaborador.COLUNAS_EXPORTACAO_PADRAO;

  try {
    const colaboradores = await Colaborador.findParaExportacao(listaCampos, { status, departamento });
    const csv = gerarCsv(colunas, colaboradores);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="colaboradores.csv"');
    return res.send(csv);
  } catch (err) {
    console.error('Erro ao gerar relatório de colaboradores:', err);
    return res.status(500).json({ error: 'erro ao gerar relatório de colaboradores' });
  }
}

module.exports = { exportarColaboradores };
