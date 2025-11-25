// ./controllers/authController.js

const Cliente = require('../models/Cliente');
const bcrypt = require('bcrypt');

const authController = {
    // GET - Formulário de login
    getLogin: (req, res) => {
        res.render('auth/login', { 
            title: 'Login',
            error: null 
        });
    },

    // POST - Processar login
    postLogin: async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.render('auth/login', { 
                title: 'Login',
                error: 'Preencha todos os campos',
                email 
            });
        }

        try {
            const user = await Cliente.findByEmail(email);
            
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

            // Login bem-sucedido
            req.session.userId = user.id;
            req.session.userName = user.nome; // Agora já vem como "nome completo"
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

    // GET - Formulário de registo
    getRegister: (req, res) => {
        res.render('auth/register', { 
            title: 'Registar',
            error: null 
        });
    },

    // POST - Processar registo
    postRegister: async (req, res) => {
        const { nome, email, password, password_confirm, telefone } = req.body;

        // Validações
        if (!nome || !email || !password || !password_confirm) {
            return res.render('auth/register', { 
                title: 'Registar',
                error: 'Preencha todos os campos obrigatórios',
                cliente: req.body 
            });
        }

        // Valida se o nome tem pelo menos primeiro e último nome
        const nomes = nome.trim().split(' ');
        if (nomes.length < 1) {
            return res.render('auth/register', { 
                title: 'Registar',
                error: 'Por favor, insira o seu nome completo',
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
            const id = await Cliente.create(nome, email, password, telefone || '');
            
            // Login automático após registo
            req.session.userId = id;
            req.session.userName = nome;
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