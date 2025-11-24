// ./controllers/reservaController.js

const Reserva = require('../models/Reserva');
const Cliente = require('../models/Cliente');
const Barbeiro = require('../models/Barbeiro');
const Servico = require('../models/Servico');

const reservaController = {
    // READ All - Lista todas as reservas
    index: async (req, res) => {
        try {
            const reservas = await Reserva.findAll();
            res.render('reservas/index', { 
                title: 'Reservas',
                reservas 
            });
        } catch (error) {
            console.error('Erro ao listar reservas:', error);
            res.status(500).send('Erro ao listar reservas');
        }
    },

    // READ One - Detalhes de uma reserva
    show: async (req, res) => {
        const { id } = req.params;
        try {
            const reserva = await Reserva.findById(id);
            if (!reserva) {
                return res.status(404).render('error', { message: 'Reserva não encontrada' });
            }
            res.render('reservas/show', { 
                title: `Reserva #${reserva.id}`,
                reserva 
            });
        } catch (error) {
            console.error('Erro ao buscar reserva:', error);
            res.status(500).send('Erro ao buscar reserva');
        }
    },

    // GET - Formulário para criar
    getCreateForm: async (req, res) => {
        try {
            const clientes = await Cliente.findAll();
            const barbeiros = await Barbeiro.findAll();
            const servicos = await Servico.findAll(true); // Apenas ativos
            
            res.render('reservas/form', { 
                title: 'Nova Reserva',
                reserva: null,
                clientes,
                barbeiros,
                servicos,
                error: null 
            });
        } catch (error) {
            console.error('Erro ao carregar formulário:', error);
            res.status(500).send('Erro ao carregar formulário');
        }
    },

    // CREATE - Cria nova reserva
    create: async (req, res) => {
        const { cliente_id, barbeiro_id, servico_id, data_hora, observacoes } = req.body;

        // Validações básicas
        if (!cliente_id || !barbeiro_id || !servico_id || !data_hora) {
            const clientes = await Cliente.findAll();
            const barbeiros = await Barbeiro.findAll();
            const servicos = await Servico.findAll(true);
            
            return res.render('reservas/form', { 
                title: 'Nova Reserva',
                error: 'Preencha todos os campos obrigatórios',
                reserva: req.body,
                clientes,
                barbeiros,
                servicos 
            });
        }

        try {
            // Verifica disponibilidade do barbeiro
            const servico = await Servico.findById(servico_id);
            const isAvailable = await Reserva.isAvailable(barbeiro_id, data_hora, servico.duracao_min);
            
            if (!isAvailable) {
                const clientes = await Cliente.findAll();
                const barbeiros = await Barbeiro.findAll();
                const servicos = await Servico.findAll(true);
                
                return res.render('reservas/form', { 
                    title: 'Nova Reserva',
                    error: 'Barbeiro não disponível neste horário',
                    reserva: req.body,
                    clientes,
                    barbeiros,
                    servicos 
                });
            }

            const id = await Reserva.create(cliente_id, barbeiro_id, servico_id, data_hora, observacoes);
            res.redirect(`/reservas/${id}`);
            
        } catch (error) {
            console.error('Erro ao criar reserva:', error);
            
            const clientes = await Cliente.findAll();
            const barbeiros = await Barbeiro.findAll();
            const servicos = await Servico.findAll(true);
            
            res.render('reservas/form', { 
                title: 'Nova Reserva',
                error: 'Erro ao criar reserva',
                reserva: req.body,
                clientes,
                barbeiros,
                servicos 
            });
        }
    },

    // GET - Formulário para editar
    getEditForm: async (req, res) => {
        const { id } = req.params;
        try {
            const reserva = await Reserva.findById(id);
            if (!reserva) {
                return res.status(404).render('error', { message: 'Reserva não encontrada' });
            }
            
            const clientes = await Cliente.findAll();
            const barbeiros = await Barbeiro.findAll();
            const servicos = await Servico.findAll(true);
            
            res.render('reservas/form', { 
                title: 'Editar Reserva',
                reserva,
                clientes,
                barbeiros,
                servicos,
                error: null 
            });
        } catch (error) {
            console.error('Erro ao carregar formulário:', error);
            res.status(500).send('Erro ao carregar formulário');
        }
    },

    // UPDATE - Atualiza reserva
    update: async (req, res) => {
        const { id } = req.params;
        const { data_hora, barbeiro_id, servico_id, estado, observacoes } = req.body;

        if (!data_hora || !barbeiro_id || !servico_id || !estado) {
            const reserva = await Reserva.findById(id);
            const clientes = await Cliente.findAll();
            const barbeiros = await Barbeiro.findAll();
            const servicos = await Servico.findAll(true);
            
            return res.render('reservas/form', { 
                title: 'Editar Reserva',
                error: 'Preencha todos os campos obrigatórios',
                reserva: { ...reserva, ...req.body },
                clientes,
                barbeiros,
                servicos 
            });
        }

        try {
            // Verifica disponibilidade (excluindo a própria reserva)
            const servico = await Servico.findById(servico_id);
            const isAvailable = await Reserva.isAvailable(barbeiro_id, data_hora, servico.duracao_min, id);
            
            if (!isAvailable) {
                const reserva = await Reserva.findById(id);
                const clientes = await Cliente.findAll();
                const barbeiros = await Barbeiro.findAll();
                const servicos = await Servico.findAll(true);
                
                return res.render('reservas/form', { 
                    title: 'Editar Reserva',
                    error: 'Barbeiro não disponível neste horário',
                    reserva: { ...reserva, ...req.body },
                    clientes,
                    barbeiros,
                    servicos 
                });
            }

            await Reserva.update(id, data_hora, barbeiro_id, servico_id, estado, observacoes);
            res.redirect(`/reservas/${id}`);
            
        } catch (error) {
            console.error('Erro ao atualizar reserva:', error);
            
            const reserva = await Reserva.findById(id);
            const clientes = await Cliente.findAll();
            const barbeiros = await Barbeiro.findAll();
            const servicos = await Servico.findAll(true);
            
            res.render('reservas/form', { 
                title: 'Editar Reserva',
                error: 'Erro ao atualizar reserva',
                reserva: { ...reserva, ...req.body },
                clientes,
                barbeiros,
                servicos 
            });
        }
    },

    // DELETE - Remove reserva
    delete: async (req, res) => {
        const { id } = req.params;
        try {
            const affectedRows = await Reserva.delete(id);
            if (affectedRows > 0) {
                res.json({ success: true, message: 'Reserva removida com sucesso' });
            } else {
                res.status(404).json({ success: false, message: 'Reserva não encontrada' });
            }
        } catch (error) {
            console.error('Erro ao remover reserva:', error);
            res.status(500).json({ success: false, message: 'Erro ao remover reserva' });
        }
    }
};

module.exports = reservaController;