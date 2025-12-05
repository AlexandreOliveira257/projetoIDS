import mysql from "mysql"

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

export default LIGACAO