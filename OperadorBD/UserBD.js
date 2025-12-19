const ligacao = require("./configMYSQL.js")
class UserBD {
    constructor() {

    }
    InserirUser(nome,email,senha) {
        const QUERY = `INSERT INTO pageflows.utilizadores(nome,email,senha) VALUES('${nome}','${email}','${senha}')`
        ligacao.query(QUERY,(err,result)=>{
            if(err) throw err
            return true
        })
    }
     VerificarUtilizador(email,senha) {
        const QUERY = `SELECT NOME FROM pageflows.utilizadores WHERE email = ${email} and senha = ${senha}`
        ligacao.query(QUERY,(err,result)=>{
            if(err) throw err
            return true
        })
    }
    /*
    async obterLivros()
    {
        return new Promise((resolve, reject)=>
        {
            const QUERY = "SELECT idLivro,nome,autor FROM livros.coleccao"
            ligacao.query(QUERY, (err,result)=>
            {
                if(err)
                {
                    reject(err)
                }
                let coleccao = []
                result.forEach(resultado => {
                    let novoLivro = new Livro(resultado.nome, resultado.autor, resultado.idLivro) 
                    coleccao.push(novoLivro)                    
                });
                return resolve(coleccao)
            })
        })
    }
    apagarLivro(id)
    {
        return new Promise((resolve,reject)=>
        {
            const QUERY = "DELETE FROM livros.coleccao WHERE idLivro = " + id        
            ligacao.query(QUERY,(err,result)=>
            {
                if(err)
                {
                    reject(err)
                }
                resolve(true)
            })
        })
    }
    updateLivro(livro)
    {
        return new Promise((resolve,reject)=>{
            const QUERY = `UPDATE livros.coleccao SET nome ="${livro.nome}", autor = "${livro.autor}" 
            WHERE idLivro = ${livro.idLivro}`
            ligacao.query(QUERY, (err, result)=>
            {
                if(err)
                {
                    reject(err)
                }
                if(result.affectedRows > 0)
                {
                    resolve(true)    
                }
                else
                {
                    resolve(false)
                }
            })
        })
    }
        */
}

module.exports = UserBD