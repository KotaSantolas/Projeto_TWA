// ./controllers/reservaController.js

const Reserva = require('../models/Reserva');
const Cliente = require('../models/Cliente');
const Barbeiro = require('../models/Barbeiro');
const Servico = require('../models/Servico');

const reservaController = {
    // READ All - Lista todas as reservas (com filtro para clientes)
    index: async (req, res) => {
        try {
            let reservas;
            
            // Se for CLIENTE, mostrar apenas suas próprias reservas
            if (req.session.userType === 'cliente') {
                reservas = await Reserva.findAll({ cliente_id: req.session.userId });
            } else {
                // Se for BARBEIRO, mostrar todas as reservas
                reservas = await Reserva.findAll();
            }
            
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
            
            // Se for CLIENTE, verificar se a reserva é dele
            if (req.session.userType === 'cliente' && reserva.cliente_id !== req.session.userId) {
                return res.status(403).render('error', { 
                    message: 'Não tem permissão para ver esta reserva',
                    error: { status: 403 }
                });
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
            
            // Se for CLIENTE, pré-selecionar o próprio cliente_id
            const preSelectedCliente = req.session.userType === 'cliente' ? req.session.userId : null;
            
            res.render('reservas/form', { 
                title: 'Nova Reserva',
                reserva: null,
                clientes,
                barbeiros,
                servicos,
                preSelectedCliente,
                error: null 
            });
        } catch (error) {
            console.error('Erro ao carregar formulário:', error);
            res.status(500).send('Erro ao carregar formulário');
        }
    },

    // CREATE - Cria nova reserva
    create: async (req, res) => {
        let { cliente_id, barbeiro_id, opcao_id, data_hora, observacoes } = req.body;

        // Se for CLIENTE, forçar cliente_id = userId da sessão
        if (req.session.userType === 'cliente') {
            cliente_id = req.session.userId;
        }

        // Validações básicas
        if (!cliente_id || !barbeiro_id || !opcao_id || !data_hora) {
            const clientes = await Cliente.findAll();
            const barbeiros = await Barbeiro.findAll();
            const servicos = await Servico.findAll(true);
            const preSelectedCliente = req.session.userType === 'cliente' ? req.session.userId : null;
            
            return res.render('reservas/form', { 
                title: 'Nova Reserva',
                error: 'Preencha todos os campos obrigatórios',
                reserva: req.body,
                clientes,
                barbeiros,
                servicos,
                preSelectedCliente 
            });
        }

        try {
            // Verifica disponibilidade do barbeiro
            const servico = await Servico.findById(opcao_id);
            const isAvailable = await Reserva.isAvailable(barbeiro_id, data_hora, servico.duracao_min);
            
            if (!isAvailable) {
                const clientes = await Cliente.findAll();
                const barbeiros = await Barbeiro.findAll();
                const servicos = await Servico.findAll(true);
                const preSelectedCliente = req.session.userType === 'cliente' ? req.session.userId : null;
                
                return res.render('reservas/form', { 
                    title: 'Nova Reserva',
                    error: 'Barbeiro não disponível neste horário',
                    reserva: req.body,
                    clientes,
                    barbeiros,
                    servicos,
                    preSelectedCliente 
                });
            }

            const id = await Reserva.create(cliente_id, barbeiro_id, opcao_id, data_hora, observacoes);
            res.redirect(`/reservas/${id}`);
            
        } catch (error) {
            console.error('Erro ao criar reserva:', error);
            
            const clientes = await Cliente.findAll();
            const barbeiros = await Barbeiro.findAll();
            const servicos = await Servico.findAll(true);
            const preSelectedCliente = req.session.userType === 'cliente' ? req.session.userId : null;
            
            res.render('reservas/form', { 
                title: 'Nova Reserva',
                error: 'Erro ao criar reserva',
                reserva: req.body,
                clientes,
                barbeiros,
                servicos,
                preSelectedCliente 
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
            
            // Se for CLIENTE, verificar se a reserva é dele
            if (req.session.userType === 'cliente' && reserva.cliente_id !== req.session.userId) {
                return res.status(403).render('error', { 
                    message: 'Não tem permissão para editar esta reserva',
                    error: { status: 403 }
                });
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
                preSelectedCliente: null,
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
        const { data_hora, barbeiro_id, opcao_id, estado, observacoes } = req.body;

        try {
            const reserva = await Reserva.findById(id);
            if (!reserva) {
                return res.status(404).render('error', { message: 'Reserva não encontrada' });
            }
            
            // Se for CLIENTE, verificar se a reserva é dele
            if (req.session.userType === 'cliente' && reserva.cliente_id !== req.session.userId) {
                return res.status(403).render('error', { 
                    message: 'Não tem permissão para editar esta reserva',
                    error: { status: 403 }
                });
            }

            if (!data_hora || !barbeiro_id || !opcao_id || !estado) {
                const clientes = await Cliente.findAll();
                const barbeiros = await Barbeiro.findAll();
                const servicos = await Servico.findAll(true);
                
                return res.render('reservas/form', { 
                    title: 'Editar Reserva',
                    error: 'Preencha todos os campos obrigatórios',
                    reserva: { ...reserva, ...req.body },
                    clientes,
                    barbeiros,
                    servicos,
                    preSelectedCliente: null 
                });
            }

            // Verifica disponibilidade (excluindo a própria reserva)
            const servico = await Servico.findById(opcao_id);
            const isAvailable = await Reserva.isAvailable(barbeiro_id, data_hora, servico.duracao_min, id);
            
            if (!isAvailable) {
                const clientes = await Cliente.findAll();
                const barbeiros = await Barbeiro.findAll();
                const servicos = await Servico.findAll(true);
                
                return res.render('reservas/form', { 
                    title: 'Editar Reserva',
                    error: 'Barbeiro não disponível neste horário',
                    reserva: { ...reserva, ...req.body },
                    clientes,
                    barbeiros,
                    servicos,
                    preSelectedCliente: null 
                });
            }

            await Reserva.update(id, data_hora, barbeiro_id, opcao_id, estado, observacoes);
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
                servicos,
                preSelectedCliente: null 
            });
        }
    },

    // DELETE - Remove reserva
    delete: async (req, res) => {
        const { id } = req.params;
        try {
            const reserva = await Reserva.findById(id);
            if (!reserva) {
                return res.status(404).json({ success: false, message: 'Reserva não encontrada' });
            }
            
            // Se for CLIENTE, verificar se a reserva é dele
            if (req.session.userType === 'cliente' && reserva.cliente_id !== req.session.userId) {
                return res.status(403).json({ 
                    success: false, 
                    message: 'Não tem permissão para remover esta reserva' 
                });
            }
            
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