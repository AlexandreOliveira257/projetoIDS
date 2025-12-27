const ligacao = require("./configMYSQL.js");

class UserBD {
    constructor() {}

    InserirUser(nome, email, senha) {
        return new Promise((resolve, reject) => {
            const QUERY = `INSERT INTO pageflows.utilizadores(nome,email,senha) VALUES(?,?,?)`;
            ligacao.query(QUERY, [nome, email, senha], (err, result) => {
                if (err) return reject(err);
                resolve(true);
            });
        });
    }

    VerificarUtilizador(email, senha) {
        return new Promise((resolve, reject) => {
            const QUERY = `
                SELECT id_utilizador, nome, email 
                FROM pageflows.utilizadores 
                WHERE email = ? AND senha = ?
            `;

            ligacao.query(QUERY, [email, senha], (err, result) => {
                if (err) {
                    console.error('Erro na query:', err);
                    return reject(err);
                }
                
                console.log('Resultado da query:', result); // Debug
                
                if (result.length > 0) {
                    resolve(result[0]); // Retorna os dados do utilizador
                } else {
                    resolve(null); // Nenhum utilizador encontrado
                }
            });
        });
    }

    ObterUtilizadorPorId(id) {
        return new Promise((resolve, reject) => {
            const QUERY = `
                SELECT id_utilizador, nome, email, multa_pendente
                FROM pageflows.utilizadores 
                WHERE id_utilizador = ?
            `;

            ligacao.query(QUERY, [id], (err, result) => {
                if (err) return reject(err);
                resolve(result[0] || null);
            });
        });
    }
}

module.exports = UserBD;