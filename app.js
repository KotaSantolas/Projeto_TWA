const express = require('express');
const session = require('express-session');
const path = require('path');
const dotenv = require('dotenv');

// Carrega variáveis de ambiente
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Configuração da View Engine (Pug)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuração de Sessões
app.use(session({
    secret: process.env.SESSION_SECRET || 'segredo-super-secreto-muda-isto',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 24 horas
    }
}));

// Middleware para disponibilizar user em todas as views
const { loadUser } = require('./middleware/auth');
app.use(loadUser);

// Servir arquivos estáticos (CSS, JS, Imagens)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Importar Modelos para garantir a criação das tabelas
const Cliente = require('./models/Cliente');
const Barbeiro = require('./models/Barbeiro');
const Servico = require('./models/Servico');
const Reserva = require('./models/Reserva');

// Função para inicializar o DB
async function initializeDatabase() {
    try {
        await Cliente.createTable();
        await Barbeiro.createTable();
        await Servico.createTable();
        await Reserva.createTable();
        console.log('✓ Todas as tabelas foram verificadas/criadas.');
    } catch (error) {
        console.error('✗ Erro na inicialização da Base de Dados:', error);
    }
}

// Inicializa o DB
initializeDatabase();

// Rotas

// Importar rotas
const authRouter = require('./routes/auth');
const clientesRouter = require('./routes/clientes');
const barbeirosRouter = require('./routes/barbeiros');
const servicosRouter = require('./routes/servicos');
const reservasRouter = require('./routes/reservas');

// Rota Home/Dashboard (requer autenticação)
const { requireAuth } = require('./middleware/auth');
app.get('/', requireAuth, (req, res) => {
    res.render('index', { 
        title: 'Dashboard - Gestão Barbearia'
    });
});

// Usar Rotas
app.use('/auth', authRouter);
app.use('/clientes', clientesRouter);
app.use('/barbeiros', barbeirosRouter);
app.use('/servicos', servicosRouter);
app.use('/reservas', reservasRouter);

// Handler de Erro 404
app.use((req, res) => {
    res.status(404).render('error', { 
        message: 'Página não encontrada',
        error: { status: 404 }
    });
});

// Handler de Erros Gerais
app.use((err, req, res, next) => {
    console.error('Erro:', err);
    res.status(err.status || 500).render('error', { 
        message: err.message || 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Inicia o Servidor
app.listen(port, () => {
    console.log(`\nServidor a correr em http://localhost:${port}`);
    console.log(`Login em http://localhost:${port}/auth/login\n`);
});