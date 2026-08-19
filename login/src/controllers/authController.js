// lógica de negócio fica toda aqui
// cada função = uma ação que o front pode disparar
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { findByEmail, findById, createUser } = require('../models/User');

async function register(req, res) {
  const { email, password } = req.body;

  // validação básica antes de gastar query no banco
  if (!email || !password) {
    return res.status(400).json({ error: 'email e senha obrigatórios' });
  }

  // checa duplicata ANTES de tentar inserir
  // (banco também bloqueia por UNIQUE, mas aqui dá erro mais claro pro front)
  const existing = await findByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'email já cadastrado' });
  }

  // bcrypt.hash é processo de mão única — não existe "desfazer" isso depois
  // 10 = custo do hash, quanto maior mais lento e mais seguro
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await createUser(email, hashedPassword);

  return res.status(201).json(user); // nunca devolve o hash da senha
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email e senha obrigatórios' });
  }

  const user = await findByEmail(email);
  if (!user) {
    // mensagem genérica de propósito — não dá pra saber se email existe ou não
    return res.status(401).json({ error: 'credenciais inválidas' });
  }

  // bcrypt.compare faz o hash da senha recebida e compara com o hash salvo
  // nunca reverte o hash original, só recalcula e compara os dois
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ error: 'credenciais inválidas' });
  }

  // token = prova assinada de que o login aconteceu
  // servidor confia no token depois só verificando a assinatura, sem consultar banco de novo
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES }
  );

  return res.json({ token });
}

async function getProfile(req, res) {
  // req.user já veio validado pelo middleware, chega aqui confiável
  const user = await findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'usuário não encontrado' });

  return res.json(user);
}

module.exports = { register, login, getProfile };