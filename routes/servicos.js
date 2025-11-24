// ./routes/servicos.js

const express = require('express');
const router = express.Router();
const servicoController = require('../controllers/servicoController');
const { requireAuth } = require('../middleware/auth');

// Todas as rotas de serviços requerem autenticação

// GET /servicos - Lista todos os serviços
router.get('/', requireAuth, servicoController.index);

// GET /servicos/create - Formulário para criar
router.get('/create', requireAuth, servicoController.getCreateForm);

// POST /servicos - Criar novo serviço
router.post('/', requireAuth, servicoController.create);

// GET /servicos/:id/edit - Formulário para editar
router.get('/:id/edit', requireAuth, servicoController.getEditForm);

// POST /servicos/:id - Atualizar serviço
router.post('/:id', requireAuth, servicoController.update);

// DELETE /servicos/:id - Remover serviço
router.delete('/:id', requireAuth, servicoController.delete);

// GET /servicos/:id - Detalhes do serviço
router.get('/:id', requireAuth, servicoController.show);

module.exports = router;