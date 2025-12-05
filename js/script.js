document.addEventListener('DOMContentLoaded', () => {
    // --- Referências DOM ---
    const authSection = document.getElementById('auth-section');
    const mainHeader = document.getElementById('main-header');
    const mainContent = document.getElementById('main-content');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const logoutBtn = document.querySelector('.logout-btn');
    const navButtons = document.querySelectorAll('.nav-btn');
    const bookCards = document.querySelectorAll('.book-card');
    const totalFinesElement = document.querySelector('#main-header .nav-btn:nth-child(5)'); // Botão das Multas no Header
    const finesSection = document.querySelector('.fines-section p:nth-child(2)'); // Parágrafo do valor total na secção de Multas

    // Estado Simulado do Utilizador
    let isLoggedIn = false;
    let totalFines = 12.50; // Valor inicial de multa (exemplo do HTML)

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
            authSection.style.display = 'flex';
            mainHeader.style.display = 'none';
            mainContent.style.display = 'none';
        }
        updateFinesDisplay();
    }

    /**
     * Mostra uma secção específica e esconde as outras (simulando navegação).
     * @param {string} sectionId - O ID da secção a mostrar.
     */
    function showSection(sectionId) {
        document.querySelectorAll('#main-content section').forEach(section => {
            section.style.display = 'none';
        });
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.style.display = 'block';
        }

        // Atualizar o título do main-content
        if (sectionId === 'search-section') {
            document.getElementById('loans-section').style.display = 'block'; // Mostrar ambas no desktop, se for caso
            document.getElementById('loans-section').style.gridColumn = '1 / 2';
            document.getElementById('search-section').style.gridColumn = '2 / 3';
        } else {
            document.getElementById('search-section').style.display = 'block';
             // Simular a visualização de apenas uma grande secção no mobile
             if (window.innerWidth < 900) {
                document.getElementById('search-section').style.display = 'none';
             }
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

    // 1. Tratamento do Login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Simulação: Apenas verifica se os campos não estão vazios
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

    // 2. Tratamento do Registo
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Registo efetuado com sucesso! Por favor, inicie sessão.');
        // O registo bem-sucedido pode reencaminhar para o login
        registerForm.reset();
    });

    // 3. Tratamento do Logout
    logoutBtn.addEventListener('click', () => {
        isLoggedIn = false;
        updateViewState();
        alert('Sessão terminada.');
    });

    // 4. Tratamento da Navegação
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.textContent.includes('Dashboard') || button.textContent.includes('Empréstimos')) {
                showSection('loans-section');
            } else if (button.textContent.includes('Pesquisar Livros') || button.textContent.includes('Favoritos')) {
                // Para simplificar, direcionamos estes para a secção de pesquisa/livros
                showSection('search-section');
            } else if (button.textContent.includes('Sair')) {
                // O logout é tratado pelo listener do logoutBtn
                return;
            }
            // Adicionar uma classe de ativo (opcional)
        });
    });

    // 5. Tratamento de Ações nos Cartões de Livro
    bookCards.forEach(card => {
        const title = card.querySelector('h3').textContent;
        const favButton = card.querySelector('.fa-heart').parentElement;
        const primaryButton = card.querySelector('.book-info .actions .btn.primary');

        // Toggle Favorito
        favButton.addEventListener('click', () => {
            const isFav = favButton.classList.toggle('favorited');
            favButton.innerHTML = isFav 
                ? '<i class="fas fa-heart"></i> Remover dos Favoritos' 
                : '<i class="fas fa-heart"></i> Adicionar aos Favoritos';
            alert(isFav ? `${title} adicionado aos Favoritos!` : `${title} removido dos Favoritos!`);
        });

        // Requisição/Reserva
        primaryButton.addEventListener('click', () => {
            if (primaryButton.classList.contains('reserve-btn')) {
                alert(`Reserva criada para ${title}. Entrará na fila de espera.`);
            } else {
                alert(`Livro ${title} requisitado com sucesso!`);
                // Simulação: reduzir o número de cópias disponíveis e atualizar a lista de empréstimos (requer manipulação mais complexa do DOM ou um backend)
            }
        });
    });

    // 6. Tratamento da Devolução de Livro (Exemplo simples)
    document.querySelectorAll('.loan-item .actions .btn.secondary').forEach(devBtn => {
        if (devBtn.textContent.includes('Devolver')) {
            devBtn.addEventListener('click', (e) => {
                const loanItem = e.target.closest('.loan-item');
                const fineText = loanItem.querySelector('.fine-status').textContent;

                if (fineText.includes('€') && parseFloat(fineText.match(/(\d+\,?\d*)/)[0].replace(',', '.')) > 0) {
                    alert('Livro devolvido. Multa pendente de 12,50 € adicionada à sua conta.');
                } else {
                    alert('Livro devolvido sem multas.');
                }
                loanItem.remove(); // Remove o item da lista
                // Nota: O cálculo e atualização da multa total precisa ser feito aqui
            });
        }
    });

    // 7. Pagamento de Multas
    const payFinesBtn = document.querySelector('.fines-section .btn.primary');
    if (payFinesBtn) {
        payFinesBtn.addEventListener('click', () => {
            if (totalFines > 0) {
                alert(`A processar o pagamento de ${totalFines.toFixed(2)} €. Multas pagas com sucesso!`);
                totalFines = 0;
                updateFinesDisplay();
                document.querySelector('.loan-item.overdue .fine-status').textContent = 'Multa: 0,00 € (Paga)';
            } else {
                alert('Não tem multas pendentes.');
            }
        });
    }

    // Inicialização do estado
    updateViewState();
});