// ./models/Barbeiro.js

const db = require('../config/database');
const bcrypt = require('bcrypt');

const Barbeiro = {
    // Criação de tabelas
    createTable: async () => {
        const sql = `
            CREATE TABLE IF NOT EXISTS barbeiros (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                primeiro_nome VARCHAR(80) NOT NULL,
                ultimo_nome VARCHAR(80) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                palavra_passe VARCHAR(255) NOT NULL,
                telefone VARCHAR(32) NOT NULL,
                fotografia VARCHAR(255) DEFAULT NULL
            )
        `;
        await db.execute(sql);
        console.log('Tabela barbeiros pronta.');
    },

    // CREATE: Cria um novo barbeiro
    create: async (primeiro_nome, ultimo_nome, email, password, telefone, foto_url) => {
        const palavra_passe = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO barbeiros (primeiro_nome, ultimo_nome, email, palavra_passe, telefone, fotografia) VALUES (?, ?, ?, ?, ?, ?)';
        const [result] = await db.execute(sql, [primeiro_nome, ultimo_nome, email, palavra_passe, telefone || '', foto_url]);
        return result.insertId;
    },

    // READ: Encontra um barbeiro por ID
    findById: async (id) => {
        const [rows] = await db.execute(
            'SELECT id, primeiro_nome, ultimo_nome, CONCAT(primeiro_nome, " ", ultimo_nome) AS nome, email, telefone, fotografia AS foto_url FROM barbeiros WHERE id = ?', 
            [id]
        );
        return rows[0];
    },
    
    // READ: Encontra um barbeiro por Email (para login)
    findByEmail: async (email) => {
        const [rows] = await db.execute('SELECT * FROM barbeiros WHERE email = ?', [email]);
        return rows[0];
    },

    // READ: Lista todos os barbeiros
    findAll: async () => {
        const [rows] = await db.execute(
            'SELECT id, CONCAT(primeiro_nome, " ", ultimo_nome) AS nome, fotografia AS foto_url FROM barbeiros ORDER BY primeiro_nome'
        );
        return rows;
    },

    // UPDATE: Atualiza os dados do barbeiro
    update: async (id, primeiro_nome, ultimo_nome, email, telefone, foto_url) => {
        let sql = 'UPDATE barbeiros SET primeiro_nome = ?, ultimo_nome = ?, email = ?, telefone = ?';
        let params = [primeiro_nome, ultimo_nome, email, telefone || ''];
        
        if (foto_url !== undefined) {
            sql += ', fotografia = ?';
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