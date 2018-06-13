const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql');
const port = 3000
const dbconfig = require('./database.js')
const connection = mysql.createConnection(dbconfig)
const app = express()
app.use(bodyParser.json())


app.get('/keyboard', function (req, res) {
        var keyboard = {
                'type': 'text'
        }

        connection.query('select * from COEX_EVENT where EVENT_Number = 1', function (err, rows) {
                if (err) throw err;

                console.log('The solution is: ', rows);

        });





        res.send(keyboard)
})



app.listen(port, () => {
        console.log('Connect ' + port + ' port!')
})

