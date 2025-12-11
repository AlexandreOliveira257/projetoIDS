const PATH = require('path')
const express = require('express')
const APP = express()
const PORT = 5001

// Serve todos os ficheiros estáticos da pasta public (HTML, CSS, JS, imagens...)
APP.use(express.static(PATH.join(__dirname, 'public')));

// Rota principal – agora não precisas de sendFile!
APP.get('/', (req, res) => {
    res.sendFile(PATH.join(__dirname, 'public', 'authentication/login.html'));
});

APP.listen(PORT, () => {
    console.log("App a decorrer na porta 5001");
});