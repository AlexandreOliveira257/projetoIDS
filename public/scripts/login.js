   document.getElementById('login-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            const url = "http://localhost:5001/" 
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            try{
                const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email: email, 
                    senha: password 
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                window.location.href = '/dashboard'; // Redireciona para o dashboard
            } else {
                alert('Erro: ' + data.message);
            }
        } catch (error){
            console.log(error)
        }
        }); //loginform
           document.getElementById('registerClick').addEventListener('click', function(e) {
            window.location.href = '/register';
        });

        