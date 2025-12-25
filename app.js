// app.js (Atualizado para servir o dashboard em /dashboard, e raiz para login)
const UserBD = require('./OperadorBD/UserBD.js');
const path = require('path');
const express = require('express');
const app = express();
const port = 5001;

app.use(express.json()) // middleware

// Serve ficheiros estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// Rota principal: Login
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'authentication/login.html'));
});

app.post('/', async (req,res)=>{
    const {email,senha} = req.body
    const bdo = new UserBD();
    if (!email || !senha) {
    return res.status(400).json({ message: "Falta informação!" });
    }

   const existe = await bdo.VerificarUtilizador(email, senha);

    if (!existe) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    } else {
      return res.json({ message: "Login com sucesso!" });
    }
      

      
})
// Rota para Dashboard (página inicial após login)
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard/dashboard.html')); 
});

// Rota para Registo
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'authentication/register.html'));
});
app.post('/register', async (req, res) => {
  const nome = req.body.nome;
  const email = req.body.email;
  const senha = req.body.senha;
  const bdo = new UserBD();

  if (!nome || !email || !senha) {
    return res.status(400).json({ message: "Falta informação!" });
  }

  try {
    await bdo.InserirUser(nome, email, senha);
    return res.json({ message: "Utilizador criado!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro ao criar utilizador!" });
  }
});



// 404
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', '404.html'));
});

app.listen(port, () => {
    console.log(`App a decorrer na porta ${port}`);
});

