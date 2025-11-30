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

    // API - Retorna horários disponíveis para um barbeiro em uma data
    getHorariosDisponiveis: async (req, res) => {
        try {
            const { barbeiro_id, data, servico_id } = req.query;

            // Validação básica
            if (!barbeiro_id || !data || !servico_id) {
                return res.status(400).json({ 
                    error: 'Parâmetros obrigatórios: barbeiro_id, data, servico_id' 
                });
            }

            // Buscar duração do serviço
            const servico = await Servico.findById(servico_id);
            if (!servico) {
                return res.status(404).json({ error: 'Serviço não encontrado' });
            }

            const duracao = parseInt(servico.duracao_min);

            // Configuração dos horários da barbearia
            const HORA_ABERTURA = 9;
            const HORA_FECHO = 19;
            const PAUSA_INICIO = 12;
            const PAUSA_FIM = 13;
            const INTERVALO_MINUTOS = 30;

            // Gerar todos os slots possíveis
            const slots = [];
            for (let hora = HORA_ABERTURA; hora < HORA_FECHO; hora++) {
                for (let minuto = 0; minuto < 60; minuto += INTERVALO_MINUTOS) {
                    // Pular pausa de almoço
                    if (hora === PAUSA_INICIO && minuto === 0) continue;
                    
                    // Verificar se o slot + duração não ultrapassa horário
                    const horaFim = hora + Math.floor((minuto + duracao) / 60);
                    const minutoFim = (minuto + duracao) % 60;
                    
                    if (horaFim > HORA_FECHO || (horaFim === HORA_FECHO && minutoFim > 0)) {
                        break;
                    }

                    // Não começar durante a pausa
                    if (hora === PAUSA_INICIO || (hora === PAUSA_INICIO - 1 && minuto === 30 && duracao === 60)) {
                        continue;
                    }

                    const horaStr = String(hora).padStart(2, '0');
                    const minutoStr = String(minuto).padStart(2, '0');
                    slots.push(`${horaStr}:${minutoStr}`);
                }
            }

            // Verificar disponibilidade de cada slot
            const horariosDisponiveis = [];
            for (const slot of slots) {
                const dataHora = `${data} ${slot}:00`;
                const isAvailable = await Reserva.isAvailable(barbeiro_id, dataHora, duracao);
                
                if (isAvailable) {
                    horariosDisponiveis.push(slot);
                }
            }

            res.json({ horarios: horariosDisponiveis });

        } catch (error) {
            console.error('Erro ao buscar horários disponíveis:', error);
            res.status(500).json({ error: 'Erro ao buscar horários disponíveis' });
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
        const { cliente_id, barbeiro_id, opcao_id, data_hora, observacoes } = req.body;

        // Validações básicas
        if (!cliente_id || !barbeiro_id || !opcao_id || !data_hora) {
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
            const servico = await Servico.findById(opcao_id);
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

            const id = await Reserva.create(cliente_id, barbeiro_id, opcao_id, data_hora, observacoes);
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
        const { data_hora, barbeiro_id, opcao_id, estado, observacoes } = req.body;

        if (!data_hora || !barbeiro_id || !opcao_id || !estado) {
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
            const servico = await Servico.findById(opcao_id);
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
