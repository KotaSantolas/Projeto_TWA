// ./middleware/auth.js

// Middleware para verificar se o utilizador está autenticado (cliente OU barbeiro)
const requireAuth = (req, res, next) => {
    if (!req.session || !req.session.userId || !req.session.userType) {
        return res.redirect('/auth/login');
    }
    next();
};

// Middleware para permitir apenas CLIENTES
const requireCliente = (req, res, next) => {
    if (!req.session || !req.session.userId || req.session.userType !== 'cliente') {
        return res.status(403).render('error', { 
            message: 'Acesso negado. Apenas clientes podem aceder a esta página.',
            error: { status: 403 }
        });
    }
    next();
};

// Middleware para permitir apenas BARBEIROS
const requireBarbeiro = (req, res, next) => {
    if (!req.session || !req.session.userId || req.session.userType !== 'barbeiro') {
        return res.status(403).render('error', { 
            message: 'Acesso negado. Apenas barbeiros podem aceder a esta página.',
            error: { status: 403 }
        });
    }
    next();
};

// Middleware para permitir AMBOS (clientes E barbeiros)
const requireClienteOrBarbeiro = (req, res, next) => {
    if (!req.session || !req.session.userId || !req.session.userType) {
        return res.redirect('/auth/login');
    }
    
    if (req.session.userType !== 'cliente' && req.session.userType !== 'barbeiro') {
        return res.status(403).render('error', { 
            message: 'Acesso negado.',
            error: { status: 403 }
        });
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
    if (req.session && req.session.userId && req.session.userType) {
        try {
            let user;
            
            if (req.session.userType === 'cliente') {
                const Cliente = require('../models/Cliente');
                user = await Cliente.findById(req.session.userId);
            } else if (req.session.userType === 'barbeiro') {
                const Barbeiro = require('../models/Barbeiro');
                user = await Barbeiro.findById(req.session.userId);
            }
            
            res.locals.currentUser = user;
            res.locals.userType = req.session.userType;
        } catch (error) {
            console.error('Erro ao carregar utilizador:', error);
        }
    }
    next();
};

module.exports = { 
    requireAuth, 
    requireCliente, 
    requireBarbeiro, 
    requireClienteOrBarbeiro,
    requireGuest, 
    loadUser 
};