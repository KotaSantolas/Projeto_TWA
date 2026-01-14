# 🪒 Sistema de Gestão de Barbearia

## 📖 Sobre o Projeto

Sistema web desenvolvido para a disciplina de **Tecnologias Web Avançadas** que permite a gestão completa de uma barbearia, incluindo:

- Gestão de clientes e barbeiros
- Catálogo de serviços
- Sistema de reservas com validação de horários
- Autenticação segura com diferentes permissões
- Interface moderna e responsiva

### 🎯 Objetivos

- Implementar arquitetura **MVC** (Model-View-Controller)
- Aplicar boas práticas de segurança (bcrypt, prepared statements)
- Desenvolver interface responsiva e intuitiva
- Criar sistema de autenticação robusto

---

## ✨ Funcionalidades

### 👨‍💼 Barbeiros (Administradores)
- ✅ Gestão completa de clientes (CRUD)
- ✅ Gestão de barbeiros com upload de fotos
- ✅ Gestão de serviços (nome, preço, duração)
- ✅ Gestão de reservas (criar, editar, eliminar, confirmar)
- ✅ Dashboard com estatísticas
- ✅ Filtros por barbeiro e data

### 👤 Clientes
- ✅ Registo e login seguro
- ✅ Visualizar serviços disponíveis
- ✅ Criar reservas (validação de horários)
- ✅ Consultar e gerir suas próprias reservas
- ✅ Ver histórico de reservas

### 🔐 Sistema de Reservas
- ✅ Horário de funcionamento: 9h às 19h
- ✅ Intervalos de 30 minutos
- ✅ Validação de conflitos (mesmo barbeiro/horário)
- ✅ Estados: Pendente → Confirmada → Concluída
- ✅ Verificação de reservas passadas

---

## 🛠️ Tecnologias

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MySQL** - Base de dados relacional
- **mysql2** - Driver MySQL com promises
- **bcrypt** - Hash de passwords
- **express-session** - Gestão de sessões
- **multer** - Upload de ficheiros

### Frontend
- **Pug** - Template engine
- **CSS3** - Estilização
- **JavaScript** - Interatividade
- **Font Awesome** - Ícones

### Segurança
- **bcrypt** - Hash de passwords (salt rounds: 10)
- **Prepared Statements** - Proteção contra SQL Injection
- **express-session** - Sessões seguras
- **Middleware de autenticação** - Controlo de acesso

---

## 📦 Pré-requisitos

Antes de começar, certifique-se que tem instalado:

- **Node.js** (v14 ou superior)
- **npm** (v6 ou superior)
- **MySQL** (v8.0 ou superior)
- **Git** (opcional)

### Verificar versões:

```bash
node --version
npm --version
mysql --version
```

---

## 🚀 Instalação

### 1️⃣ Descarregar ZIP

### 2️⃣ Instalar dependências

```bash
npm install
```

Isto irá instalar:
- express
- mysql2
- pug
- bcrypt
- express-session
- multer
- dotenv

### 3️⃣ Criar a base de dados

Abre o MySQL Workbench ou terminal MySQL:

```sql
-- Criar base de dados
CREATE DATABASE barbeiro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Criar utilizador (opcional, para segurança)
CREATE USER 'barbeiro_user'@'localhost' IDENTIFIED BY 'senha_segura_aqui';
GRANT ALL PRIVILEGES ON barbeiro.* TO 'barbeiro_user'@'localhost';
FLUSH PRIVILEGES;
```

### 4️⃣ Configurar variáveis de ambiente

Cria um ficheiro `.env` na raiz do projeto:

```bash
# Copiar ficheiro de exemplo
cp .env.example .env
```

Edita o ficheiro `.env` com as suas configurações:

```env
# Configuração da Base de Dados
DB_HOST=localhost
DB_USER=barbeiro_user
DB_PASSWORD=senha_segura_aqui
DB_NAME=barbeiro
DB_PORT=3306

# Configuração do Servidor
PORT=3000
NODE_ENV=development

# Configuração de Sessão
SESSION_SECRET=gerar_uma_chave_aleatoria_longa_aqui
```

> **Nota:** Para gerar uma SESSION_SECRET segura, podes usar:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 5️⃣ Iniciar a aplicação

```bash
npm start
```

A aplicação estará disponível em: **http://localhost:3000**

---

## ⚙️ Configuração

### Upload de Ficheiros

Fotos dos barbeiros são guardadas em:
```
public/uploads/
```

Configuração de upload (multer):
- Tamanho máximo: **5MB**
- Formatos aceites: **JPG, JPEG, PNG**

---

## 💻 Utilização

### Aceder à aplicação

1. Abre o browser em: `http://localhost:3000`
2. Usa as credenciais de teste (ver secção abaixo)
3. Navega pelas diferentes funcionalidades

### Fluxo de Trabalho

#### Como Barbeiro:
1. **Login** → Dashboard
2. **Gerir Clientes** → Adicionar/Editar/Eliminar
3. **Gerir Serviços** → Definir preços e duração
4. **Gerir Reservas** → Confirmar/Completar reservas

#### Como Cliente:
1. **Registo** → Criar conta
2. **Login** → Ver serviços
3. **Criar Reserva** → Escolher barbeiro, serviço e horário
4. **Consultar Reservas** → Ver histórico

---

---

## 🔑 Credenciais de Teste

### Barbeiro (Administrador)
```
Email: jorgesilva@barbeiro.com
Password: barbeiro
```

### Cliente
```
Email: pedroaires@gmail.com
Password: 123456
```

---

## Resolução de Problemas

### Erro: "Cannot connect to MySQL"
```bash
# Verificar se MySQL está a correr
sudo systemctl status mysql

# Iniciar MySQL
sudo systemctl start mysql

# Verificar credenciais no .env
```

### Erro: "Port 3000 already in use"
```bash
# Alterar porta no .env
PORT=3001

# Ou matar processo na porta 3000
lsof -ti:3000 | xargs kill -9
```

### Erro: "Module not found"
```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Session secret not found"
```bash
# Adicionar SESSION_SECRET ao .env
echo "SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")" >> .env
```

---

## 📝 Scripts Disponíveis

```bash
# Iniciar servidor (produção)
npm start

# Iniciar com nodemon (desenvolvimento)
npm run dev
```

---