// ./controllers/servicoController.js

const Servico = require('../models/Servico');

const servicoController = {
    // READ All - Lista todos os serviços
    index: async (req, res) => {
        try {
            const servicos = await Servico.findAll();
            res.render('servicos/index', { 
                title: 'Serviços',
                servicos 
            });
        } catch (error) {
            console.error('Erro ao listar serviços:', error);
            res.status(500).send('Erro ao listar serviços');
        }
    },

    // READ One - Detalhes de um serviço
    show: async (req, res) => {
        const { id } = req.params;
        try {
            const servico = await Servico.findById(id);
            if (!servico) {
                return res.status(404).render('error', { message: 'Serviço não encontrado' });
            }
            res.render('servicos/show', { 
                title: `Serviço: ${servico.nome_opcao}`,
                servico 
            });
        } catch (error) {
            console.error('Erro ao buscar serviço:', error);
            res.status(500).send('Erro ao buscar serviço');
        }
    },

    // GET - Formulário para criar
    getCreateForm: (req, res) => {
        res.render('servicos/form', { 
            title: 'Adicionar Serviço',
            servico: null,
            error: null 
        });
    },

    // CREATE - Cria novo serviço
    create: async (req, res) => {
        const { nome_opcao, descricao, duracao_min, preco } = req.body;

        if (!nome_opcao || !duracao_min || !preco) {
            return res.render('servicos/form', { 
                title: 'Adicionar Serviço',
                error: 'Preencha todos os campos obrigatórios',
                servico: req.body 
            });
        }

        if (duracao_min <= 0 || preco <= 0) {
            return res.render('servicos/form', { 
                title: 'Adicionar Serviço',
                error: 'Duração e preço devem ser maiores que zero',
                servico: req.body 
            });
        }

        try {
            const id = await Servico.create(nome_opcao, descricao, duracao_min, preco);
            res.redirect(`/servicos/${id}`);
        } catch (error) {
            console.error('Erro ao criar serviço:', error);
            
            const errorMessage = error.code === 'ER_DUP_ENTRY' 
                ? 'Já existe um serviço com este nome' 
                : 'Erro ao criar serviço';
            
            res.render('servicos/form', { 
                title: 'Adicionar Serviço',
                error: errorMessage,
                servico: req.body 
            });
        }
    },

    // GET - Formulário para editar
    getEditForm: async (req, res) => {
        const { id } = req.params;
        try {
            const servico = await Servico.findById(id);
            if (!servico) {
                return res.status(404).render('error', { message: 'Serviço não encontrado' });
            }
            res.render('servicos/form', { 
                title: 'Editar Serviço',
                servico,
                error: null 
            });
        } catch (error) {
            console.error('Erro ao carregar formulário:', error);
            res.status(500).send('Erro ao carregar formulário');
        }
    },

    // UPDATE - Atualiza serviço
    update: async (req, res) => {
        const { id } = req.params;
        const { nome_opcao, descricao, duracao_min, preco, estado } = req.body;

        if (!nome_opcao || !duracao_min || !preco) {
            const servico = await Servico.findById(id);
            return res.render('servicos/form', { 
                title: 'Editar Serviço',
                error: 'Preencha todos os campos obrigatórios',
                servico: { ...servico, ...req.body } 
            });
        }

        if (duracao_min <= 0 || preco <= 0) {
            const servico = await Servico.findById(id);
            return res.render('servicos/form', { 
                title: 'Editar Serviço',
                error: 'Duração e preço devem ser maiores que zero',
                servico: { ...servico, ...req.body } 
            });
        }

        try {
            await Servico.update(id, nome_opcao, descricao, duracao_min, preco, estado || 'ativo');
            res.redirect(`/servicos/${id}`);
        } catch (error) {
            console.error('Erro ao atualizar serviço:', error);
            
            const errorMessage = error.code === 'ER_DUP_ENTRY' 
                ? 'Já existe um serviço com este nome' 
                : 'Erro ao atualizar serviço';
            
            const servico = await Servico.findById(id);
            res.render('servicos/form', { 
                title: 'Editar Serviço',
                error: errorMessage,
                servico: { ...servico, ...req.body } 
            });
        }
    },

    // DELETE - Remove serviço
    delete: async (req, res) => {
        const { id } = req.params;
        try {
            const affectedRows = await Servico.delete(id);
            if (affectedRows > 0) {
                res.json({ success: true, message: 'Serviço removido com sucesso' });
            } else {
                res.status(404).json({ success: false, message: 'Serviço não encontrado' });
            }
        } catch (error) {
            console.error('Erro ao remover serviço:', error);
            
            if (error.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Não é possível remover: serviço tem reservas associadas' 
                });
            }
            
            res.status(500).json({ success: false, message: 'Erro ao remover serviço' });
        }
    }
};

module.exports = servicoController;