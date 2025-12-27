const UserBD = require('./OperadorBD/UserBD.js');
const LivroBD = require('./OperadorBD/LivroBD.js');
const FavoritoBD = require('./OperadorBD/FavoritoBD.js');
const EmprestimoBD = require('./OperadorBD/EmprestimoBD.js');
const path = require('path');
const express = require('express');
const session = require('express-session');
const app = express();
const port = 5001;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configurar sessões
app.use(session({
    secret: 'biblioteca-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
        httpOnly: true
    }
}));

// Middleware para verificar autenticação
function verificarAutenticacao(req, res, next) {
    if (req.session && req.session.utilizadorId) {
        next();
    } else {
        res.status(401).json({ message: "Não autenticado. Faça login primeiro." });
    }
}

// Rota principal: Login
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'authentication/login.html'));
});

app.post('/', async (req, res) => {
    const {email, senha} = req.body;
    console.log('Tentativa de login:', { email }); // Debug
    
    const bdo = new UserBD();
    
    if (!email || !senha) {
        return res.status(400).json({ message: "Falta informação!" });
    }

    try {
        const utilizador = await bdo.VerificarUtilizador(email, senha);
        console.log('Utilizador encontrado:', utilizador); // Debug

        if (!utilizador) {
            return res.status(401).json({ message: "Credenciais inválidas" });
        } else {
            // Guardar dados do utilizador na sessão
            req.session.utilizadorId = utilizador.id_utilizador;
            req.session.utilizadorNome = utilizador.nome;
            req.session.utilizadorEmail = utilizador.email;
            
            console.log('Sessão criada:', req.session); // Debug
            
            return res.json({ 
                message: "Login com sucesso!",
                utilizador: {
                    id: utilizador.id_utilizador,
                    nome: utilizador.nome,
                    email: utilizador.email
                }
            });
        }
    } catch (err) {
        console.error('Erro no login:', err);
        return res.status(500).json({ message: "Erro ao fazer login!" });
    }
});

// Rota para Dashboard
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard/dashboard.html')); 
});

// Rota para obter dados do utilizador logado
app.get('/api/utilizador', verificarAutenticacao, (req, res) => {
    res.json({
        id: req.session.utilizadorId,
        nome: req.session.utilizadorNome,
        email: req.session.utilizadorEmail
    });
});

// Rota para Logout
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: "Erro ao fazer logout!" });
        }
        res.json({ message: "Logout com sucesso!" });
    });
});

// Rota para Registo
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'authentication/register.html'));
});

