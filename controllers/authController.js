const Cliente = require('../models/Cliente');
const Barbeiro = require('../models/Barbeiro');
const bcrypt = require('bcrypt');

const authController = {
    // GET - Formulário de login
    getLogin: (req, res) => {
        res.render('auth/login', { 
            title: 'Login',
            error: null 
        });
    },

    // POST - Processar login (cliente OU barbeiro)
    postLogin: async (req, res) => {
        const { email, password, userType } = req.body;

        // Validação do tipo de utilizador
        if (!userType || (userType !== 'cliente' && userType !== 'barbeiro')) {
            return res.render('auth/login', { 
                title: 'Login',
                error: 'Selecione o tipo de utilizador',
                email 
            });
        }

        if (!email || !password) {
            return res.render('auth/login', { 
                title: 'Login',
                error: 'Preencha todos os campos',
                email 
            });
        }

        try {
            let user;
            
            // Buscar na tabela correta conforme o tipo
            if (userType === 'cliente') {
                user = await Cliente.findByEmail(email);
            } else {
                user = await Barbeiro.findByEmail(email);
            }
            
            if (!user) {
                return res.render('auth/login', { 
                    title: 'Login',
                    error: 'Email ou password incorretos',
                    email 
                });
            }

            const validPassword = await bcrypt.compare(password, user.password_hash);
            
            if (!validPassword) {
                return res.render('auth/login', { 
                    title: 'Login',
                    error: 'Email ou password incorretos',
                    email 
                });
            }

            // Login bem-sucedido - guardar tipo na sessão
            req.session.userId = user.id;
            req.session.userName = user.nome;
            req.session.userType = userType;
            
            res.redirect('/');

        } catch (error) {
            console.error('Erro no login:', error);
            res.render('auth/login', { 
                title: 'Login',
                error: 'Erro ao fazer login',
                email 
            });
        }
    },

    // GET - Formulário de registo (apenas clientes)
    getRegister: (req, res) => {
        res.render('auth/register', { 
            title: 'Registar',
            error: null 
        });
    },

    // POST - Processar registo (apenas clientes)
    postRegister: async (req, res) => {
        const { primeiro_nome, ultimo_nome, email, password, password_confirm, telefone } = req.body;

        // Validações
        if (!primeiro_nome || !ultimo_nome || !email || !password || !password_confirm || !telefone) {
            return res.render('auth/register', { 
                title: 'Registar',
                error: 'Preencha todos os campos obrigatórios',
                cliente: req.body 
            });
        }

        if (password !== password_confirm) {
            return res.render('auth/register', { 
                title: 'Registar',
                error: 'As passwords não coincidem',
                cliente: req.body 
            });
        }

        if (password.length < 6) {
            return res.render('auth/register', { 
                title: 'Registar',
                error: 'A password deve ter pelo menos 6 caracteres',
                cliente: req.body 
            });
        }

        try {
            const id = await Cliente.create(primeiro_nome, ultimo_nome, email, password, telefone);
            
            // Login automático após registo (sempre como cliente)
            req.session.userId = id;
            req.session.userName = `${primeiro_nome} ${ultimo_nome}`;
            req.session.userType = 'cliente';
            
            res.redirect('/');

        } catch (error) {
            console.error('Erro no registo:', error);
            
            const errorMessage = error.code === 'ER_DUP_ENTRY' 
                ? 'Este email já está registado' 
                : 'Erro ao criar conta';
            
            res.render('auth/register', { 
                title: 'Registar',
                error: errorMessage,
                cliente: req.body 
            });
        }
    },

    // GET - Logout
    logout: (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.error('Erro ao fazer logout:', err);
            }
            res.redirect('/auth/login');
        });
    }
};

module.exports = authController;