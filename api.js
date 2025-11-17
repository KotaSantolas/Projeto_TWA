const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req, res) => res.json({ message: 'Boas!' }));