

/*
function _startServer() {
    var http = require('http');
    var server = http.createServer(function(req, res) {
        let content = `
        <h2>LaboFactice Teacher Instance</h2>`
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(content);
    });
    var io = require('socket.io')(server);

    io.on('connection', function(socket) {
        console.log(`[socket][+] Socket connected: ${socket_id}`)
        
        let socket_id = `${socket.id}`

        socket.on('disconnect', () => {
            console.log(`[socket][-] Socket disconnected: ${socket_id}`)
        })

        socket.on("test", (datas) => {
            console.log("test réussis:",datas)
        })
    });

    io.on("disconnect", () => {
        console.log("[socket] Disconnected.")
    })

    server.listen(config.bonjourService.port, () => {
        console.log("serveur connecté sur le port", config.bonjourService.port)
    });


    return io
}

*/

function _startServer(LaboFactice, datas) {
    /*

    datas: {
        lessonDatas: {/lesson/},
        port: 1234,
    }


    */
    
    var http = require('http');
    let express = require('express');
    let appWebHTTP = express();

    let httpServer = http.createServer(appWebHTTP);
    let ioHTTP = require('socket.io')(httpServer, {
        maxHttpBufferSize: 1e8
    });

    httpServer.listen(datas.port, () => {
        console.log(`[http] Website : localhost:${config.port_http}`)
    });


    let connectedComputers = {
        /*"name": {
            computerName: systemOS.hostname(),
            windowHasFocus: windowHasFocus,
            loginInformations: {
                logged: logged,
                firstname: firstname,
                lastname: lastname,
                birthday: birthday,
            },
            inSession: LaboFactice.sessionAlreadyStarted, // boolean
            recording: LaboFactice.currentlyRecording, // boolean
            recordingTime: LaboFactice.recordTimeFormated_temp // 00:00:00,
            recordCount: number
        }*/
    }
    
    ioHTTP.on('connection', async (socket) => {
        console.log(`[http/socket][+] New socket connected: ${socket.id}`)
        BasicF.toast({
            type: "log",
            title: "Session socket",
            content: `[${socket.id}] New socket connected.`,
            svg: "success"
        })
        let socket_id = socket.id

        socket.on("LaboFactice_connected", (datas) => {
            if(!datas.computerName || typeof datas.windowHasFocus != 'boolean' || typeof datas.loginInformations != 'object' || typeof datas.inSession != 'boolean') {
                Logger.error(`Invalid socket datas>  SocketID:${socket.id}`,datas)
                return BasicF.toast({
                    type: "error",
                    title: "Invalid socket datas",
                    content: `SocketID:${socket.id}`
                })
            }

            connectedComputers[datas.computerName] = {
                computerName: datas.computerName ??  "Error:socketServer.on('LaboFactice_connected'):INVALID_FORM_OR_TYPE",
                windowHasFocus: (typeof datas.windowHasFocus == 'boolean' ? datas.windowHasFocus : "Error:socketServer.on('LaboFactice_connected'):INVALID_OBJECT_TYPE"),
                loginInformations: {
                    logged: (typeof datas.loginInformations.logged == 'boolean' ? datas.loginInformations.logged : "Error:socketServer.on('LaboFactice_connected'):INVALID_OBJECT_TYPE"),
                    firstname: datas.loginInformations.firstname ?? "Error:socketServer.on('LaboFactice_connected'):INVALID_FORM_OR_TYPE",
                    lastname: datas.loginInformations.lastname ?? "Error:socketServer.on('LaboFactice_connected'):INVALID_FORM_OR_TYPE",
                    birthday: datas.loginInformations.birthday ?? "Error:socketServer.on('LaboFactice_connected'):INVALID_FORM_OR_TYPE",
                },
                inSession: (typeof datas.inSession == 'boolean' ? datas.inSession : "Error:socketServer.on('LaboFactice_connected'):INVALID_OBJECT_TYPE"),
                socketID: socket.id,
                recordCount: (typeof datas.recordCount == 'number' ? datas.recordCount : "Error:socketServer.on('LaboFactice_connected'):INVALID_OBJECT_TYPE")
            }
            LaboFactice.setConnectedComputers(connectedComputers)
        })
        

        socket.on('disconnect', () => {
            console.log(`[http/socket][-] [${socket_id}] Disconnected.`)
            BasicF.toast({
                type: "log",
                title: "Session socket",
                content: `[${socket_id}] Disconnected.`,
                svg: "error"
            })
        })
        socket.on("test",() => {
            console.log("test ok")
            BasicF.toast({
                type: "log",
                title: "Session socket",
                content: `[${socket.id}] test ok.`
            })
        })

        socket.on("LaboFactice", (datas) => {
            console.log("LaboFactice:", socket, datas)
            BasicF.toast({
                type: "log",
                title: "Session socket",
                content: `[${socket.id}] LaboFactice request.`,
                svg: "info"
            })
        })


        socket.on("LaboFactice_realTimeDatas", (datas) => {
            //console.log("LaboFactice_realTimeDatas:",datas)
            LaboFactice.realTimeUpdate(datas)
        })


    })


    appWebHTTP.get(`*`, (req, res) => {
        console.log("req:",req)
        res.send("LaboFactice Teacher Instance")
    })

    return ioHTTP


}