

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
            loginInformations: LaboFactice.getLoginInformations(),
            inSession: LaboFactice.sessionAlreadyStarted
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
                computerName: datas.computerName,
                windowHasFocus: datas.windowHasFocus,
                loginInformations: datas.loginInformations,
                inSession: datas.inSession,
                socketID: socket.id
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