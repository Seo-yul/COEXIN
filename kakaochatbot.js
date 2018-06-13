const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql')
const port = 3000
const dbconfig = require('./database.js')
const connection = mysql.createConnection(dbconfig)
const app = express()
const exec = require("child_process").exec
var systemlog = ""
const endlog = " >> input_log.txt"
app.use(bodyParser.json())
const admin = "K9Vi5CrPxE1v"
app.get('/keyboard', function (req, res) {
        var keyboard = {
                'type': 'text'
        }
        res.send(keyboard)
})





app.post('/message', function (req, res) {
        var user_key = decodeURIComponent(req.body.user_key) // user's key
        var type = decodeURIComponent(req.body.type) // message type
        var content = decodeURIComponent(req.body.content) // user's message
        var botsay = ''
        var botmsg

        connection.query('select EVENT_NAME, EVENT_END, EVENT_FEE from COEX_EVENT where EVENT_START <= CURRENT_DATE( ) and EVENT_END > CURRENT_DATE( )', function (err, rows) {
                if (err) throw err

                Object.keys(rows).forEach(function (key) {
                        var row = rows[key]
                        var fee = row.EVENT_FEE
                        if (botsay != '') {
                                botsay += '\n'
                        }
                        if (fee.indexOf('원') != -1) {
                                var won = row.EVENT_FEE.split('원')
                                if (won[1] != null) {
                                        won[1] = '\n' + won[1]
                                }
                                fee = won[0] + '원' + won[1]
                        }


                        botsay += '행사명: ' + row.EVENT_NAME + '\n' +
                                '종료일:' + row.EVENT_END.toLocaleDateString("ko-kr") + '\n' +
                                '입장료: ' + fee + '\n'
                })

                console.log(botsay)
                botmsg = {
                        'message': {
                                'text': botsay
                        }
                }

                res.set({
                        'content-type': 'application/json'
                }).send(JSON.stringify(botmsg))
        })





        const d = new Date()
        const [month, day, hour, min, sec] = [(d.getMonth() + 1), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()]
        const todayClock = (v) => {
                const s = "00" + v
                return s.substr(s.length - 2, 2)
        }
        const today = d.getFullYear() + "-" + todayClock(month) + "-" + todayClock(day) + "-" + todayClock(hour) + ":" + todayClock(min) + ":" + todayClock(sec)


        content.replace("\\", " ");

        systemlog = "echo [{date : " + today + " } {" + user_key + " : " + content + "}]" + endlog

        exec(systemlog, function (err, stdout, stderr) { })
        console.log(content)

})

app.listen(port, () => {
        console.log('Connect ' + port + ' port!')
})

