// ./models/Barbeiro.js

const db = require('../config/database');
const bcrypt = require('bcrypt');

const Barbeiro = {
    // Criação de tabelas
    createTable: async () => {
        const sql = `
            CREATE TABLE IF NOT EXISTS barbeiros (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                telefone VARCHAR(20),
                foto_url VARCHAR(255) DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        await db.execute(sql);
        console.log('Tabela barbeiros pronta.');
    },

    // CREATE: Cria um novo barbeiro
    create: async (nome, email, password, telefone, foto_url) => {
        const password_hash = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO barbeiros (nome, email, password_hash, telefone, foto_url) VALUES (?, ?, ?, ?, ?)';
        const [result] = await db.execute(sql, [nome, email, password_hash, telefone, foto_url]);
        return result.insertId;
    },

    // READ: Encontra um barbeiro por ID
    findById: async (id) => {
        const [rows] = await db.execute('SELECT id, nome, email, telefone, foto_url FROM barbeiros WHERE id = ?', [id]);
        return rows[0];
    },
    
    // READ: Encontra um barbeiro por Email (para login)
    findByEmail: async (email) => {
        const [rows] = await db.execute('SELECT * FROM barbeiros WHERE email = ?', [email]);
        return rows[0];
    },

    // READ: Lista todos os barbeiros
    findAll: async () => {
        const [rows] = await db.execute('SELECT id, nome, foto_url FROM barbeiros ORDER BY nome');
        return rows;
    },

    // UPDATE: Atualiza os dados do barbeiro
    update: async (id, nome, email, telefone, foto_url) => {
        let sql = 'UPDATE barbeiros SET nome = ?, email = ?, telefone = ?';
        let params = [nome, email, telefone];
        
        if (foto_url !== undefined) {
            sql += ', foto_url = ?';
            params.push(foto_url);
        }
        
        sql += ' WHERE id = ?';
        params.push(id);
        
        const [result] = await db.execute(sql, params);
        return result.affectedRows;
    },
    
    // DELETE: Remove um barbeiro
    delete: async (id) => {
        const [result] = await db.execute('DELETE FROM barbeiros WHERE id = ?', [id]);
        return result.affectedRows;
    },
};

module.exports = Barbeiro;