const db = require('../config/database');
const bcrypt = require('bcrypt');

const Cliente = {
    // Criação de tabelas
    createTable: async () => {
        const sql = `
            CREATE TABLE IF NOT EXISTS clientes (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                primeiro_nome VARCHAR(80) NOT NULL,
                ultimo_nome VARCHAR(80) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                palavra_passe VARCHAR(255) NOT NULL,
                telefone VARCHAR(32) NOT NULL
            )
        `;
        await db.execute(sql);
        console.log('Tabela clientes pronta.');
    },

    // CREATE: Cria um novo cliente
    create: async (primeiro_nome, ultimo_nome, email, password, telefone) => {
        const palavra_passe = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO clientes (primeiro_nome, ultimo_nome, email, palavra_passe, telefone) VALUES (?, ?, ?, ?, ?)';
        const [result] = await db.execute(sql, [primeiro_nome, ultimo_nome, email, palavra_passe, telefone]);
        return result.insertId;
    },

    // READ: Encontra um cliente por ID
    findById: async (id) => {
        const [rows] = await db.execute(
            'SELECT id, primeiro_nome, ultimo_nome, CONCAT(primeiro_nome, " ", ultimo_nome) AS nome, email, telefone FROM clientes WHERE id = ?', 
            [id]
        );
        return rows[0];
    },
    
    // READ: Encontra um cliente por Email (para login)
    findByEmail: async (email) => {
        const [rows] = await db.execute(
            'SELECT id, CONCAT(primeiro_nome, " ", ultimo_nome) AS nome, palavra_passe AS password_hash, email FROM clientes WHERE email = ?', 
            [email]
        );
        return rows[0];
    },

    // READ: Lista todos os clientes
    findAll: async () => {
        const [rows] = await db.execute(
            'SELECT id, CONCAT(primeiro_nome, " ", ultimo_nome) AS nome, email, telefone FROM clientes ORDER BY primeiro_nome'
        );
        return rows;
    },

    // UPDATE: Atualiza os dados do cliente
    update: async (id, primeiro_nome, ultimo_nome, email, telefone) => {
        const sql = 'UPDATE clientes SET primeiro_nome = ?, ultimo_nome = ?, email = ?, telefone = ? WHERE id = ?';
        const [result] = await db.execute(sql, [primeiro_nome, ultimo_nome, email, telefone, id]);
        return result.affectedRows;
    },

    // DELETE: Remove um cliente
    delete: async (id) => {
        const [result] = await db.execute('DELETE FROM clientes WHERE id = ?', [id]);
        return result.affectedRows;
    },
};

module.exports = Cliente;