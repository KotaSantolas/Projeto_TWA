// ./routes/clientes.js

const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const { requireAuth } = require('../middleware/auth');

// Todas as rotas de clientes requerem autenticação

// GET /clientes - Lista todos os clientes
router.get('/', requireAuth, clienteController.index);

// GET /clientes/create - Formulário para criar
router.get('/create', requireAuth, clienteController.getCreateForm);

// POST /clientes - Criar novo cliente
router.post('/', requireAuth, clienteController.create);

// GET /clientes/:id/edit - Formulário para editar
router.get('/:id/edit', requireAuth, clienteController.getEditForm);

// POST /clientes/:id - Atualizar cliente
router.post('/:id', requireAuth, clienteController.update);

// DELETE /clientes/:id - Remover cliente
router.delete('/:id', requireAuth, clienteController.delete);

// GET /clientes/:id - Detalhes do cliente
router.get('/:id', requireAuth, clienteController.show);

module.exports = router;