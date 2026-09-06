// lógica de negócio fica toda aqui
// cada função = uma ação que o front pode disparar
const fs = require('fs');
const Colaborador = require('../models/Colaborador');
const Documento = require('../models/Documento');
const logAction = require('../utils/registrarLog');

const TIPOS_VALIDOS = ['ctps', 'cnh', 'dependente', 'outro']; // mesmo CHECK da migration 006

// mesmo padrão de validação de :id usado em colaboradorController
function idInvalido(valor) {
  return !/^\d+$/.test(valor);
}

async function uploadDocumento(req, res) {
  const { id } = req.params; // id do colaborador (rota aninhada em /colaboradores/:id/documentos)

  if (idInvalido(id)) {
    return res.status(400).json({ error: 'id do colaborador inválido' });
  }

  // multer já rodou nesse ponto (é middleware anterior na rota) — se chegou aqui
  // sem req.file, o campo "arquivo" não veio no multipart
  if (!req.file) {
    return res.status(400).json({ error: 'arquivo obrigatório (campo "arquivo")' });
  }

  const { tipo, dependente_nome } = req.body;

  if (!TIPOS_VALIDOS.includes(tipo)) {
    fs.unlink(req.file.path, () => {}); // multer já salvou no disco — desfaz, senão vira arquivo órfão
    return res.status(400).json({ error: `tipo deve ser um de: ${TIPOS_VALIDOS.join(', ')}` });
  }

  if (tipo === 'dependente' && !dependente_nome) {
    fs.unlink(req.file.path, () => {});
    return res.status(400).json({ error: 'dependente_nome é obrigatório quando tipo = dependente' });
  }

  try {
    const colaborador = await Colaborador.findById(id);
    if (!colaborador) {
      fs.unlink(req.file.path, () => {});
      return res.status(404).json({ error: 'colaborador não encontrado' });
    }

    const documento = await Documento.create({
      colaboradorId: id,
      tipo,
      dependenteNome: tipo === 'dependente' ? dependente_nome : null,
      nomeArquivo: req.file.originalname,
      caminhoArmazenamento: req.file.path,
      tipoMime: req.file.mimetype,
      tamanhoBytes: req.file.size,
      uploadedBy: req.user.id,
    });

    logAction({
      userId: req.user.id,
      action: 'CREATE',
      resource: 'documento',
      resourceId: documento.id,
      afterData: { colaborador_id: documento.colaborador_id, tipo: documento.tipo, nome_arquivo: documento.nome_arquivo },
      ipAddress: req.ip,
    });

    // caminho_armazenamento nunca sai na resposta — é detalhe interno do servidor
    const { caminho_armazenamento, ...documentoSemCaminho } = documento;
    return res.status(201).json(documentoSemCaminho);
  } catch (err) {
    fs.unlink(req.file.path, () => {}); // insert falhou, não deixa arquivo pra trás
    console.error('Erro ao salvar documento:', err);
    return res.status(500).json({ error: 'erro ao salvar documento' });
  }
}

async function listarDocumentos(req, res) {
  const { id } = req.params;

  if (idInvalido(id)) {
    return res.status(400).json({ error: 'id do colaborador inválido' });
  }

  try {
    const colaborador = await Colaborador.findById(id);
    if (!colaborador) return res.status(404).json({ error: 'colaborador não encontrado' });

    const documentos = await Documento.findByColaborador(id);
    return res.json({ colaborador_id: Number(id), count: documentos.length, documentos });
  } catch (err) {
    console.error('Erro ao listar documentos:', err);
    return res.status(500).json({ error: 'erro ao listar documentos' });
  }
}

async function downloadDocumento(req, res) {
  const { id, documentoId } = req.params;

  if (idInvalido(id) || idInvalido(documentoId)) {
    return res.status(400).json({ error: 'id inválido' });
  }

  try {
    const documento = await Documento.findById(documentoId);
    // confere colaborador_id também, não só o id do documento — sem isso, quem tem
    // permissão de ver documentos poderia baixar documento de outro colaborador só
    // sabendo o id numérico (IDOR)
    if (!documento || documento.colaborador_id !== Number(id)) {
      return res.status(404).json({ error: 'documento não encontrado' });
    }

    if (!fs.existsSync(documento.caminho_armazenamento)) {
      console.error(`Arquivo ausente no disco: documento ${documento.id}, caminho ${documento.caminho_armazenamento}`);
      return res.status(404).json({ error: 'arquivo não encontrado no servidor' });
    }

    return res.download(documento.caminho_armazenamento, documento.nome_arquivo);
  } catch (err) {
    console.error('Erro ao baixar documento:', err);
    return res.status(500).json({ error: 'erro ao baixar documento' });
  }
}

async function removerDocumento(req, res) {
  const { id, documentoId } = req.params;

  if (idInvalido(id) || idInvalido(documentoId)) {
    return res.status(400).json({ error: 'id inválido' });
  }

  try {
    const documento = await Documento.findById(documentoId);
    if (!documento || documento.colaborador_id !== Number(id)) {
      return res.status(404).json({ error: 'documento não encontrado' });
    }

    await Documento.remove(documentoId);

    // arquivo físico some depois do banco confirmar — se der erro no unlink,
    // fica só um arquivo órfão no disco (recuperável), nunca um registro órfão no banco
    fs.unlink(documento.caminho_armazenamento, (err) => {
      if (err) console.error(`Falha ao apagar arquivo do disco (documento ${documentoId}):`, err.message);
    });

    logAction({
      userId: req.user.id,
      action: 'DELETE',
      resource: 'documento',
      resourceId: Number(documentoId),
      beforeData: { colaborador_id: documento.colaborador_id, tipo: documento.tipo, nome_arquivo: documento.nome_arquivo },
      ipAddress: req.ip,
    });

    return res.status(204).send();
  } catch (err) {
    console.error('Erro ao remover documento:', err);
    return res.status(500).json({ error: 'erro ao remover documento' });
  }
}

module.exports = { uploadDocumento, listarDocumentos, downloadDocumento, removerDocumento };
