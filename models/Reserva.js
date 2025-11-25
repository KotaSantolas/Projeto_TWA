// ./models/Reserva.js

const db = require('../config/database');

const Reserva = {
    // Criação de tabelas
    createTable: async () => {
        const sql = `
            CREATE TABLE IF NOT EXISTS reservas (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                cliente_id INT UNSIGNED NOT NULL,
                barbeiro_id INT UNSIGNED NOT NULL,
                opcao_id INT UNSIGNED NOT NULL,
                data_hora DATETIME NOT NULL,
                estado ENUM('pendente', 'confirmada', 'concluída', 'cancelada', 'não_compareceu') DEFAULT 'pendente',
                observacoes TEXT,
                criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                
                FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
                FOREIGN KEY (barbeiro_id) REFERENCES barbeiros(id) ON DELETE RESTRICT,
                FOREIGN KEY (opcao_id) REFERENCES servicos(id) ON DELETE RESTRICT
            )
        `;
        await db.execute(sql);
        console.log('Tabela reservas pronta.');
    },

    // CREATE: Cria uma nova reserva
    create: async (cliente_id, barbeiro_id, opcao_id, data_hora, observacoes) => {
        const sql = 'INSERT INTO reservas (cliente_id, barbeiro_id, opcao_id, data_hora, observacoes) VALUES (?, ?, ?, ?, ?)';
        const [result] = await db.execute(sql, [cliente_id, barbeiro_id, opcao_id, data_hora, observacoes]);
        return result.insertId;
    },

    // READ: Encontra uma reserva por ID com todos os detalhes
    findById: async (id) => {
        const sql = `
            SELECT 
                r.id, r.data_hora, r.estado, r.observacoes, r.criado_em AS created_at, r.atualizado_em AS updated_at,
                r.cliente_id, r.barbeiro_id, r.opcao_id,
                CONCAT(c.primeiro_nome, ' ', c.ultimo_nome) AS cliente_nome, c.email AS cliente_email,
                CONCAT(b.primeiro_nome, ' ', b.ultimo_nome) AS barbeiro_nome, b.fotografia AS barbeiro_foto,
                s.nome_opcao AS servico_nome, s.duracao_min, s.preco
            FROM reservas r
            JOIN clientes c ON r.cliente_id = c.id
            JOIN barbeiros b ON r.barbeiro_id = b.id
            JOIN servicos s ON r.opcao_id = s.id
            WHERE r.id = ?
        `;
        const [rows] = await db.execute(sql, [id]);
        return rows[0];
    },

    // READ: Lista de reservas com filtros
    findAll: async (filter = {}) => {
        let sql = `
            SELECT 
                r.id, r.data_hora, r.estado,
                CONCAT(c.primeiro_nome, ' ', c.ultimo_nome) AS cliente_nome,
                CONCAT(b.primeiro_nome, ' ', b.ultimo_nome) AS barbeiro_nome,
                s.nome_opcao AS servico_nome
            FROM reservas r
            JOIN clientes c ON r.cliente_id = c.id
            JOIN barbeiros b ON r.barbeiro_id = b.id
            JOIN servicos s ON r.opcao_id = s.id
        `;
        
        const conditions = [];
        const params = [];

        if (filter.estado) {
            conditions.push('r.estado = ?');
            params.push(filter.estado);
        }
        if (filter.data) {
            conditions.push('DATE(r.data_hora) = ?');
            params.push(filter.data);
        }
        if (filter.barbeiro_id) {
            conditions.push('r.barbeiro_id = ?');
            params.push(filter.barbeiro_id);
        }
        if (filter.cliente_id) {
            conditions.push('r.cliente_id = ?');
            params.push(filter.cliente_id);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        sql += ' ORDER BY r.data_hora DESC';

        const [rows] = await db.execute(sql, params);
        return rows;
    },

    // UPDATE: Atualiza o estado ou dados da reserva
    update: async (id, data_hora, barbeiro_id, opcao_id, estado, observacoes) => {
        const sql = 'UPDATE reservas SET data_hora = ?, barbeiro_id = ?, opcao_id = ?, estado = ?, observacoes = ? WHERE id = ?';
        const [result] = await db.execute(sql, [data_hora, barbeiro_id, opcao_id, estado, observacoes, id]);
        return result.affectedRows;
    },

    // DELETE: Cancela/remove uma reserva
    delete: async (id) => {
        const [result] = await db.execute('DELETE FROM reservas WHERE id = ?', [id]);
        return result.affectedRows;
    },

    // Verifica a disponibilidade do barbeiro
    isAvailable: async (barbeiro_id, data_hora, duracao_min, exclude_id = null) => {
        const start_time = new Date(data_hora);
        const end_time = new Date(start_time.getTime() + duracao_min * 60000);

        let sql = `
            SELECT r.id
            FROM reservas r
            JOIN servicos s ON r.opcao_id = s.id
            WHERE 
                r.barbeiro_id = ? AND r.estado IN ('pendente', 'confirmada') AND
                (
                    (r.data_hora < ? AND DATE_ADD(r.data_hora, INTERVAL s.duracao_min MINUTE) > ?) OR
                    (? < DATE_ADD(r.data_hora, INTERVAL s.duracao_min MINUTE) AND ? > r.data_hora)
                )
        `;
        
        const params = [barbeiro_id, end_time, start_time, start_time, end_time];

        if (exclude_id) {
            sql += ' AND r.id != ?';
            params.push(exclude_id);
        }

        const [rows] = await db.execute(sql, params);
        return rows.length === 0;
    }
};

module.exports = Reserva;