// ./routes/auth.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireGuest } = require('../middleware/auth');

// Todas as rotas de auth são apenas para visitantes (não autenticados)

// GET /auth/login - Formulário de login
router.get('/login', requireGuest, authController.getLogin);

// POST /auth/login - Processar login
router.post('/login', requireGuest, authController.postLogin);

// GET /auth/register - Formulário de registo
router.get('/register', requireGuest, authController.getRegister);

// POST /auth/register - Processar registo
router.post('/register', requireGuest, authController.postRegister);

// GET /auth/logout - Fazer logout
router.get('/logout', authController.logout);

module.exports = router;