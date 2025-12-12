document.addEventListener('DOMContentLoaded', () => {
    // --- Referências DOM ---
    const authSection = document.getElementById('auth-section');
    const mainHeader = document.getElementById('main-header');
    const mainContent = document.getElementById('main-content');
    const loginForm = document.getElementById('login-form'); // Assumindo que pode ser incluído se necessário
    const registerForm = document.getElementById('register-form'); // Similar
    const logoutBtn = document.getElementsByClassName('logout-btn')[0];
    const navButtons = document.querySelectorAll('.nav-btn');
    const bookCards = document.querySelectorAll('.book-card');
    const totalFinesElement = document.querySelector('#main-header .nav-btn:nth-child(4)'); // Ajustado para Multas
    const finesSection = document.querySelector('#fines-section p:nth-child(2)'); // Valor total em Multas

    /*
logoutBtn = document.getElementsByClassName("logout-btn")[0]

logoutBtn.addEventListener("click", () =>{
        window.location.href = '/';

})
    */
    // Estado Simulado do Utilizador
    let isLoggedIn = false;
    let totalFines = 12.50; // Valor inicial
    let renewals = {}; // Rastrear renovações por livro (ex: { 'O Grande Gatsby': 0 })
    let reservationQueues = {}; // Filas de reserva por livro (ex: { 'Harry Potter...': 2 })

    // --- Funções de Navegação e Estado ---

    /**
     * Atualiza a visibilidade das secções consoante o estado de login.
     */
    function updateViewState() {
        if (isLoggedIn) {
            document.title = "Sistema Bibliotecário | Dashboard";
            authSection.style.display = 'none';
            mainHeader.style.display = 'flex';
            mainContent.style.display = 'grid';
            showSection('loans-section'); // Mostrar empréstimos por padrão
        } else {
            document.title = "Sistema Bibliotecário | Login";
            authSection.style.display = 'none';
            mainHeader.style.display = 'none';
            mainContent.style.display = 'none';
        }
        updateFinesDisplay();
    }

    /**
     * Mostra uma secção específica e esconde as outras.
     * @param {string} sectionId - O ID da secção a mostrar.
     */
    function showSection(sectionId) {
        document.querySelectorAll('#main-content > section').forEach(section => {
            section.style.display = 'none';
        });
        document.getElementById(sectionId).style.display = 'block';

        // Lógica para layout desktop/mobile
        if (sectionId === 'search-section' && window.innerWidth >= 900) {
            document.getElementById('loans-section').style.display = 'block';
            document.getElementById('loans-section').style.gridColumn = '1 / 2';
            document.getElementById('search-section').style.gridColumn = '2 / 3';
        }
    }

    /**
     * Atualiza o valor das multas no cabeçalho e na secção de multas.
     */
    function updateFinesDisplay() {
        totalFinesElement.innerHTML = `<i class="fas fa-bell"></i> Multas (${totalFines.toFixed(2)} €)`;
        finesSection.textContent = `Valor Total Pendente: ${totalFines.toFixed(2)} €`;
    }

    // --- Listeners de Eventos ---

    // 1. Tratamento do Login (se incluído na página; senão, use rotas)
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            if (email && password) {
                alert(`A iniciar sessão com ${email}...`);
                isLoggedIn = true;
                updateViewState();
            } else {
                alert('Por favor, preencha todos os campos.');
            }
        });
    }

    // 2. Tratamento do Registo (similar)
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Registo efetuado com sucesso! Por favor, inicie sessão.');
            registerForm.reset();
        });
    }

    // 3. Tratamento do Logout
    logoutBtn.addEventListener('click', () => {
        isLoggedIn = false;
        updateViewState();
        console.log("TESTE")
        alert('Sessão terminada.');
    });

    // 4. Tratamento da Navegação
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const text = button.textContent;
            if (text.includes('Dashboard') || text.includes('Empréstimos')) {
                showSection('loans-section');
            } else if (text.includes('Pesquisar Livros')) {
                showSection('search-section');
            } else if (text.includes('Favoritos')) {
                showSection('favorites-section');
            } else if (text.includes('Multas')) {
                showSection('fines-section');
            } else if (text.includes('Sair')) {
                return;
            }
        });
    });

    // 5. Tratamento de Ações nos Cartões de Livro
    bookCards.forEach(card => {
        const title = card.querySelector('h3').textContent;
        const favButton = card.querySelector('.favorite-btn');
        const primaryButton = card.querySelector('.btn.primary');

        // Toggle Favorito
        favButton.addEventListener('click', () => {
            const isFav = favButton.classList.toggle('favorited');
            favButton.innerHTML = isFav 
                ? '<i class="fas fa-heart"></i> Remover dos Favoritos' 
                : '<i class="fas fa-heart"></i> Adicionar aos Favoritos';
            alert(isFav ? `${title} adicionado aos Favoritos!` : `${title} removido dos Favoritos!`);
            // Adicionar/remover da secção de favoritos (simulado)
        });

        // Requisição/Reserva
        primaryButton.addEventListener('click', () => {
            if (primaryButton.classList.contains('reserve-btn')) {
                const queuePos = (reservationQueues[title] || 0) + 1;
                reservationQueues[title] = queuePos;
                alert(`Reserva criada para ${title}. Posição na fila: ${queuePos}.`);
                primaryButton.innerHTML = `<i class="fas fa-clock"></i> Reservar (Posição na Fila: ${queuePos})`;
            } else {
                alert(`Livro ${title} requisitado com sucesso!`);
                // Simular atualização de disponibilidade
            }
        });
    });

    // 6. Tratamento de Devolução e Renovação de Livro
    document.querySelectorAll('.loan-item .actions .btn').forEach(btn => {
        const loanItem = btn.closest('.loan-item');
        const title = loanItem.querySelector('h3').textContent;

        if (btn.classList.contains('return-btn')) {
            btn.addEventListener('click', () => {
                const fineText = loanItem.querySelector('.fine-status').textContent;
                const fineValue = parseFloat(fineText.match(/(\d+\,?\d*)/)?.[0].replace(',', '.') || 0);
                if (fineValue > 0) {
                    alert(`Livro devolvido. Multa de ${fineValue.toFixed(2)} € adicionada.`);
                    totalFines += fineValue;
                    updateFinesDisplay();
                } else {
                    alert('Livro devolvido sem multas.');
                }
                loanItem.remove();
            });
        } else if (btn.classList.contains('renew-btn')) {
            btn.addEventListener('click', () => {
                const renewCount = renewals[title] || 0;
                if (renewCount < 1 && !reservationQueues[title]) {
                    renewals[title] = 1;
                    alert(`Empréstimo de ${title} renovado com sucesso! Nova data: 15/01/2026.`);
                    btn.remove(); // Remover botão após renovação única
                } else if (reservationQueues[title]) {
                    alert('Não pode renovar: Há reservas pendentes.');
                } else {
                    alert('Já renovou este empréstimo o máximo permitido (1 vez).');
                }
            });
        }
    });

    // 7. Pagamento de Multas
    const payFinesBtn = document.querySelector('.pay-btn');
    if (payFinesBtn) {
        payFinesBtn.addEventListener('click', () => {
            if (totalFines > 0) {
                alert(`Pagamento de ${totalFines.toFixed(2)} € processado. Multas pagas!`);
                totalFines = 0;
                updateFinesDisplay();
                document.querySelectorAll('.fine-status').forEach(el => el.textContent = 'Multa: 0,00 € (Paga)');
            } else {
                alert('Não tem multas pendentes.');
            }
        });
    }

    // Inicialização do estado
    updateViewState();
});