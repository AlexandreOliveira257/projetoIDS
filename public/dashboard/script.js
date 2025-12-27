document.addEventListener('DOMContentLoaded', () => {
    // --- Referências DOM ---
    const navButtons = document.querySelectorAll('.nav-btn');
    const searchInput = document.querySelector('.search-input');
    const bookGrid = document.querySelector('.book-grid');
    const favoritesSection = document.getElementById('favorites-section');
    const finesSection = document.getElementById('fines-section');
    const userNameElement = document.getElementById('user-name');
    
    let totalFinesElement = null;
    navButtons.forEach(btn => {
        if (btn.textContent.includes('Multas')) {
            totalFinesElement = btn;
        }
    });

    // Estado do Utilizador
    let utilizadorLogado = null;
    let totalFines = 0;
    let livrosData = [];
    let favoritosIds = new Set();
    let emprestimosData = [];
    let multasData = [];

    // --- Funções de Autenticação ---
    
    async function verificarAutenticacao() {
        try {
            const response = await fetch('/api/utilizador');
            if (response.ok) {
                utilizadorLogado = await response.json();
                console.log('Utilizador logado:', utilizadorLogado);
                
                // Atualizar o nome na interface
                if (userNameElement && utilizadorLogado.nome) {
                    userNameElement.textContent = utilizadorLogado.nome;
                }
                
                await carregarFavoritosIds();
            } else {
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Erro ao verificar autenticação:', error);
            window.location.href = '/';
        }
    }

    // --- Funções de Empréstimos ---
    
    async function carregarEmprestimos() {
        try {
            const response = await fetch('/api/emprestimos');
            if (!response.ok) throw new Error('Erro ao carregar empréstimos');
            
            emprestimosData = await response.json();
            
            // Separar empréstimos ativos e com multa
            const emprestimosAtivos = [];
            multasData = [];
            
            emprestimosData.forEach(emp => {
                const dataPrevista = new Date(emp.data_prevista);
                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0);
                dataPrevista.setHours(0, 0, 0, 0);
                
                const atrasado = dataPrevista < hoje;
                
                if (atrasado) {
                    // Calcular dias de atraso e multa
                    const diffTime = hoje - dataPrevista;
                    const diasAtraso = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    const multa = diasAtraso * 2.50;
                    
                    emp.dias_atraso = diasAtraso;
                    emp.multa_calculada = multa;
                    multasData.push(emp);
                } else {
                    emprestimosAtivos.push(emp);
                }
            });
            
            renderizarEmprestimos(emprestimosAtivos);
            renderizarMultas(multasData);
            atualizarTotalMultas();
        } catch (error) {
            console.error('Erro ao carregar empréstimos:', error);
        }
    }

    function renderizarEmprestimos(emprestimos) {
        const loanList = document.querySelector('.loan-list');
        
        if (!loanList) {
            console.error('Lista de empréstimos não encontrada');
            return;
        }

        if (emprestimos.length === 0) {
            loanList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-book-reader"></i>
                    <p>Você não tem empréstimos ativos.</p>
                    <p style="margin-top: 10px; font-size: 0.9em;">Vá para "Pesquisar Livros" para requisitar um livro!</p>
                </div>
            `;
            return;
        }

        loanList.innerHTML = emprestimos.map(emp => {
            const dataPrevista = new Date(emp.data_prevista);
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            dataPrevista.setHours(0, 0, 0, 0);
            
            const dataPrevistaFormatada = dataPrevista.toLocaleDateString('pt-PT');

            // Calcular dias restantes
            const diffTime = dataPrevista - hoje;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            let statusTexto = '';
            if (diffDays === 0) {
                statusTexto = '(Vence hoje!)';
            } else {
                statusTexto = `(${diffDays} dia${diffDays !== 1 ? 's' : ''} restante${diffDays !== 1 ? 's' : ''})`;
            }

            return `
                <div class="loan-item" data-emprestimo-id="${emp.id}">
                    <div class="book-info">
                        <h3>${emp.titulo}</h3>
                        <p>Autor: ${emp.autores || 'Desconhecido'}</p>
                        <p>Data de Devolução Prevista: ${dataPrevistaFormatada} ${statusTexto}</p>
                    </div>
                    <div class="actions">
                        <button class="btn primary renew-btn"><i class="fas fa-sync-alt"></i> Renovar (1x disponível)</button>
                        <button class="btn secondary return-btn"><i class="fas fa-undo"></i> Devolver</button>
                    </div>
                </div>
            `;
        }).join('');

        adicionarEventListenersEmprestimos();
    }

    function renderizarMultas(multas) {
        const finesList = finesSection.querySelector('.fines-list');
        
        if (!finesList) {
            console.error('Lista de multas não encontrada');
            return;
        }

        if (multas.length === 0) {
            finesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle"></i>
                    <p>Você não tem multas pendentes!</p>
                    <p style="margin-top: 10px; font-size: 0.9em; color: #16a34a;">Todos os seus livros estão em dia.</p>
                </div>
            `;
            
            // Esconder botão de pagar se não há multas
            const payBtn = finesSection.querySelector('.pay-btn');
            if (payBtn) payBtn.style.display = 'none';
            
            return;
        }

        // Mostrar botão de pagar
        const payBtn = finesSection.querySelector('.pay-btn');
        if (payBtn) payBtn.style.display = 'block';

        finesList.innerHTML = multas.map(emp => {
            const dataPrevista = new Date(emp.data_prevista);
            const dataPrevistaFormatada = dataPrevista.toLocaleDateString('pt-PT');

            return `
                <div class="fine-item" data-emprestimo-id="${emp.id}">
                    <div style="border-left: 4px solid #dc2626; padding-left: 15px;">
                        <h3 style="color: #dc2626; font-size: 1.2em; margin-bottom: 10px;">Livro: ${emp.titulo}</h3>
                        <p style="margin: 5px 0;">Autor: ${emp.autores || 'Desconhecido'}</p>
                        <p style="margin: 5px 0;">Data de Devolução: ${dataPrevistaFormatada}</p>
                        <p style="margin: 5px 0; font-weight: 600;">Motivo: Atraso de ${emp.dias_atraso} dia${emp.dias_atraso !== 1 ? 's' : ''}</p>
                        <p style="margin-top: 10px; color: #dc2626; font-weight: 700; font-size: 1.2em;">Valor: ${emp.multa_calculada.toFixed(2)} €</p>
                    </div>
                    <button class="btn secondary return-fine-btn" style="margin-top: 15px; width: 100%;">
                        <i class="fas fa-undo"></i> Devolver Livro (Multa será registrada)
                    </button>
                </div>
            `;
        }).join('');

        adicionarEventListenersMultas();
    }

    function adicionarEventListenersEmprestimos() {
        document.querySelectorAll('.loan-item').forEach(loanItem => {
            const emprestimoId = loanItem.dataset.emprestimoId;
            const returnBtn = loanItem.querySelector('.return-btn');
            const renewBtn = loanItem.querySelector('.renew-btn');

            // Devolver livro
            if (returnBtn) {
                returnBtn.addEventListener('click', async () => {
                    if (!confirm('Tem certeza que deseja devolver este livro?')) return;

                    try {
                        const response = await fetch(`/api/emprestimos/${emprestimoId}/devolver`, {
                            method: 'POST'
                        });

                        const data = await response.json();

                        if (response.ok) {
                            alert('Livro devolvido com sucesso!');
                            await carregarEmprestimos();
                        } else {
                            alert('Erro: ' + data.message);
                        }
                    } catch (error) {
                        console.error('Erro ao devolver livro:', error);
                        alert('Erro ao devolver livro. Tente novamente.');
                    }
                });
            }

            // Renovar empréstimo
            if (renewBtn) {
                renewBtn.addEventListener('click', async () => {
                    try {
                        const response = await fetch(`/api/emprestimos/${emprestimoId}/renovar`, {
                            method: 'POST'
                        });

                        const data = await response.json();

                        if (response.ok) {
                            alert(data.message);
                            await carregarEmprestimos();
                        } else {
                            alert('Erro: ' + data.message);
                        }
                    } catch (error) {
                        console.error('Erro ao renovar empréstimo:', error);
                        alert('Erro ao renovar empréstimo. Tente novamente.');
                    }
                });
            }
        });
    }

    function adicionarEventListenersMultas() {
        document.querySelectorAll('.fine-item').forEach(fineItem => {
            const emprestimoId = fineItem.dataset.emprestimoId;
            const returnBtn = fineItem.querySelector('.return-fine-btn');

            if (returnBtn) {
                returnBtn.addEventListener('click', async () => {
                    const emp = multasData.find(e => e.id == emprestimoId);
                    const multa = emp ? emp.multa_calculada : 0;

                    if (!confirm(`Ao devolver este livro, uma multa de ${multa.toFixed(2)} € será registrada. Deseja continuar?`)) return;

                    try {
                        const response = await fetch(`/api/emprestimos/${emprestimoId}/devolver`, {
                            method: 'POST'
                        });

                        const data = await response.json();

                        if (response.ok) {
                            alert(`Livro devolvido. Multa de ${data.multa.toFixed(2)} € registrada.`);
                            await carregarEmprestimos();
                        } else {
                            alert('Erro: ' + data.message);
                        }
                    } catch (error) {
                        console.error('Erro ao devolver livro:', error);
                        alert('Erro ao devolver livro. Tente novamente.');
                    }
                });
            }
        });
    }

    function atualizarTotalMultas() {
        totalFines = multasData.reduce((total, emp) => {
            return total + (emp.multa_calculada || 0);
        }, 0);
        
        updateFinesDisplay();
    }

    async function requisitarLivro(livroId, titulo) {
        try {
            const response = await fetch('/api/emprestimos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ livro_id: livroId })
            });

            const data = await response.json();

            if (response.ok) {
                alert(`"${titulo}" requisitado com sucesso! Devolução prevista para daqui a 7 dias.`);
                
                await carregarEmprestimos();
                await carregarLivros();
                showSection('loans-section');
                
                return true;
            } else {
                alert('Erro: ' + data.message);
                return false;
            }
        } catch (error) {
            console.error('Erro ao requisitar livro:', error);
            alert('Erro ao requisitar livro. Tente novamente.');
            return false;
        }
    }

    // --- Funções de Favoritos ---
    
    async function carregarFavoritosIds() {
        try {
            const response = await fetch('/api/favoritos');
            if (response.ok) {
                const favoritos = await response.json();
                favoritosIds = new Set(favoritos.map(f => f.id_livro));
            }
        } catch (error) {
            console.error('Erro ao carregar favoritos:', error);
        }
    }

    async function adicionarFavorito(livroId) {
        try {
            const response = await fetch('/api/favoritos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ livro_id: livroId })
            });

            const data = await response.json();

            if (response.ok) {
                favoritosIds.add(livroId);
                return { sucesso: true, mensagem: data.message };
            } else {
                return { sucesso: false, mensagem: data.message };
            }
        } catch (error) {
            console.error('Erro ao adicionar favorito:', error);
            return { sucesso: false, mensagem: 'Erro ao adicionar aos favoritos' };
        }
    }

    async function removerFavorito(livroId) {
        try {
            const response = await fetch(`/api/favoritos/${livroId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (response.ok) {
                favoritosIds.delete(livroId);
                return { sucesso: true, mensagem: data.message };
            } else {
                return { sucesso: false, mensagem: data.message };
            }
        } catch (error) {
            console.error('Erro ao remover favorito:', error);
            return { sucesso: false, mensagem: 'Erro ao remover dos favoritos' };
        }
    }

    async function carregarFavoritos() {
        try {
            const response = await fetch('/api/favoritos');
            if (!response.ok) throw new Error('Erro ao carregar favoritos');
            
            const favoritos = await response.json();
            renderizarFavoritos(favoritos);
        } catch (error) {
            console.error('Erro ao carregar favoritos:', error);
            const favGrid = favoritesSection.querySelector('.book-grid');
            if (favGrid) {
                favGrid.innerHTML = `
                    <div class="empty-state" style="grid-column: 1/-1;">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Erro ao carregar favoritos.</p>
                    </div>
                `;
            }
        }
    }

    function renderizarFavoritos(favoritos) {
        const favGrid = favoritesSection.querySelector('.book-grid');
        
        if (!favGrid) {
            console.error('Grid de favoritos não encontrado');
            return;
        }

        if (favoritos.length === 0) {
            favGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <i class="fas fa-heart-broken"></i>
                    <p>Você ainda não tem livros favoritos.</p>
                    <p style="margin-top: 10px; font-size: 0.9em;">Adicione livros aos favoritos na seção "Pesquisar Livros"!</p>
                </div>
            `;
            return;
        }

        favGrid.innerHTML = favoritos.map(livro => {
            const disponivel = livro.copias_disponiveis > 0;
            const imagemUrl = livro.capa_url_capa || 'https://via.placeholder.com/150?text=Sem+Imagem';
            const autores = livro.autores || 'Autor desconhecido';
            
            return `
                <div class="book-card" data-livro-id="${livro.id_livro}">
                    <img src="${imagemUrl}" alt="${livro.titulo}" onerror="this.src='https://via.placeholder.com/150?text=Sem+Imagem'">
                    <div class="book-info">
                        <h3>${livro.titulo}</h3>
                        <p>Autor: ${autores}</p>
                        <p>Disponível: ${livro.copias_disponiveis}/${livro.total_copias} cópias</p>
                        <div class="actions">
                            ${disponivel 
                                ? `<button class="btn primary request-btn"><i class="fas fa-book"></i> Requisitar</button>`
                                : `<button class="btn primary reserve-btn"><i class="fas fa-clock"></i> Reservar</button>`
                            }
                            <button class="btn secondary favorite-btn favorited">
                                <i class="fas fa-heart"></i> Remover dos Favoritos
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        adicionarEventListenersFavoritos();
    }

    function adicionarEventListenersFavoritos() {
        const cards = favoritesSection.querySelectorAll('.book-card');
        
        cards.forEach(card => {
            const livroId = parseInt(card.dataset.livroId);
            const title = card.querySelector('h3').textContent;
            const favButton = card.querySelector('.favorite-btn');
            const primaryButton = card.querySelector('.btn.primary');

            if (favButton) {
                favButton.addEventListener('click', async () => {
                    const resultado = await removerFavorito(livroId);
                    alert(resultado.mensagem);
                    
                    if (resultado.sucesso) {
                        card.remove();
                        
                        const remainingCards = favoritesSection.querySelectorAll('.book-card');
                        if (remainingCards.length === 0) {
                            renderizarFavoritos([]);
                        }
                    }
                });
            }

            if (primaryButton) {
                primaryButton.addEventListener('click', async () => {
                    if (primaryButton.classList.contains('reserve-btn')) {
                        alert(`Funcionalidade de reserva em desenvolvimento para "${title}"`);
                    } else if (primaryButton.classList.contains('request-btn')) {
                        await requisitarLivro(livroId, title);
                    }
                });
            }
        });
    }

    // --- Funções de Livros ---
    
    async function carregarLivros(termoPesquisa = '') {
        try {
            const url = termoPesquisa 
                ? `/api/livros/pesquisar?q=${encodeURIComponent(termoPesquisa)}`
                : '/api/livros';
            
            const response = await fetch(url);
            if (!response.ok) throw new Error('Erro ao carregar livros');
            
            livrosData = await response.json();
            renderizarLivros(livrosData);
        } catch (error) {
            console.error('Erro ao carregar livros:', error);
            bookGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Erro ao carregar livros. Tente novamente mais tarde.</p>
                </div>
            `;
        }
    }

    function renderizarLivros(livros) {
        if (livros.length === 0) {
            bookGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <i class="fas fa-book"></i>
                    <p>Nenhum livro encontrado.</p>
                </div>
            `;
            return;
        }

        bookGrid.innerHTML = livros.map(livro => {
            const disponivel = livro.copias_disponiveis > 0;
            const imagemUrl = livro.capa_url_capa || 'https://via.placeholder.com/150?text=Sem+Imagem';
            const autores = livro.autores || 'Autor desconhecido';
            const isFavorito = favoritosIds.has(livro.id_livro);
            
            return `
                <div class="book-card" data-livro-id="${livro.id_livro}">
                    <img src="${imagemUrl}" alt="${livro.titulo}" onerror="this.src='https://via.placeholder.com/150?text=Sem+Imagem'">
                    <div class="book-info">
                        <h3>${livro.titulo}</h3>
                        <p>Autor: ${autores}</p>
                        <p>Disponível: ${livro.copias_disponiveis}/${livro.total_copias} cópias</p>
                        <div class="actions">
                            ${disponivel 
                                ? `<button class="btn primary request-btn"><i class="fas fa-book"></i> Requisitar</button>`
                                : `<button class="btn primary reserve-btn"><i class="fas fa-clock"></i> Reservar</button>`
                            }
                            <button class="btn secondary favorite-btn ${isFavorito ? 'favorited' : ''}">
                                <i class="fas fa-heart"></i> ${isFavorito ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        adicionarEventListenersLivros();
    }

    function adicionarEventListenersLivros() {
        const cards = document.querySelectorAll('.book-card');
        
        cards.forEach(card => {
            const livroId = parseInt(card.dataset.livroId);
            const livro = livrosData.find(l => l.id_livro == livroId);
            if (!livro) return;

            const title = livro.titulo;
            const favButton = card.querySelector('.favorite-btn');
            const primaryButton = card.querySelector('.btn.primary');

            if (favButton) {
                favButton.addEventListener('click', async () => {
                    const isFav = favButton.classList.contains('favorited');
                    
                    if (isFav) {
                        const resultado = await removerFavorito(livroId);
                        alert(resultado.mensagem);
                        
                        if (resultado.sucesso) {
                            favButton.classList.remove('favorited');
                            favButton.innerHTML = '<i class="fas fa-heart"></i> Adicionar aos Favoritos';
                        }
                    } else {
                        const resultado = await adicionarFavorito(livroId);
                        alert(resultado.mensagem);
                        
                        if (resultado.sucesso) {
                            favButton.classList.add('favorited');
                            favButton.innerHTML = '<i class="fas fa-heart"></i> Remover dos Favoritos';
                        }
                    }
                });
            }

            if (primaryButton) {
                primaryButton.addEventListener('click', async () => {
                    if (primaryButton.classList.contains('reserve-btn')) {
                        alert(`Funcionalidade de reserva em desenvolvimento para "${title}"`);
                    } else if (primaryButton.classList.contains('request-btn')) {
                        await requisitarLivro(livroId, title);
                    }
                });
            }
        });
    }

    // --- Funções de Navegação ---

    function showSection(sectionId) {
        console.log('Mostrando seção:', sectionId);
        
        document.querySelectorAll('#main-content > section').forEach(section => {
            section.style.display = 'none';
        });
        
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.style.display = 'block';
            
            if (sectionId === 'search-section') {
                carregarLivros();
            } else if (sectionId === 'favorites-section') {
                carregarFavoritos();
            } else if (sectionId === 'loans-section') {
                carregarEmprestimos();
            } else if (sectionId === 'fines-section') {
                carregarEmprestimos(); // Recarregar para atualizar multas
            }
        }

        navButtons.forEach(btn => btn.classList.remove('active'));

        navButtons.forEach(btn => {
            const text = btn.textContent.trim();
            const shouldBeActive = 
                (sectionId === 'loans-section' && text.includes('Início')) ||
                (sectionId === 'search-section' && text.includes('Pesquisar')) ||
                (sectionId === 'favorites-section' && text.includes('Favoritos')) ||
                (sectionId === 'fines-section' && text.includes('Multas'));
            
            if (shouldBeActive) {
                btn.classList.add('active');
            }
        });
    }

    function updateFinesDisplay() {
        if (totalFinesElement) {
            totalFinesElement.innerHTML = `<i class="fas fa-bell"></i> Multas (${totalFines.toFixed(2)} €)`;
        }
        
        const finesSectionP = finesSection.querySelector('p:first-of-type');
        if (finesSectionP) {
            finesSectionP.textContent = `Valor Total Pendente: ${totalFines.toFixed(2)} €`;
        }
    }

    // --- Event Listeners ---

    navButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            const text = button.textContent.trim();
            
            if (text.includes('Início')) {
                showSection('loans-section');
            } else if (text.includes('Pesquisar')) {
                showSection('search-section');
            } else if (text.includes('Favoritos')) {
                showSection('favorites-section');
            } else if (text.includes('Multas')) {
                showSection('fines-section');
            } else if (text.includes('Sair')) {
                if (confirm('Tem a certeza que deseja sair?')) {
                    try {
                        await fetch('/api/logout', { method: 'POST' });
                        window.location.href = '/';
                    } catch (error) {
                        console.error('Erro ao fazer logout:', error);
                        window.location.href = '/';
                    }
                }
            }
        });
    });

    if (searchInput) {
        let timeoutId;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(timeoutId);
            const termo = e.target.value.trim();
            
            timeoutId = setTimeout(() => {
                carregarLivros(termo);
            }, 500);
        });
    }

    // Pagamento de Multas
    const payFinesBtn = finesSection.querySelector('.pay-btn');
    if (payFinesBtn) {
        payFinesBtn.addEventListener('click', async () => {
            if (totalFines <= 0) {
                alert('Não tem multas pendentes.');
                return;
            }

            if (!confirm(`Confirma o pagamento de ${totalFines.toFixed(2)} €?`)) return;

            try {
                // Aqui você pode adicionar uma rota no backend para registrar o pagamento
                alert(`Pagamento de ${totalFines.toFixed(2)} € processado com sucesso!\n\nNota: As multas serão zeradas, mas os livros ainda precisam ser devolvidos.`);
                
                // Por agora, apenas atualiza a interface
                await carregarEmprestimos();
            } catch (error) {
                console.error('Erro ao processar pagamento:', error);
                alert('Erro ao processar pagamento. Tente novamente.');
            }
        });
    }

    // Inicialização
    verificarAutenticacao().then(() => {
        carregarEmprestimos();
        showSection('loans-section');
    });
});