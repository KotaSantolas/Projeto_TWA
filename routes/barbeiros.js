// ./routes/barbeiros.js

const express = require('express');
const router = express.Router();
const barbeiroController = require('../controllers/barbeiroController');
const upload = require('../middleware/upload');
const { requireAuth } = require('../middleware/auth');

// Todas as rotas de barbeiros requerem autenticação

// GET /barbeiros - Lista todos os barbeiros
router.get('/', requireAuth, barbeiroController.index);

// GET /barbeiros/create - Formulário para criar
router.get('/create', requireAuth, barbeiroController.getCreateForm);

// POST /barbeiros - Criar novo barbeiro (com upload)
router.post('/', requireAuth, upload.single('foto'), barbeiroController.create);

// GET /barbeiros/:id/edit - Formulário para editar
router.get('/:id/edit', requireAuth, barbeiroController.getEditForm);

// POST /barbeiros/:id - Atualizar barbeiro (com upload)
router.post('/:id', requireAuth, upload.single('foto'), barbeiroController.update);

// DELETE /barbeiros/:id - Remover barbeiro
router.delete('/:id', requireAuth, barbeiroController.delete);

// GET /barbeiros/:id - Detalhes do barbeiro
router.get('/:id', requireAuth, barbeiroController.show);

module.exports = router;