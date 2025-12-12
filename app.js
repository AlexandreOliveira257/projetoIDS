// app.js (Atualizado para servir o dashboard em /dashboard, e raiz para login)

const path = require('path');
const express = require('express');
const app = express();
const port = 5001;

// Serve ficheiros estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// Rota principal: Login
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'authentication/login.html'));
});

// Rota para Dashboard (página inicial após login)
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard/dashboard.html')); 
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'authentication/login.html'));
});
// Rota para Registo
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'authentication/register.html'));
});

// 404
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', '404.html'));
});

app.listen(port, () => {
    console.log(`App a decorrer na porta ${port}`);
});

