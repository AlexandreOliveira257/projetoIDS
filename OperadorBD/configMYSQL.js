const mysql = require("mysql2")

const LIGACAO = mysql.createConnection(
    {
        host:"localhost",
        user:"root", 
        password: "",
        database: "pageflows",
        port:3306
    }
)
LIGACAO.connect()

module.exports = LIGACAO