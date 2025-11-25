// ./models/Servico.js

const db = require('../config/database');

const Servico = {
    // Criação de tabelas
    createTable: async () => {
        const sql = `
            CREATE TABLE IF NOT EXISTS servicos (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                descricao TEXT,
                duracao_min SMALLINT UNSIGNED NOT NULL,
                preco DECIMAL(8, 2) NOT NULL,
                ativo TINYINT(1) NOT NULL DEFAULT 1
            )
        `;
        await db.execute(sql);
        console.log('Tabela servicos pronta.');
    },

    // CREATE: Cria um novo serviço
    create: async (nome, descricao, duracao_min, preco) => {
        const sql = 'INSERT INTO servicos (nome, descricao, duracao_min, preco) VALUES (?, ?, ?, ?)';
        const [result] = await db.execute(sql, [nome, descricao, duracao_min, preco]);
        return result.insertId;
    },

    // READ: Encontra um serviço por ID
    findById: async (id) => {
        const [rows] = await db.execute(
            'SELECT id, nome, descricao, duracao_min, preco, IF(ativo = 1, "ativo", "inativo") AS estado FROM servicos WHERE id = ?', 
            [id]
        );
        return rows[0];
    },

    // READ: Lista todos os serviços (ou ativos)
    findAll: async (onlyActive = false) => {
        const condition = onlyActive ? 'WHERE ativo = 1' : '';
        const [rows] = await db.execute(
            `SELECT id, nome, descricao, duracao_min, preco, IF(ativo = 1, "ativo", "inativo") AS estado FROM servicos ${condition} ORDER BY nome`
        );
        return rows;
    },

    // UPDATE: Atualiza os dados do serviço
    update: async (id, nome, descricao, duracao_min, preco, estado) => {
        const ativo = estado === 'ativo' ? 1 : 0;
        const sql = 'UPDATE servicos SET nome = ?, descricao = ?, duracao_min = ?, preco = ?, ativo = ? WHERE id = ?';
        const [result] = await db.execute(sql, [nome, descricao, duracao_min, preco, ativo, id]);
        return result.affectedRows;
    },

    // DELETE: Remove um serviço
    delete: async (id) => {
        const [result] = await db.execute('DELETE FROM servicos WHERE id = ?', [id]);
        return result.affectedRows;
    }
};

module.exports = Servico;