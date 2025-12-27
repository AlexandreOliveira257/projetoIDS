const ligacao = require("./configMYSQL.js")

class LivroBD {
    constructor() {}

    // Buscar todos os livros com seus autores
    obterLivros() {
        return new Promise((resolve, reject) => {
            const QUERY = `
                SELECT 
                    l.id_livro,
                    l.titulo,
                    l.ano_publicacao,
                    l.total_copias,
                    l.copias_disponiveis,
                    l.capa_url_capa,
                    GROUP_CONCAT(a.nome SEPARATOR ', ') as autores
                FROM pageflows.livros l
                LEFT JOIN pageflows.livro_autor la ON l.id_livro = la.livro_id
                LEFT JOIN pageflows.autores a ON la.autor_id = a.id_autor
                GROUP BY l.id_livro
                ORDER BY l.titulo
            `;
            ligacao.query(QUERY, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    }

    // Buscar livros por pesquisa (título ou autor)
    pesquisarLivros(termo) {
        return new Promise((resolve, reject) => {
            const QUERY = `
                SELECT 
                    l.id_livro,
                    l.titulo,
                    l.ano_publicacao,
                    l.total_copias,
                    l.copias_disponiveis,
                    l.capa_url_capa,
                    GROUP_CONCAT(a.nome SEPARATOR ', ') as autores
                FROM pageflows.livros l
                LEFT JOIN pageflows.livro_autor la ON l.id_livro = la.livro_id
                LEFT JOIN pageflows.autores a ON la.autor_id = a.id_autor
                WHERE l.titulo LIKE ? OR a.nome LIKE ?
                GROUP BY l.id_livro
                ORDER BY l.titulo
            `;
            const termoPesquisa = `%${termo}%`;
            ligacao.query(QUERY, [termoPesquisa, termoPesquisa], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    }

    // Buscar livro por ID com autores
    obterLivroPorId(id) {
        return new Promise((resolve, reject) => {
            const QUERY = `
                SELECT 
                    l.id_livro,
                    l.titulo,
                    l.ano_publicacao,
                    l.total_copias,
                    l.copias_disponiveis,
                    l.capa_url_capa,
                    GROUP_CONCAT(a.nome SEPARATOR ', ') as autores
                FROM pageflows.livros l
                LEFT JOIN pageflows.livro_autor la ON l.id_livro = la.livro_id
                LEFT JOIN pageflows.autores a ON la.autor_id = a.id_autor
                WHERE l.id_livro = ?
                GROUP BY l.id_livro
            `;
            ligacao.query(QUERY, [id], (err, result) => {
                if (err) return reject(err);
                resolve(result[0] || null);
            });
        });
    }

    // Decrementar cópias disponíveis (quando emprestar)
    decrementarCopias(livroId) {
        return new Promise((resolve, reject) => {
            const QUERY = `
                UPDATE pageflows.livros 
                SET copias_disponiveis = copias_disponiveis - 1 
                WHERE id_livro = ? AND copias_disponiveis > 0
            `;
            ligacao.query(QUERY, [livroId], (err, result) => {
                if (err) return reject(err);
                if (result.affectedRows === 0) {
                    return reject(new Error('Não há cópias disponíveis'));
                }
                resolve(result);
            });
        });
    }

    // Incrementar cópias disponíveis (quando devolver)
    incrementarCopias(livroId) {
        return new Promise((resolve, reject) => {
            const QUERY = `
                UPDATE pageflows.livros 
                SET copias_disponiveis = copias_disponiveis + 1 
                WHERE id_livro = ?
            `;
            ligacao.query(QUERY, [livroId], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    }
}

module.exports = LivroBD;