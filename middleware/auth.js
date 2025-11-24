// ./middleware/auth.js

// Middleware simples de autenticação usando sessões
// Verifica se o utilizador está autenticado

const requireAuth = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        return res.redirect('/auth/login');
    }
    next();
};

// Middleware para já estar autenticado (redireciona se já tiver login)
const requireGuest = (req, res, next) => {
    if (req.session && req.session.userId) {
        return res.redirect('/');
    }
    next();
};

// Middleware para disponibilizar dados do utilizador nas views
const loadUser = async (req, res, next) => {
    if (req.session && req.session.userId) {
        try {
            const Cliente = require('../models/Cliente');
            const user = await Cliente.findById(req.session.userId);
            res.locals.currentUser = user;
        } catch (error) {
            console.error('Erro ao carregar utilizador:', error);
        }
    }
    next();
};

module.exports = { requireAuth, requireGuest, loadUser };