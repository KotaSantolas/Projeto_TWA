document.addEventListener('DOMContentLoaded', function() {
    
    // Elementos do DOM
    const selectBarbeiro = document.getElementById('barbeiro_id');
    const selectServico = document.getElementById('opcao_id');
    const inputData = document.getElementById('data_selecionada');
    const inputHorario = document.getElementById('horario_selecionado');
    const inputDataHora = document.getElementById('data_hora');
    
    const passo1 = document.getElementById('passo1');
    const passo2 = document.getElementById('passo2');
    const passo3 = document.getElementById('passo3');
    
    const calendarioDiv = document.getElementById('calendario');
    const horariosDiv = document.getElementById('horarios-lista');
    
    let flatpickrInstance = null;

    // PASSO 1: Selecionar Barbeiro e Serviço
    function validarPasso1() {
        const barbeiroSelecionado = selectBarbeiro.value;
        const servicoSelecionado = selectServico.value;
        
        if (barbeiroSelecionado && servicoSelecionado) {
            passo1.classList.remove('ativo');
            passo2.classList.add('ativo');
            inicializarCalendario();
        }
    }

    selectBarbeiro.addEventListener('change', validarPasso1);
    selectServico.addEventListener('change', validarPasso1);

    // PASSO 2: Inicializar Calendário Flatpickr
    function inicializarCalendario() {
        if (flatpickrInstance) {
            flatpickrInstance.destroy();
        }

        flatpickrInstance = flatpickr(calendarioDiv, {
            inline: true,
            minDate: 'today',
            locale: 'pt',
            dateFormat: 'Y-m-d',
            disable: [
                function(date) {
                    // Desabilitar domingos (0 = domingo)
                    return date.getDay() === 0;
                }
            ],
            onChange: function(selectedDates, dateStr) {
                inputData.value = dateStr;
                carregarHorariosDisponiveis(dateStr);
            }
        });
    }

    // PASSO 3: Carregar Horários Disponíveis
    async function carregarHorariosDisponiveis(data) {
        const barbeiroId = selectBarbeiro.value;
        const servicoId = selectServico.value;

        horariosDiv.innerHTML = '<div class="loading">A carregar horários disponíveis</div>';

        try {
            const response = await fetch(
                `/reservas/horarios-disponiveis?barbeiro_id=${barbeiroId}&data=${data}&servico_id=${servicoId}`
            );
            
            const result = await response.json();

            if (result.error) {
                horariosDiv.innerHTML = `<div class="mensagem-aviso">${result.error}</div>`;
                return;
            }

            if (result.horarios.length === 0) {
                horariosDiv.innerHTML = '<div class="mensagem-aviso">Não há horários disponíveis neste dia. Por favor, escolha outra data.</div>';
                return;
            }

            // Mostrar passo 3
            passo2.classList.remove('ativo');
            passo3.classList.add('ativo');

            // Renderizar horários
            renderizarHorarios(result.horarios);

        } catch (error) {
            console.error('Erro ao carregar horários:', error);
            horariosDiv.innerHTML = '<div class="mensagem-aviso">Erro ao carregar horários. Tente novamente.</div>';
        }
    }

    // Renderizar lista de horários
    function renderizarHorarios(horarios) {
        horariosDiv.innerHTML = '';

        horarios.forEach(horario => {
            const horarioBtn = document.createElement('div');
            horarioBtn.className = 'horario-item';
            horarioBtn.textContent = horario;
            horarioBtn.dataset.horario = horario;

            horarioBtn.addEventListener('click', function() {
                // Remover seleção anterior
                document.querySelectorAll('.horario-item').forEach(item => {
                    item.classList.remove('selecionado');
                });

                // Marcar como selecionado
                this.classList.add('selecionado');
                inputHorario.value = horario;

                // Combinar data + horário
                const dataCompleta = `${inputData.value} ${horario}:00`;
                inputDataHora.value = dataCompleta;

                // Mostrar resumo
                atualizarResumo();
            });

            horariosDiv.appendChild(horarioBtn);
        });
    }

    // Atualizar resumo da reserva
    function atualizarResumo() {
        const barbeiroNome = selectBarbeiro.options[selectBarbeiro.selectedIndex].text;
        const servicoNome = selectServico.options[selectServico.selectedIndex].text;
        const data = inputData.value;
        const horario = inputHorario.value;

        const resumoDiv = document.getElementById('resumo-info');
        if (resumoDiv) {
            resumoDiv.innerHTML = `
                <div class="resumo-item">
                    <span class="resumo-label">Barbeiro:</span>
                    <span class="resumo-valor">${barbeiroNome}</span>
                </div>
                <div class="resumo-item">
                    <span class="resumo-label">Serviço:</span>
                    <span class="resumo-valor">${servicoNome}</span>
                </div>
                <div class="resumo-item">
                    <span class="resumo-label">Data:</span>
                    <span class="resumo-valor">${formatarData(data)}</span>
                </div>
                <div class="resumo-item">
                    <span class="resumo-label">Horário:</span>
                    <span class="resumo-valor">${horario}</span>
                </div>
            `;
        }
    }

    // Formatar data para português
    function formatarData(data) {
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
    }

    // Botões de voltar
    const btnVoltar2 = document.getElementById('btn-voltar-2');
    const btnVoltar3 = document.getElementById('btn-voltar-3');

    if (btnVoltar2) {
        btnVoltar2.addEventListener('click', function() {
            passo2.classList.remove('ativo');
            passo1.classList.add('ativo');
        });
    }

    if (btnVoltar3) {
        btnVoltar3.addEventListener('click', function() {
            passo3.classList.remove('ativo');
            passo2.classList.add('ativo');
        });
    }

});
