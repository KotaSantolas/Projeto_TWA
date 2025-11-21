// ./models/Servico.js

const db = require('../config/database');

const Servico = {
    // Criação de tabelas
    createTable: async () => {
        const sql = `
            CREATE TABLE IF NOT EXISTS servicos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                descricao TEXT,
                duracao_min INT NOT NULL,
                preco DECIMAL(10, 2) NOT NULL,
                estado ENUM('ativo', 'inativo') DEFAULT 'ativo',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
        const [rows] = await db.execute('SELECT * FROM servicos WHERE id = ?', [id]);
        return rows[0];
    },

    // READ: Lista todos os serviços (ou ativos)
    findAll: async (onlyActive = false) => {
        const condition = onlyActive ? "WHERE estado = 'ativo'" : '';
        const [rows] = await db.execute(`SELECT * FROM servicos ${condition} ORDER BY nome`);
        return rows;
    },

    // UPDATE: Atualiza os dados do serviço
    update: async (id, nome, descricao, duracao_min, preco, estado) => {
        const sql = 'UPDATE servicos SET nome = ?, descricao = ?, duracao_min = ?, preco = ?, estado = ? WHERE id = ?';
        const [result] = await db.execute(sql, [nome, descricao, duracao_min, preco, estado, id]);
        return result.affectedRows;
    },

    // DELETE: Remove um serviço
    delete: async (id) => {
        const [result] = await db.execute('DELETE FROM servicos WHERE id = ?', [id]);
        return result.affectedRows;
    },
};

module.exports = Servico;