// ./routes/barbeiros.js

const express = require('express');
const router = express.Router();
const barbeiroController = require('../controllers/barbeiroController');
const upload = require('../middleware/upload'); // Importa o middleware de upload

// Rotas para a entidade Barbeiros
// A rota POST usa o middleware 'upload.single('foto')' para processar a foto.

// GET /barbeiros - Lista todos os barbeiros
router.get('/', barbeiroController.index);

// GET /barbeiros/create - Formulário para criar novo barbeiro
router.get('/create', barbeiroController.getCreateForm);

// POST /barbeiros - Cria novo barbeiro (com upload de foto)
router.post('/', upload.single('foto'), barbeiroController.create);

// GET /barbeiros/:id/edit - Formulário para editar barbeiro
router.get('/:id/edit', barbeiroController.getEditForm);

// POST /barbeiros/:id - Atualiza barbeiro (usa POST para edição/atualização, com método override ou PUT)
// Aqui estamos a usar POST e re-processamos o upload para novas fotos
router.post('/:id', upload.single('foto'), barbeiroController.update);

// GET /barbeiros/:id - Detalhes de um barbeiro
router.get('/:id', barbeiroController.show);

// DELETE /barbeiros/:id - Remove barbeiro
router.delete('/:id', barbeiroController.delete);

module.exports = router;