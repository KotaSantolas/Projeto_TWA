var mysql = require('mysql2');
var con = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password:"",
    database: "barbeiro"
});
con.connect(function (err) {
    if (err) throw err;
    console.log("Conectado!");
    con.query("USE barbeiro", function (err, result){
        if(err) throw err;
        console.log("Base de dados usada com sucesso!");
    });
});