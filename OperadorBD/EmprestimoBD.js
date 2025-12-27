const ligacao = require("./configMYSQL.js");

class EmprestimoBD {
    constructor() {}

    // Criar novo empréstimo
    criarEmprestimo(utilizadorId, livroId) {
        return new Promise((resolve, reject) => {
            const dataEmprestimo = new Date();
            const dataPrevista = new Date();
            dataPrevista.setDate(dataPrevista.getDate() + 7); // 7 dias depois

            const QUERY = `
                INSERT INTO pageflows.emprestimos 
                (utilizador_id, livro_id, data_emprestimo, data_prevista, status, multa_calculada) 
                VALUES (?, ?, ?, ?, 'ativo', 0.00)
            `;

            ligacao.query(
                QUERY,
                [utilizadorId, livroId, dataEmprestimo, dataPrevista],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                }
            );
        });
    }

    // Obter empréstimos ativos do utilizador com informações dos livros
    obterEmprestimosAtivos(utilizadorId) {
        return new Promise((resolve, reject) => {
            const QUERY = `
                SELECT 
                    e.id,
                    e.data_emprestimo,
                    e.data_prevista,
                    e.multa_calculada,
                    e.status,
                    l.id_livro,
                    l.titulo,
                    l.capa_url_capa,
                    GROUP_CONCAT(a.nome SEPARATOR ', ') as autores,
                    DATEDIFF(CURDATE(), e.data_prevista) as dias_atraso
                FROM pageflows.emprestimos e
                INNER JOIN pageflows.livros l ON e.livro_id = l.id_livro
                LEFT JOIN pageflows.livro_autor la ON l.id_livro = la.livro_id
                LEFT JOIN pageflows.autores a ON la.autor_id = a.id_autor
                WHERE e.utilizador_id = ? AND e.status = 'ativo'
                GROUP BY e.id, l.id_livro
                ORDER BY e.data_prevista ASC
            `;

            ligacao.query(QUERY, [utilizadorId], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    }

    // Devolver livro
    devolverLivro(emprestimoId, utilizadorId) {
        return new Promise((resolve, reject) => {
            const dataDevolucao = new Date();

            const QUERY = `
                UPDATE pageflows.emprestimos 
                SET status = 'devolvido', data_devolucao = ?
                WHERE id = ? AND utilizador_id = ?
            `;

            ligacao.query(
                QUERY,
                [dataDevolucao, emprestimoId, utilizadorId],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                }
            );
        });
    }

    // Renovar empréstimo (adicionar 7 dias)
    renovarEmprestimo(emprestimoId, utilizadorId) {
        return new Promise((resolve, reject) => {
            const QUERY = `
                UPDATE pageflows.emprestimos 
                SET data_prevista = DATE_ADD(data_prevista, INTERVAL 7 DAY)
                WHERE id = ? AND utilizador_id = ? AND status = 'ativo'
            `;

            ligacao.query(QUERY, [emprestimoId, utilizadorId], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    }

    // Verificar se utilizador já tem empréstimo ativo do livro
    verificarEmprestimoExistente(utilizadorId, livroId) {
        return new Promise((resolve, reject) => {
            const QUERY = `
                SELECT COUNT(*) as count 
                FROM pageflows.emprestimos 
                WHERE utilizador_id = ? AND livro_id = ? AND status = 'ativo'
            `;

            ligacao.query(QUERY, [utilizadorId, livroId], (err, result) => {
                if (err) return reject(err);
                resolve(result[0].count > 0);
            });
        });
    }

    // Calcular multa de um empréstimo
    calcularMulta(emprestimoId) {
        return new Promise((resolve, reject) => {
            const QUERY = `
                SELECT 
                    GREATEST(0, DATEDIFF(CURDATE(), data_prevista)) as dias_atraso
                FROM pageflows.emprestimos 
                WHERE id = ? AND status = 'ativo'
            `;

            ligacao.query(QUERY, [emprestimoId], (err, result) => {
                if (err) return reject(err);
                
                if (result.length > 0) {
                    const diasAtraso = result[0].dias_atraso;
                    const multaPorDia = 2.50; // 2,50€ por dia de atraso
                    const multa = diasAtraso * multaPorDia;
                    resolve(multa);
                } else {
                    resolve(0);
                }
            });
        });
    }

    // Atualizar multa calculada
    atualizarMulta(emprestimoId, multa) {
        return new Promise((resolve, reject) => {
            const QUERY = `
                UPDATE pageflows.emprestimos 
                SET multa_calculada = ?
                WHERE id = ?
            `;

            ligacao.query(QUERY, [multa, emprestimoId], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    }
}

module.exports = EmprestimoBD;