// ./routes/clientes.js

const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const { requireBarbeiro } = require('../middleware/auth');

// TODAS as rotas de clientes requerem ser BARBEIRO

// GET /clientes - Lista todos os clientes
router.get('/', requireBarbeiro, clienteController.index);

// GET /clientes/create - Formulário para criar
router.get('/create', requireBarbeiro, clienteController.getCreateForm);

// POST /clientes - Criar novo cliente
router.post('/', requireBarbeiro, clienteController.create);

// GET /clientes/:id/edit - Formulário para editar
router.get('/:id/edit', requireBarbeiro, clienteController.getEditForm);

// POST /clientes/:id - Atualizar cliente
router.post('/:id', requireBarbeiro, clienteController.update);

// DELETE /clientes/:id - Remover cliente
router.delete('/:id', requireBarbeiro, clienteController.delete);

// GET /clientes/:id - Detalhes do cliente
router.get('/:id', requireBarbeiro, clienteController.show);

module.exports = router;