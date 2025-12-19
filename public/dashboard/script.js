document.addEventListener('DOMContentLoaded', () => {
    // --- Referências DOM ---
    const mainHeader = document.getElementById('main-header');
    const mainContent = document.getElementById('main-content');
    const navButtons = document.querySelectorAll('.nav-btn');
    const bookCards = document.querySelectorAll('.book-card');
    
    // Selecionar o botão de multas de forma mais robusta
    let totalFinesElement = null;
    navButtons.forEach(btn => {
        if (btn.textContent.includes('Multas')) {
            totalFinesElement = btn;
        }
    });
    
    const finesSection = document.querySelector('#fines-section p');

    // Estado Simulado do Utilizador
    let totalFines = 12.50;
    let renewals = {};
    let reservationQueues = {};

    // --- Funções de Navegação e Estado ---

    /**
     * Mostra uma secção específica e esconde TODAS as outras.
     * @param {string} sectionId - O ID da secção a mostrar.
     */
    function showSection(sectionId) {
        console.log('Mostrando secção:', sectionId); // Debug
        
        // Esconder todas as secções
        document.querySelectorAll('#main-content > section').forEach(section => {
            section.style.display = 'none';
        });
        
        // Mostrar apenas a secção selecionada
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.style.display = 'block';
            console.log('Secção encontrada e mostrada:', sectionId); // Debug
        } else {
            console.error('Secção não encontrada:', sectionId); // Debug
        }

        // Remover classe active de todos os botões
        navButtons.forEach(btn => {
            btn.classList.remove('active');
        });

        // Adicionar classe active ao botão correspondente
        navButtons.forEach(btn => {
            const text = btn.textContent.trim();
            const shouldBeActive = 
                (sectionId === 'loans-section' && (text.includes('Dashboard') || text.includes('Início'))) ||
                (sectionId === 'search-section' && text.includes('Pesquisar')) ||
                (sectionId === 'favorites-section' && text.includes('Favoritos')) ||
                (sectionId === 'fines-section' && text.includes('Multas'));
            
            if (shouldBeActive) {
                btn.classList.add('active');
            }
        });
    }

    /**
     * Atualiza o valor das multas no cabeçalho e na secção de multas.
     */
    function updateFinesDisplay() {
        if (totalFinesElement) {
            totalFinesElement.innerHTML = `<i class="fas fa-bell"></i> Multas (${totalFines.toFixed(2)} €)`;
        }
        if (finesSection) {
            finesSection.textContent = `Valor Total Pendente: ${totalFines.toFixed(2)} €`;
        }
    }

    // --- Listeners de Eventos ---

    // Tratamento da Navegação
    navButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const text = button.textContent.trim();
            
            console.log('Botão clicado:', text); // Debug
            
            if (text.includes('Dashboard') || text.includes('Início')) {
                showSection('loans-section');
            } else if (text.includes('Pesquisar')) {
                showSection('search-section');
            } else if (text.includes('Favoritos')) {
                showSection('favorites-section');
            } else if (text.includes('Multas')) {
                showSection('fines-section');
            } else if (text.includes('Sair')) {
                if (confirm('Tem a certeza que deseja sair?')) {
                    window.location.href = '/';
                }
            }
        });
    });

    // Tratamento de Ações nos Cartões de Livro
    bookCards.forEach(card => {
        const titleElement = card.querySelector('h3');
        if (!titleElement) return;
        
        const title = titleElement.textContent;
        const favButton = card.querySelector('.favorite-btn');
        const primaryButton = card.querySelector('.btn.primary');

        // Toggle Favorito
        if (favButton) {
            favButton.addEventListener('click', () => {
                const isFav = favButton.classList.toggle('favorited');
                favButton.innerHTML = isFav 
                    ? '<i class="fas fa-heart"></i> Remover dos Favoritos' 
                    : '<i class="fas fa-heart"></i> Adicionar aos Favoritos';
                alert(isFav ? `${title} adicionado aos Favoritos!` : `${title} removido dos Favoritos!`);
            });
        }

        // Requisição/Reserva
        if (primaryButton) {
            primaryButton.addEventListener('click', () => {
                if (primaryButton.classList.contains('reserve-btn')) {
                    const queuePos = (reservationQueues[title] || 2) + 1;
                    reservationQueues[title] = queuePos;
                    alert(`Reserva criada para ${title}. Posição na fila: ${queuePos}.`);
                    primaryButton.innerHTML = `<i class="fas fa-clock"></i> Reservar (Posição na Fila: ${queuePos})`;
                } else if (primaryButton.classList.contains('request-btn')) {
                    alert(`Livro "${title}" requisitado com sucesso!`);
                }
            });
        }
    });

    // Tratamento de Devolução e Renovação de Livro
    document.querySelectorAll('.loan-item').forEach(loanItem => {
        const titleElement = loanItem.querySelector('h3');
        if (!titleElement) return;
        
        const title = titleElement.textContent;
        const returnBtn = loanItem.querySelector('.return-btn');
        const renewBtn = loanItem.querySelector('.renew-btn');

        if (returnBtn) {
            returnBtn.addEventListener('click', () => {
                const fineText = loanItem.querySelector('.fine-status').textContent;
                const fineMatch = fineText.match(/(\d+[,.]?\d*)/);
                const fineValue = fineMatch ? parseFloat(fineMatch[0].replace(',', '.')) : 0;
                
                if (fineValue > 0) {
                    alert(`Livro devolvido. Multa de ${fineValue.toFixed(2)} € adicionada.`);
                    totalFines += fineValue;
                    updateFinesDisplay();
                } else {
                    alert('Livro devolvido sem multas.');
                }
                loanItem.remove();
            });
        }

        if (renewBtn) {
            renewBtn.addEventListener('click', () => {
                const renewCount = renewals[title] || 0;
                if (renewCount < 1 && !reservationQueues[title]) {
                    renewals[title] = 1;
                    alert(`Empréstimo de "${title}" renovado com sucesso! Nova data: 15/01/2026.`);
                    renewBtn.remove();
                } else if (reservationQueues[title]) {
                    alert('Não pode renovar: Há reservas pendentes.');
                } else {
                    alert('Já renovou este empréstimo o máximo permitido (1 vez).');
                }
            });
        }
    });

    // Pagamento de Multas
    const payFinesBtn = document.querySelector('.pay-btn');
    if (payFinesBtn) {
        payFinesBtn.addEventListener('click', () => {
            if (totalFines > 0) {
                alert(`Pagamento de ${totalFines.toFixed(2)} € processado. Multas pagas!`);
                totalFines = 0;
                updateFinesDisplay();
                document.querySelectorAll('.fine-status').forEach(el => {
                    el.textContent = 'Multa: 0,00 € (Paga)';
                });
                document.querySelectorAll('.fine-item').forEach(item => {
                    item.style.opacity = '0.5';
                    item.style.textDecoration = 'line-through';
                });
            } else {
                alert('Não tem multas pendentes.');
            }
        });
    }

    // Inicialização - Mostrar dashboard por padrão
    showSection('loans-section');
    updateFinesDisplay();
});