const express = require('express');
const router = express.Router();
const servicoController = require('../controllers/servicoController');
const { requireBarbeiro } = require('../middleware/auth');

// TODAS as rotas de serviços requerem ser BARBEIRO

// GET /servicos - Lista todos os serviços
router.get('/', requireBarbeiro, servicoController.index);

// GET /servicos/create - Formulário para criar
router.get('/create', requireBarbeiro, servicoController.getCreateForm);

// POST /servicos - Criar novo serviço
router.post('/', requireBarbeiro, servicoController.create);

// GET /servicos/:id/edit - Formulário para editar
router.get('/:id/edit', requireBarbeiro, servicoController.getEditForm);

// POST /servicos/:id - Atualizar serviço
router.post('/:id', requireBarbeiro, servicoController.update);

// DELETE /servicos/:id - Remover serviço
router.delete('/:id', requireBarbeiro, servicoController.delete);

// GET /servicos/:id - Detalhes do serviço
router.get('/:id', requireBarbeiro, servicoController.show);

module.exports = router;