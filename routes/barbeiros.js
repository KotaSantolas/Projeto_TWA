const express = require('express');
const router = express.Router();
const barbeiroController = require('../controllers/barbeiroController');
const upload = require('../middleware/upload');
const { requireBarbeiro } = require('../middleware/auth');

// TODAS as rotas de barbeiros requerem ser BARBEIRO

// GET /barbeiros - Lista todos os barbeiros
router.get('/', requireBarbeiro, barbeiroController.index);

// GET /barbeiros/create - Formulário para criar
router.get('/create', requireBarbeiro, barbeiroController.getCreateForm);

// POST /barbeiros - Criar novo barbeiro (com upload)
router.post('/', requireBarbeiro, upload.single('foto'), barbeiroController.create);

// GET /barbeiros/:id/edit - Formulário para editar
router.get('/:id/edit', requireBarbeiro, barbeiroController.getEditForm);

// POST /barbeiros/:id - Atualizar barbeiro (com upload)
router.post('/:id', requireBarbeiro, upload.single('foto'), barbeiroController.update);

// DELETE /barbeiros/:id - Remover barbeiro
router.delete('/:id', requireBarbeiro, barbeiroController.delete);

// GET /barbeiros/:id - Detalhes do barbeiro
router.get('/:id', requireBarbeiro, barbeiroController.show);

module.exports = router;