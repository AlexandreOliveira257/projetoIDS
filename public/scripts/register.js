document.getElementById('register-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const nome = document.getElementById('reg-nome').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const confirm = document.getElementById('reg-confirm-password').value;
        
        if (password !== confirm) {
            alert('As palavras-passe não coincidem!');
            return;
        }

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    nome: nome, 
                    email: email, 
                    senha: password 
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                window.location.href = '/'; // Redireciona para o login
            } else {
                alert('Erro: ' + data.message);
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            alert('Erro ao conectar ao servidor.');
        }
    });

          document.getElementById('loginClick').addEventListener('click', function(e) {
            window.location.href = '/';
        });