app.post('/register', async (req, res) => {
    const {nome, email, senha} = req.body;
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

// === ROTAS DE LIVROS ===

// Obter todos os livros
app.get('/api/livros', async (req, res) => {
    try {
        const livroBD = new LivroBD();
        const livros = await livroBD.obterLivros();
        res.json(livros);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao buscar livros!" });
    }
});

// Pesquisar livros
app.get('/api/livros/pesquisar', async (req, res) => {
    try {
        const termo = req.query.q || '';
        const livroBD = new LivroBD();
        const livros = await livroBD.pesquisarLivros(termo);
        res.json(livros);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao pesquisar livros!" });
    }
});

// Obter livro por ID
app.get('/api/livros/:id', async (req, res) => {
    try {
        const livroBD = new LivroBD();
        const livro = await livroBD.obterLivroPorId(req.params.id);
        if (livro) {
            res.json(livro);
        } else {
            res.status(404).json({ message: "Livro não encontrado!" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao buscar livro!" });
    }
});

// === ROTAS DE FAVORITOS ===

// Obter favoritos do utilizador logado
app.get('/api/favoritos', verificarAutenticacao, async (req, res) => {
    try {
        const favoritoBD = new FavoritoBD();
        const favoritos = await favoritoBD.obterFavoritos(req.session.utilizadorId);
        res.json(favoritos);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao buscar favoritos!" });
    }
});

// Adicionar livro aos favoritos
app.post('/api/favoritos', verificarAutenticacao, async (req, res) => {
    try {
        const { livro_id } = req.body;
        
        if (!livro_id) {
            return res.status(400).json({ message: "ID do livro é obrigatório!" });
        }

        const favoritoBD = new FavoritoBD();
        
        // Verificar se já está nos favoritos
        const jaExiste = await favoritoBD.verificarFavorito(req.session.utilizadorId, livro_id);
        
        if (jaExiste) {
            return res.status(400).json({ message: "Livro já está nos favoritos!" });
        }

        await favoritoBD.adicionarFavorito(req.session.utilizadorId, livro_id);
        res.json({ message: "Livro adicionado aos favoritos com sucesso!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao adicionar favorito!" });
    }
});

// Remover livro dos favoritos
app.delete('/api/favoritos/:livro_id', verificarAutenticacao, async (req, res) => {
    try {
        const { livro_id } = req.params;
        const favoritoBD = new FavoritoBD();
        
        await favoritoBD.removerFavorito(req.session.utilizadorId, livro_id);
        res.json({ message: "Livro removido dos favoritos com sucesso!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao remover favorito!" });
    }
});

// Verificar se um livro está nos favoritos
app.get('/api/favoritos/verificar/:livro_id', verificarAutenticacao, async (req, res) => {
    try {
        const { livro_id } = req.params;
        const favoritoBD = new FavoritoBD();
        
        const existe = await favoritoBD.verificarFavorito(req.session.utilizadorId, livro_id);
        res.json({ favorito: existe });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao verificar favorito!" });
    }
});

// === ROTAS DE EMPRÉSTIMOS ===

// Obter empréstimos ativos do utilizador
app.get('/api/emprestimos', verificarAutenticacao, async (req, res) => {
    try {
        const emprestimoBD = new EmprestimoBD();
        const emprestimos = await emprestimoBD.obterEmprestimosAtivos(req.session.utilizadorId);
        
        // Calcular multas para cada empréstimo
        for (let emprestimo of emprestimos) {
            if (emprestimo.dias_atraso > 0) {
                const multa = emprestimo.dias_atraso * 2.50; // 2,50€ por dia
                emprestimo.multa_calculada = multa;
            }
        }
        
        res.json(emprestimos);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao buscar empréstimos!" });
    }
});

// Criar novo empréstimo (requisitar livro)
app.post('/api/emprestimos', verificarAutenticacao, async (req, res) => {
    try {
        const { livro_id } = req.body;
        
        if (!livro_id) {
            return res.status(400).json({ message: "ID do livro é obrigatório!" });
        }

        const emprestimoBD = new EmprestimoBD();
        const livroBD = new LivroBD();

        // Verificar se já tem empréstimo ativo deste livro
        const jaEmprestado = await emprestimoBD.verificarEmprestimoExistente(
            req.session.utilizadorId, 
            livro_id
        );

        if (jaEmprestado) {
            return res.status(400).json({ message: "Você já tem um empréstimo ativo deste livro!" });
        }

        // Verificar se há cópias disponíveis
        const livro = await livroBD.obterLivroPorId(livro_id);
        if (!livro || livro.copias_disponiveis <= 0) {
            return res.status(400).json({ message: "Não há cópias disponíveis deste livro!" });
        }

        // Decrementar cópias disponíveis
        await livroBD.decrementarCopias(livro_id);

        // Criar empréstimo
        await emprestimoBD.criarEmprestimo(req.session.utilizadorId, livro_id);

        res.json({ message: "Livro requisitado com sucesso!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao requisitar livro!" });
    }
});

// Devolver livro
app.post('/api/emprestimos/:id/devolver', verificarAutenticacao, async (req, res) => {
    try {
        const emprestimoId = req.params.id;
        const emprestimoBD = new EmprestimoBD();
        const livroBD = new LivroBD();

        // Calcular multa
        const multa = await emprestimoBD.calcularMulta(emprestimoId);

        // Atualizar multa no empréstimo
        if (multa > 0) {
            await emprestimoBD.atualizarMulta(emprestimoId, multa);
        }

        // Obter informações do empréstimo antes de devolver
        const emprestimos = await emprestimoBD.obterEmprestimosAtivos(req.session.utilizadorId);
        const emprestimo = emprestimos.find(e => e.id == emprestimoId);

        if (!emprestimo) {
            return res.status(404).json({ message: "Empréstimo não encontrado!" });
        }

        // Devolver livro
        await emprestimoBD.devolverLivro(emprestimoId, req.session.utilizadorId);

        // Incrementar cópias disponíveis
        await livroBD.incrementarCopias(emprestimo.id_livro);

        res.json({ 
            message: "Livro devolvido com sucesso!",
            multa: multa
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao devolver livro!" });
    }
});

// Renovar empréstimo
app.post('/api/emprestimos/:id/renovar', verificarAutenticacao, async (req, res) => {
    try {
        const emprestimoId = req.params.id;
        const emprestimoBD = new EmprestimoBD();

        await emprestimoBD.renovarEmprestimo(emprestimoId, req.session.utilizadorId);

        res.json({ message: "Empréstimo renovado com sucesso! Nova data: +7 dias" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao renovar empréstimo!" });
    }
});

// 404
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', '404.html'));
});

app.listen(port, () => {
    console.log(`App a decorrer na porta ${port}`);
});