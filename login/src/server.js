require('dotenv').config(); // carrega o .env antes de qualquer coisa usar process.env
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const auditRoutes = require('./routes/auditRoutes');

const app = express();

app.use(cors()); // libera front de outra origem/porta chamar essa API
app.use(express.json()); // transforma corpo da requisição em req.body usável

app.use('/auth', authRoutes); // todas rotas de auth ficam sob /auth/*
app.use('/', auditRoutes); // GET /audit-logs

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));