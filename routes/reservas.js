// ./routes/reservas.js

const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reservaController');
const { requireAuth } = require('../middleware/auth');

// Todas as rotas de reservas requerem autenticação

// GET /reservas - Lista todas as reservas
router.get('/', requireAuth, reservaController.index);

// GET /reservas/horarios-disponiveis - Lista horários disponíveis
router.get('/horarios-disponiveis', requireAuth, reservaController.getHorariosDisponiveis);

// GET /reservas/create - Formulário para criar
router.get('/create', requireAuth, reservaController.getCreateForm);

// POST /reservas - Criar nova reserva
router.post('/', requireAuth, reservaController.create);

// GET /reservas/:id/edit - Formulário para editar
router.get('/:id/edit', requireAuth, reservaController.getEditForm);

// POST /reservas/:id - Atualizar reserva
router.post('/:id', requireAuth, reservaController.update);

// DELETE /reservas/:id - Remover reserva
router.delete('/:id', requireAuth, reservaController.delete);

// GET /reservas/:id - Detalhes da reserva
router.get('/:id', requireAuth, reservaController.show);

module.exports = router;