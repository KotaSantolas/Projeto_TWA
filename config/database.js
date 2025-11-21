require('dotenv').config();
const mysql = require('mysql2');

// Configuração do pool de conexões
const pool = mysql.createPool({
    host:'localhost',
    user:'root',
    database:'barbeiro',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise(); // Usar promises para async/await

console.log('Pool de conexões MySQL criado.');

module.exports = pool;