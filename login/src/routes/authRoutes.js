//mapa" das rotas, sem lógica de verdade
const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/login', login);
// authMiddleware entra antes de getProfile — se barrar, getProfile nem roda
router.get('/profile', authMiddleware, getProfile);

module.exports = router;