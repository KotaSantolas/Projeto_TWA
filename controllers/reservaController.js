// ./controllers/reservaController.js

const Reserva = require('../models/Reserva');
const Cliente = require('../models/Cliente');
const Barbeiro = require('../models/Barbeiro');
const Servico = require('../models/Servico');

const reservaController = {
    // READ All - Lista todas as reservas (com filtro opcional)
    index: async (req, res) => {
        try {
            const { barbeiro_id } = req.query;
            
            // Buscar todos os barbeiros para o dropdown
            const barbeiros = await Barbeiro.findAll();
            
            // Buscar reservas (filtradas ou todas)
            const filtro = barbeiro_id ? { barbeiro_id } : {};
            const reservas = await Reserva.findAll(filtro);
            
            res.render('reservas/index', { 
                title: 'Reservas',
                reservas,
                barbeiros,
                barbeiro_selecionado: barbeiro_id || ''
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
            
            // Formatar data_hora para o formato datetime-local (YYYY-MM-DDTHH:MM)
            if (reserva.data_hora) {
                const dataObj = new Date(reserva.data_hora);
                const ano = dataObj.getFullYear();
                const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
                const dia = String(dataObj.getDate()).padStart(2, '0');
                const hora = String(dataObj.getHours()).padStart(2, '0');
                const minuto = String(dataObj.getMinutes()).padStart(2, '0');
                
                reserva.data_hora_formatada = `${ano}-${mes}-${dia}T${hora}:${minuto}`;
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
            // Buscar reserva original para comparar data
            const reservaOriginal = await Reserva.findById(id);
            if (!reservaOriginal) {
                return res.status(404).render('error', { message: 'Reserva não encontrada' });
            }
            
            // Formatar data original para comparação
            const dataOriginalObj = new Date(reservaOriginal.data_hora);
            const dataOriginalFormatada = dataOriginalObj.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
            
            // Validar formato de data e minutos (00 ou 30)
            const dataObj = new Date(data_hora);
            const agora = new Date();
            const minutos = dataObj.getMinutes();
            const hora = dataObj.getHours();
            const diaSemana = dataObj.getDay();
            
            // NOVA LÓGICA: Validar data passada APENAS se a data foi alterada
            const dataNovaFormatada = dataObj.toISOString().slice(0, 16);
            const dataFoiAlterada = dataOriginalFormatada !== dataNovaFormatada;
            
            if (dataFoiAlterada && dataObj < agora) {
                // Se tentou mudar para uma data passada diferente da original
                const reserva = await Reserva.findById(id);
                const clientes = await Cliente.findAll();
                const barbeiros = await Barbeiro.findAll();
                const servicos = await Servico.findAll(true);
                
                return res.render('reservas/form', { 
                    title: 'Editar Reserva',
                    error: 'Não é possível alterar para uma data/hora passada. Mantenha a data original ou escolha uma data futura.',
                    reserva: { ...reserva, ...req.body },
                    clientes,
                    barbeiros,
                    servicos 
                });
            }
            
            // Validar minutos (00 ou 30)
            if (minutos !== 0 && minutos !== 30) {
                const reserva = await Reserva.findById(id);
                const clientes = await Cliente.findAll();
                const barbeiros = await Barbeiro.findAll();
                const servicos = await Servico.findAll(true);
                
                return res.render('reservas/form', { 
                    title: 'Editar Reserva',
                    error: 'Horário inválido. Escolha minutos :00 ou :30',
                    reserva: { ...reserva, ...req.body },
                    clientes,
                    barbeiros,
                    servicos 
                });
            }
            
            // Validar horário de funcionamento (09:00 - 19:00)
            if (hora < 9 || hora >= 19) {
                const reserva = await Reserva.findById(id);
                const clientes = await Cliente.findAll();
                const barbeiros = await Barbeiro.findAll();
                const servicos = await Servico.findAll(true);
                
                return res.render('reservas/form', { 
                    title: 'Editar Reserva',
                    error: 'Horário fora do expediente. Funcionamento: 09:00 - 19:00',
                    reserva: { ...reserva, ...req.body },
                    clientes,
                    barbeiros,
                    servicos 
                });
            }
            
            // Validar pausa de almoço
            if (hora === 12) {
                const reserva = await Reserva.findById(id);
                const clientes = await Cliente.findAll();
                const barbeiros = await Barbeiro.findAll();
                const servicos = await Servico.findAll(true);
                
                return res.render('reservas/form', { 
                    title: 'Editar Reserva',
                    error: 'Não é possível agendar durante a pausa de almoço (12:00 - 13:00)',
                    reserva: { ...reserva, ...req.body },
                    clientes,
                    barbeiros,
                    servicos 
                });
            }
            
            // Validar domingo (0 = domingo)
            if (diaSemana === 0) {
                const reserva = await Reserva.findById(id);
                const clientes = await Cliente.findAll();
                const barbeiros = await Barbeiro.findAll();
                const servicos = await Servico.findAll(true);
                
                return res.render('reservas/form', { 
                    title: 'Editar Reserva',
                    error: 'A barbearia está fechada aos domingos',
                    reserva: { ...reserva, ...req.body },
                    clientes,
                    barbeiros,
                    servicos 
                });
            }
            
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