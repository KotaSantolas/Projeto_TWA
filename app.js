// ./app.js

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// Carrega variáveis de ambiente
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Configuração da View Engine (Pug)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Servir arquivos estáticos (CSS, JS, Imagens)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads'))); // Acesso direto às fotos

// Importar Modelos para garantir a criação das tabelas (apenas para o exemplo)
const Cliente = require('./models/cliente');
const Barbeiro = require('./models/barbeiro');
const Servico = require('./models/servico');
const Reserva = require('./models/Reserva');

// Função para inicializar o DB
async function initializeDatabase() {
    try {
        await Cliente.createTable();
        await Barbeiro.createTable();
        await Servico.createTable();
        await Reserva.createTable();
        console.log('Todas as tabelas foram verificadas/criadas.');
    } catch (error) {
        console.error('Erro na inicialização da Base de Dados:', error);
        // Pode optar por sair da aplicação se a BD for crítica
        // process.exit(1); 
    }
}

// Inicializa o DB antes de configurar as rotas
initializeDatabase();

// ---------------------- ROTAS ----------------------
// Rotas de entidades
const clientesRouter = require('./routes/clientes');
const barbeirosRouter = require('./routes/barbeiros');
// Importar e configurar rotas para Servicos e Reservas de forma semelhante

// Rota Home/Dashboard
app.get('/', (req, res) => {
    res.render('index', { title: 'Dashboard - Gestão Barbearia' });
});

// Usar Rotas
app.use('/clientes', clientesRouter);
app.use('/barbeiros', barbeirosRouter);
// app.use('/servicos', servicosRouter); 
// app.use('/reservas', reservasRouter);

// Handler de Erro 404
app.use((req, res, next) => {
    res.status(404).render('error', { message: 'Página não encontrada' });
});

// Inicia o Servidor
app.listen(port, () => {
    console.log(`Servidor a correr em http://localhost:${port}`);
});