const ligacao = require("./configMYSQL.js");

class FavoritoBD {
    constructor() {}

    // Obter todos os favoritos do utilizador com informações dos livros
    obterFavoritos(utilizadorId) {
        return new Promise((resolve, reject) => {
            const QUERY = `
                SELECT 
                    f.id_favorito,
                    l.id_livro,
                    l.titulo,
                    l.ano_publicacao,
                    l.total_copias,
                    l.copias_disponiveis,
                    l.capa_url_capa,
                    GROUP_CONCAT(a.nome SEPARATOR ', ') as autores
                FROM pageflows.favoritos f
                INNER JOIN pageflows.livros l ON f.livro_id = l.id_livro
                LEFT JOIN pageflows.livro_autor la ON l.id_livro = la.livro_id
                LEFT JOIN pageflows.autores a ON la.autor_id = a.id_autor
                WHERE f.utilizador_id = ?
                GROUP BY l.id_livro, f.id_favorito
                ORDER BY l.titulo
            `;
            
            ligacao.query(QUERY, [utilizadorId], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    }

    // Adicionar livro aos favoritos
    adicionarFavorito(utilizadorId, livroId) {
        return new Promise((resolve, reject) => {
            const QUERY = `
                INSERT INTO pageflows.favoritos (utilizador_id, livro_id) 
                VALUES (?, ?)
            `;
            
            ligacao.query(QUERY, [utilizadorId, livroId], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    }

    // Remover livro dos favoritos
    removerFavorito(utilizadorId, livroId) {
        return new Promise((resolve, reject) => {
            const QUERY = `
                DELETE FROM pageflows.favoritos 
                WHERE utilizador_id = ? AND livro_id = ?
            `;
            
            ligacao.query(QUERY, [utilizadorId, livroId], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    }

    // Verificar se um livro já está nos favoritos
    verificarFavorito(utilizadorId, livroId) {
        return new Promise((resolve, reject) => {
            const QUERY = `
                SELECT COUNT(*) as count 
                FROM pageflows.favoritos 
                WHERE utilizador_id = ? AND livro_id = ?
            `;
            
            ligacao.query(QUERY, [utilizadorId, livroId], (err, result) => {
                if (err) return reject(err);
                resolve(result[0].count > 0);
            });
        });
    }
}

module.exports = FavoritoBD;