// ./controllers/clienteController.js

const Cliente = require('../models/Cliente');

const clienteController = {
    // READ All - Lista todos os clientes
    index: async (req, res) => {
        try {
            const clientes = await Cliente.findAll();
            res.render('clientes/index', { 
                title: 'Clientes',
                clientes 
            });
        } catch (error) {
            console.error('Erro ao listar clientes:', error);
            res.status(500).send('Erro ao listar clientes');
        }
    },

    // READ One - Detalhes de um cliente
    show: async (req, res) => {
        const { id } = req.params;
        try {
            const cliente = await Cliente.findById(id);
            if (!cliente) {
                return res.status(404).render('error', { message: 'Cliente não encontrado' });
            }
            res.render('clientes/show', { 
                title: `Cliente: ${cliente.nome}`,
                cliente 
            });
        } catch (error) {
            console.error('Erro ao buscar cliente:', error);
            res.status(500).send('Erro ao buscar cliente');
        }
    },

    // GET - Formulário para criar
    getCreateForm: (req, res) => {
        res.render('clientes/form', { 
            title: 'Adicionar Cliente',
            cliente: null,
            error: null 
        });
    },

    // CREATE - Cria novo cliente
    create: async (req, res) => {
        const { primeiro_nome, ultimo_nome, email, password, telefone } = req.body;

        if (!primeiro_nome || !ultimo_nome || !email || !password) {
            return res.render('clientes/form', { 
                title: 'Adicionar Cliente',
                error: 'Preencha todos os campos obrigatórios',
                cliente: req.body 
            });
        }

        try {
            const id = await Cliente.create(primeiro_nome, ultimo_nome, email, password, telefone || '');
            res.redirect(`/clientes/${id}`);
        } catch (error) {
            console.error('Erro ao criar cliente:', error);
            
            const errorMessage = error.code === 'ER_DUP_ENTRY' 
                ? 'Email já registado' 
                : 'Erro ao criar cliente';
            
            res.render('clientes/form', { 
                title: 'Adicionar Cliente',
                error: errorMessage,
                cliente: req.body 
            });
        }
    },

    // GET - Formulário para editar
    getEditForm: async (req, res) => {
        const { id } = req.params;
        try {
            const cliente = await Cliente.findById(id);
            if (!cliente) {
                return res.status(404).render('error', { message: 'Cliente não encontrado' });
            }
            res.render('clientes/form', { 
                title: 'Editar Cliente',
                cliente,
                error: null 
            });
        } catch (error) {
            console.error('Erro ao carregar formulário:', error);
            res.status(500).send('Erro ao carregar formulário');
        }
    },

    // UPDATE - Atualiza cliente
    update: async (req, res) => {
        const { id } = req.params;
        const { primeiro_nome, ultimo_nome, email, telefone } = req.body;

        if (!primeiro_nome || !ultimo_nome || !email) {
            const cliente = await Cliente.findById(id);
            return res.render('clientes/form', { 
                title: 'Editar Cliente',
                error: 'Preencha todos os campos obrigatórios',
                cliente: { ...cliente, ...req.body } 
            });
        }

        try {
            await Cliente.update(id, primeiro_nome, ultimo_nome, email, telefone || '');
            res.redirect(`/clientes/${id}`);
        } catch (error) {
            console.error('Erro ao atualizar cliente:', error);
            
            const errorMessage = error.code === 'ER_DUP_ENTRY' 
                ? 'Email já registado' 
                : 'Erro ao atualizar cliente';
            
            const cliente = await Cliente.findById(id);
            res.render('clientes/form', { 
                title: 'Editar Cliente',
                error: errorMessage,
                cliente: { ...cliente, ...req.body } 
            });
        }
    },

    // DELETE - Remove cliente
    delete: async (req, res) => {
        const { id } = req.params;
        try {
            const affectedRows = await Cliente.delete(id);
            if (affectedRows > 0) {
                res.json({ success: true, message: 'Cliente removido com sucesso' });
            } else {
                res.status(404).json({ success: false, message: 'Cliente não encontrado' });
            }
        } catch (error) {
            console.error('Erro ao remover cliente:', error);
            
            if (error.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Não é possível remover: cliente tem reservas associadas' 
                });
            }
            
            res.status(500).json({ success: false, message: 'Erro ao remover cliente' });
        }
    }
};

module.exports = clienteController;