// roda ANTES do controller, em toda rota que precisa estar logado
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'token não fornecido' });
  }

  // header vem no formato "Bearer <token>", pego só a parte do token
  const token = authHeader.split(' ')[1];

  try {
    // verify confirma que o token foi assinado com o MESMO segredo do servidor
    // se alguém tentar forjar sem saber o segredo, cai no catch
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // deixa disponível pro controller usar
    next(); // libera a passagem
  } catch (err) {
    // cai aqui se token expirou ou foi adulterado
    return res.status(403).json({ error: 'token inválido ou expirado' });
  }
}

module.exports = authMiddleware;