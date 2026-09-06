// DECISÃO (item 1 do US07): disco local via multer, não Supabase Storage.
// Motivo: .env.example não tem nenhuma credencial de storage externo configurada ainda
// (só DB_URL, JWT_SECRET, JWT_EXPIRES, PORT) — subir isso agora seria adicionar uma
// dependência de serviço externo no meio de uma US que não pede isso. Fica registrado
// aqui pra quando alguém decidir migrar pra Supabase/S3: só trocar este arquivo,
// controller e model não sabem (nem deveriam saber) onde o arquivo foi parar.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

const PASTA_UPLOADS = path.join(__dirname, '..', '..', 'uploads', 'documentos');
fs.mkdirSync(PASTA_UPLOADS, { recursive: true });

// mimetype -> extensão aceita, dobra como allowlist (nada fora daqui passa)
const TIPOS_ACEITOS = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/png': '.png',
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, PASTA_UPLOADS),
  filename: (req, file, cb) => {
    // nome no disco NUNCA é o nome original — evita path traversal e colisão entre
    // colaboradores diferentes subindo arquivo com o mesmo nome ("rg.pdf" etc).
    // nome original vai só pro banco (nome_arquivo), usado na hora do download.
    const sufixo = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    cb(null, `${req.params.id}-${sufixo}${TIPOS_ACEITOS[file.mimetype] || ''}`);
  },
});

function fileFilter(req, file, cb) {
  if (!TIPOS_ACEITOS[file.mimetype]) {
    // erro customizado, não MulterError — distinguido no handler pra dar 400 certo
    return cb(new Error('tipo de arquivo não aceito (só PDF, JPG ou PNG)'));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB — ficha/CTPS/CNH escaneado não passa disso
});

// multer chama next(err) quando fileFilter ou limits rejeitam — sem isso o erro
// vira stack trace HTML padrão do Express em vez de JSON consistente com o resto da API
function tratarErroUpload(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'arquivo maior que 5MB' });
    }
    return res.status(400).json({ error: 'erro no upload do arquivo' });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
}

module.exports = { upload, tratarErroUpload, PASTA_UPLOADS };
