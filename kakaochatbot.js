const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql')
const port = 30000
const dbconfig = require('./database.js')
const connection = mysql.createConnection(dbconfig)
const app = express()
const exec = require("child_process").exec
var systemlog = ""
const endlog = " >> input-log.log"
app.use(bodyParser.json())
const user = "K9ZEXeLPxE1v"
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

        if (content == "오늘전시" || content == "ㅇㄴㅈㅅ" || content == "ㅇㄵㅅ") {
                connection.query('select EVENT_NUMBER, EVENT_NAME, EVENT_END, EVENT_FEE from COEX_EVENT where EVENT_START <= CURRENT_DATE( ) and EVENT_END > CURRENT_DATE( )', function (err, rows) {
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


                                botsay += "전시번호: " + row.EVENT_NUMBER + "\n" +
                                        '전시명: ' + row.EVENT_NAME + '\n' +
                                        '종료일:' + row.EVENT_END.toLocaleDateString("ko-kr") + '\n' +
                                        '입장료: ' + fee + '\n'
                        })
                        botsay += "\n자세히 보기: 전시자세히 전시번호"
                        botmsg = {
                                'message': {
                                        'text': botsay
                                }
                        }

                        res.set({
                                'content-type': 'application/json'
                        }).send(JSON.stringify(botmsg))
                })
        } else if (content == "일주전시" || content == "ㅇㅈㅈㅅ") {
                connection.query('select EVENT_NUMBER, EVENT_NAME, EVENT_START, EVENT_END from COEX_EVENT where EVENT_START > date_add(now(), interval +0 day) and EVENT_START <= date_add(now(), interval +7 day)', function (err, rows) {
                        if (err) throw err

                        Object.keys(rows).forEach(function (key) {
                                var row = rows[key]

                                if (botsay != '') {
                                        botsay += '\n'
                                }

                                botsay += "전시번호: " + row.EVENT_NUMBER + "\n" +
                                        "전시명: " + row.EVENT_NAME + "\n" +
                                        "시작일:" + row.EVENT_START.toLocaleDateString("ko-kr") + "\n" +
                                        "종료일:" + row.EVENT_END.toLocaleDateString("ko-kr") + "\n"

                        })
                        botsay += "\n자세히 보기: 전시자세히 행사번호"

                        if (botsay == "") {
                                botsay = "엑스포가 없습니다."
                        }

                        botmsg = {
                                'message': {
                                        'text': botsay
                                }
                        }

                        res.set({
                                'content-type': 'application/json'
                        }).send(JSON.stringify(botmsg))
                })
        } else if (content == "전시") {
                botsay = "진행중 : 오늘전시 또는 ㅇㄴㅈㅅ\n " +
                        "Day+7 행사 : 일주전시 또는 ㅇㅈㅈㅅ "
                botmsg = {
                        'message': {
                                'text': botsay
                        }
                }

                res.set({
                        'content-type': 'application/json'
                }).send(JSON.stringify(botmsg))

        } else if (content.indexOf("전시자세히") != -1) {

                var detail = content.split("전시자세히")
                if (detail[1]&&detail[1]>0) {
                        var detailNum = detail[1]
                        var sqlquery = "select EVENT_NUMBER, EVENT_NAME, EVENT_START, EVENT_END, EVENT_PLACE, EVENT_FEE, EVENT_HOST, EMAIL, HOMEPAGE from COEX_EVENT where EVENT_NUMBER = " + detailNum

                        connection.query(sqlquery, function (err, rows) {
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
                                        botsay += "전시번호: " + row.EVENT_NUMBER + "\n" +
                                                "전시명: " + row.EVENT_NAME + "\n" +
                                                "시작일:" + row.EVENT_START.toLocaleDateString("ko-kr") + "\n" +
                                                "종료일:" + row.EVENT_END.toLocaleDateString("ko-kr") + "\n" +
                                                "장소: " + row.EVENT_PLACE + "\n" +
                                                "요금: " + fee + "\n" +
                                                "주최: " + row.EVENT_HOST + "\n" +
                                                "EMAIL: " + row.EMAIL + "\n" +
                                                "홈페이지: " + row.HOMEPAGE + "\n"

                                })

                                if (botsay == "") {
                                        botsay = "전시가 없습니다."
                                }

                                botmsg = {
                                        'message': {
                                                'text': botsay
                                        }
                                }

                                res.set({
                                        'content-type': 'application/json'
                                }).send(JSON.stringify(botmsg))
                        })
                } else {
                        botmsg = {
                                'message': {
                                        'text': '번호를 입력해주세요'
                                }
                        }

                        res.set({
                                'content-type': 'application/json'
                        }).send(JSON.stringify(botmsg))
                }
        }
        //
        else if (content == "오늘컨벤션" || content == "ㅇㄴㅋㅂㅅ" || content == "ㅇㄴㅋㅄ") {
                connection.query('select CON_NUMBER, CON_NAME, CON_END, CON_PLACE from COEX_CONVENTION where CON_START <= CURRENT_DATE( ) and CON_END >= CURRENT_DATE( )', function (err, rows) {
                        if (err) throw err

                        Object.keys(rows).forEach(function (key) {
                                var row = rows[key]

                                if (botsay != '') {
                                        botsay += '\n'
                                }
                                botsay += "컨벤션번호: " + row.CON_NUMBER + "\n" +
                                        '컨벤션명: ' + row.CON_NAME + '\n' +
                                        '종료일: ' + row.CON_END.toLocaleDateString("ko-kr") + '\n' +
                                        '장소: ' + row.CON_PLACE + '\n'

                        })
                        botsay += "\n자세히 보기: 컨벤션자세히 컨벤션번호"
                        botmsg = {
                                'message': {
                                        'text': botsay
                                }
                        }

                        res.set({
                                'content-type': 'application/json'
                        }).send(JSON.stringify(botmsg))
                })
        } else if (content == "일주컨벤션" || content == "ㅇㅈㅋㅄ" || content == "ㅇㅈㅋㅂㅅ") {
                connection.query('select CON_NUMBER, CON_NAME, CON_START, CON_END from COEX_CONVENTION where CON_START > date_add(now(), interval +0 day) and CON_START <= date_add(now(), interval +7 day)', function (err, rows) {
                        if (err) throw err

                        Object.keys(rows).forEach(function (key) {
                                var row = rows[key]
                                if (botsay != '') {
                                        botsay += '\n'
                                }
                                botsay += "컨벤션번호: " + row.CON_NUMBER + "\n" +
                                        "컨벤션명: " + row.CON_NAME + "\n" +
                                        "시작일:" + row.CON_START.toLocaleDateString("ko-kr") + "\n" +
                                        "종료일:" + row.CON_END.toLocaleDateString("ko-kr") + "\n"
                        })
                        botsay += "\n자세히 보기: 컨벤션자세히 컨벤션번호"
                        if (botsay == "") {
                                botsay = "컨벤션이 없습니다."
                        }

                        botmsg = {
                                'message': {
                                        'text': botsay
                                }
                        }

                        res.set({
                                'content-type': 'application/json'
                        }).send(JSON.stringify(botmsg))
                })
        } else if (content == "컨벤션") {
                botsay = "진행중 : 오늘컨벤션 또는 ㅇㄴㅋㅂㅅ\n " +
                        "Day+7 행사 : 일주컨벤션 또는 ㅇㅈㅋㅂㅅ "
                botmsg = {
                        'message': {
                                'text': botsay
                        }
                }

                res.set({
                        'content-type': 'application/json'
                }).send(JSON.stringify(botmsg))

        } else if (content.indexOf("컨벤션자세히") != -1) {

                var detail = content.split("컨벤션자세히")
                if (detail[1]&&detail[1]>0) {
                        var detailNum = detail[1]
                        var sqlquery = "select CON_NUMBER, CON_NAME, CON_START, CON_END, CON_PLACE, CON_HOST, PHONE, EMAIL, HOMEPAGE from COEX_CONVENTION where CON_NUMBER = " + detailNum

                        connection.query(sqlquery, function (err, rows) {
                                if (err) throw err

                                Object.keys(rows).forEach(function (key) {
                                        var row = rows[key]
                                        if (botsay != '') {
                                                botsay += '\n'
                                        }
                                        botsay += "컨벤션번호: " + row.CON_NUMBER + "\n" +
                                                "컨벤션명: " + row.CON_NAME + "\n" +
                                                "시작일:" + row.CON_START.toLocaleDateString("ko-kr") + "\n" +
                                                "종료일:" + row.CON_END.toLocaleDateString("ko-kr") + "\n" +
                                                "장소: " + row.CON_PLACE + "\n" +
                                                "주최: " + row.CON_HOST + "\n" +
                                                "전화번호: " + row.PHONE + "\n" +
                                                "EMAIL: " + row.EMAIL + "\n" +
                                                "홈페이지: " + row.HOMEPAGE + "\n"
                                })

                                if (botsay == "") {
                                        botsay = "컨벤션이 없습니다."
                                }

                                botmsg = {
                                        'message': {
                                                'text': botsay
                                        }
                                }

                                res.set({
                                        'content-type': 'application/json'
                                }).send(JSON.stringify(botmsg))
                        })
                }
                else {
                        botmsg = {
                                'message': {
                                        'text': '번호를 입력해주세요'
                                }
                        }

                        res.set({
                                'content-type': 'application/json'
                        }).send(JSON.stringify(botmsg))
                }
        }

        else if (content.indexOf("오크등록") != -1) {

                if (user_key == user) {
                        var detail = content.split("오크등록")
                        var detailmeal = detail[1]
                        var sqlquery = "insert into OAKWOOD (OAKWOOD_MEAL) VALUES('" + detailmeal + "')"

                        connection.query(sqlquery, function (err, rows) {
                                if (err) throw err
                        })
                        botsay = "등록성공."
                        botmsg = {
                                'message': {
                                        'text': botsay
                                }
                        }

                        res.set({
                                'content-type': 'application/json'
                        }).send(JSON.stringify(botmsg))

                } else {
                        botsay = "권한이 없습니다."
                        botmsg = {
                                'message': {
                                        'text': botsay
                                }
                        }

                        res.set({
                                'content-type': 'application/json'
                        }).send(JSON.stringify(botmsg))
                }
        } else if (content == "오크우드" || content == "ㅇㅋㅇㄷ") {
                connection.query('select OAKWOOD_TODAY, OAKWOOD_MEAL from OAKWOOD where OAKWOOD_NUMBER = (select MAX(OAKWOOD_NUMBER) from OAKWOOD )', function (err, rows) {
                        if (err) throw err

                        Object.keys(rows).forEach(function (key) {
                                var row = rows[key]
                                var t = row.OAKWOOD_TODAY.getDate()
                                var td = new Date()
                                if (t == td.getDate()) {
                                        botsay = row.OAKWOOD_MEAL
                                }
                        })


                        if (botsay == "") {
                                botsay = "준비중입니다."
                        }

                        botmsg = {
                                'message': {
                                        'text': botsay
                                }
                        }

                        res.set({
                                'content-type': 'application/json'
                        }).send(JSON.stringify(botmsg))
                })
        }
        //
        else if (content.indexOf("구내등록") != -1) {

                if (user_key == user) {
                        var detail = content.split("구내등록")
                        var detailmeal = detail[1]
                        var sqlquery = "insert into Gunea (Gunea_MEAL) VALUES('" + detailmeal + "')"

                        connection.query(sqlquery, function (err, rows) {
                                if (err) throw err
                        })
                        botsay = "등록성공."
                        botmsg = {
                                'message': {
                                        'text': botsay
                                }
                        }

                        res.set({
                                'content-type': 'application/json'
                        }).send(JSON.stringify(botmsg))

                } else {
                        botsay = "권한이 없습니다."
                        botmsg = {
                                'message': {
                                        'text': botsay
                                }
                        }

                        res.set({
                                'content-type': 'application/json'
                        }).send(JSON.stringify(botmsg))
                }
        } else if (content == "구내" || content == "ㄱㄴ") {
                connection.query('select Gunea_TODAY, Gunea_MEAL from Gunea where Gunea_NUMBER = (select MAX(Gunea_NUMBER) from Gunea )', function (err, rows) {
                        if (err) throw err

                        Object.keys(rows).forEach(function (key) {
                                var row = rows[key]
                                var t = row.Gunea_TODAY.getDate()
                                var td = new Date()
                                if (t == td.getDate()) {
                                        botsay = row.Gunea_MEAL
                                }
                        })


                        if (botsay == "") {
                                botsay = "준비중입니다."
                        }

                        botmsg = {
                                'message': {
                                        'text': botsay
                                }
                        }

                        res.set({
                                'content-type': 'application/json'
                        }).send(JSON.stringify(botmsg))
                })
        } else {

                botsay = "[코엑스인 사용법]\n다음의 키워드를 입력해주세요\n행사검색: 전시, 컨벤션\n식당메뉴: 오크우드, 구내"

                botmsg = {
                        'message': {
                                'text': botsay
                        }
                }
                res.set({
                        'content-type': 'application/json'
                }).send(JSON.stringify(botmsg))
        }




        const d = new Date()
        const [month, day, hour, min, sec] = [(d.getMonth() + 1), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()]
        const todayClock = (v) => {
                const s = "00" + v
                return s.substr(s.length - 2, 2)
        }
        const today = d.getFullYear() + "-" + todayClock(month) + "-" + todayClock(day) + "-" + todayClock(hour) + ":" + todayClock(min) + ":" + todayClock(sec)


        var logsqlquery = "insert into LOGTEXT (LOG_MEAL, LOG_USER) VALUES('" + content + "','" + user_key + "')"

        connection.query(logsqlquery, function (err, rows) {
                if (err) throw err
        })

        content.replace("\\", " ");

        systemlog = "echo [{date : " + today + " } {" + user_key + " : " + content + "}]" + endlog

        exec(systemlog, function (err, stdout, stderr) { })

})

app.listen(port, () => {
        console.log('Connect ' + port + ' port!')
})