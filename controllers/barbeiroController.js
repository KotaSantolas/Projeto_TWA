// ./controllers/barbeiroController.js

const Barbeiro = require('../models/Barbeiro');
const fs = require('fs/promises');
const path = require('path');

const barbeiroController = {
    // 1. CREATE (Processa o formulário POST)
    create: async (req, res) => {
        const { primeiro_nome, ultimo_nome, email, password, telefone } = req.body;
        const foto_url = req.file ? `/uploads/${req.file.filename}` : null;

        if (!primeiro_nome || !ultimo_nome || !email || !password) {
            if (foto_url) {
                await fs.unlink(req.file.path).catch(err => console.error("Erro ao apagar arquivo:", err));
            }
            return res.render('barbeiros/form', { 
                error: 'Preencha todos os campos obrigatórios.',
                barbeiro: req.body,
                title: 'Adicionar Barbeiro'
            });
        }

        try {
            const id = await Barbeiro.create(primeiro_nome, ultimo_nome, email, password, telefone || '', foto_url);
            res.redirect(`/barbeiros/${id}`);
        } catch (error) {
            console.error(error);
            const errorMessage = error.code === 'ER_DUP_ENTRY' ? 'Email já registado.' : 'Erro ao criar barbeiro.';
            
            if (foto_url) {
                await fs.unlink(req.file.path).catch(err => console.error("Erro ao apagar arquivo:", err));
            }
            res.render('barbeiros/form', { 
                error: errorMessage, 
                barbeiro: req.body,
                title: 'Adicionar Barbeiro'
            });
        }
    },
    
    // 2. READ All (Lista todos)
    index: async (req, res) => {
        try {
            const barbeiros = await Barbeiro.findAll();
            res.render('barbeiros/index', { barbeiros: barbeiros });
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro ao listar barbeiros.');
        }
    },
    
    // 3. READ One (Detalhes)
    show: async (req, res) => {
        const { id } = req.params;
        try {
            const barbeiro = await Barbeiro.findById(id);
            if (!barbeiro) {
                return res.status(404).render('error', { message: 'Barbeiro não encontrado.' });
            }
            res.render('barbeiros/show', { barbeiro: barbeiro });
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro ao buscar detalhes do barbeiro.');
        }
    },
    
    // 4. GET form para criar
    getCreateForm: (req, res) => {
        res.render('barbeiros/form', { title: 'Adicionar Barbeiro', barbeiro: null, error: null });
    },

    // 5. GET form para editar
    getEditForm: async (req, res) => {
        const { id } = req.params;
        try {
            const barbeiro = await Barbeiro.findById(id);
            if (!barbeiro) {
                return res.status(404).render('error', { message: 'Barbeiro não encontrado.' });
            }
            res.render('barbeiros/form', { title: 'Editar Barbeiro', barbeiro: barbeiro, error: null });
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro ao carregar formulário de edição.');
        }
    },

    // 6. UPDATE (Processa o formulário POST para editar)
    update: async (req, res) => {
        const { id } = req.params;
        const { primeiro_nome, ultimo_nome, email, telefone, remover_foto } = req.body;
        let foto_url = req.file ? `/uploads/${req.file.filename}` : undefined;

        if (!primeiro_nome || !ultimo_nome || !email) {
            if (req.file) await fs.unlink(req.file.path).catch(err => console.error(err));
            const barbeiro = await Barbeiro.findById(id);
            return res.render('barbeiros/form', { 
                title: 'Editar Barbeiro', 
                barbeiro: { ...barbeiro, ...req.body }, 
                error: 'Preencha todos os campos obrigatórios.' 
            });
        }

        try {
            const existingBarbeiro = await Barbeiro.findById(id);
            if (!existingBarbeiro) {
                if (req.file) await fs.unlink(req.file.path).catch(err => console.error(err));
                return res.status(404).render('error', { message: 'Barbeiro não encontrado.' });
            }
            
            let old_foto_path = existingBarbeiro.foto_url ? path.join(__dirname, '..', 'public', existingBarbeiro.foto_url) : null;

            if (remover_foto === 'on') {
                if (old_foto_path) {
                    await fs.unlink(old_foto_path).catch(err => console.error("Erro ao apagar foto antiga:", err));
                }
                foto_url = null;
            } else if (req.file) {
                if (old_foto_path) {
                    await fs.unlink(old_foto_path).catch(err => console.error("Erro ao apagar foto antiga:", err));
                }
            } else {
                foto_url = existingBarbeiro.foto_url;
            }

            await Barbeiro.update(id, primeiro_nome, ultimo_nome, email, telefone || '', foto_url);
            res.redirect(`/barbeiros/${id}`);

        } catch (error) {
            console.error(error);
            const errorMessage = error.code === 'ER_DUP_ENTRY' ? 'Email já registado.' : 'Erro ao atualizar barbeiro.';
            
            if (req.file) {
                await fs.unlink(req.file.path).catch(err => console.error("Erro ao apagar novo arquivo após erro:", err));
            }
            
            res.render('barbeiros/form', { 
                title: 'Editar Barbeiro', 
                barbeiro: { ...req.body, id: id }, 
                error: errorMessage 
            });
        }
    },

    // 7. DELETE
    delete: async (req, res) => {
        const { id } = req.params;
        try {
            const barbeiro = await Barbeiro.findById(id);
            if (!barbeiro) {
                return res.status(404).json({ success: false, message: 'Barbeiro não encontrado.' });
            }
            
            if (barbeiro.foto_url) {
                const fotoPath = path.join(__dirname, '..', 'public', barbeiro.foto_url);
                await fs.unlink(fotoPath).catch(err => console.error("Erro ao apagar foto do barbeiro:", err));
            }

            const affectedRows = await Barbeiro.delete(id);
            if (affectedRows > 0) {
                res.json({ success: true, message: 'Barbeiro removido com sucesso.' });
            } else {
                res.status(404).json({ success: false, message: 'Barbeiro não encontrado.' });
            }
        } catch (error) {
            console.error(error);
            if (error.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(400).json({ success: false, message: 'Não é possível remover o barbeiro: tem reservas associadas.' });
            }
            res.status(500).json({ success: false, message: 'Erro ao remover barbeiro.' });
        }
    }
};

module.exports = barbeiroController;