// ./models/Cliente.js

const db = require('../config/database');
const bcrypt = require('bcrypt');

const Cliente = {
    // Criação de tabelas (usado para inicialização)
    createTable: async () => {
        const sql = `
            CREATE TABLE IF NOT EXISTS clientes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                telefone VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        await db.execute(sql);
        console.log('Tabela clientes pronta.');
    },

    // CREATE: Cria um novo cliente
    create: async (nome, email, password, telefone) => {
        const password_hash = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO clientes (nome, email, password_hash, telefone) VALUES (?, ?, ?, ?)';
        const [result] = await db.execute(sql, [nome, email, password_hash, telefone]);
        return result.insertId;
    },

    // READ: Encontra um cliente por ID
    findById: async (id) => {
        const [rows] = await db.execute('SELECT id, nome, email, telefone FROM clientes WHERE id = ?', [id]);
        return rows[0];
    },
    
    // READ: Encontra um cliente por Email (para login)
    findByEmail: async (email) => {
        const [rows] = await db.execute('SELECT * FROM clientes WHERE email = ?', [email]);
        return rows[0];
    },

    // READ: Lista todos os clientes
    findAll: async () => {
        const [rows] = await db.execute('SELECT id, nome, email, telefone, created_at FROM clientes ORDER BY nome');
        return rows;
    },

    // UPDATE: Atualiza os dados do cliente
    update: async (id, nome, email, telefone) => {
        const sql = 'UPDATE clientes SET nome = ?, email = ?, telefone = ? WHERE id = ?';
        const [result] = await db.execute(sql, [nome, email, telefone, id]);
        return result.affectedRows;
    },

    // DELETE: Remove um cliente
    delete: async (id) => {
        const [result] = await db.execute('DELETE FROM clientes WHERE id = ?', [id]);
        return result.affectedRows;
    },
};

module.exports = Cliente;