

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

function _startServer(datas) {
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


    
    ioHTTP.on('connection', async (socket) => {
        console.log(`[http/socket][+] New socket connected: ${socket.id}`)
        let socket_id = socket.id

        socket.on('disconnect', () => {
            console.log(`[http/socket][-] [${socket_id}] Disconnected.`)
        })
        socket.on("test",() => {
            console.log("test ok")
        })

        socket.on("LaboFactice", (datas) => {
            console.log("LaboFactice:", socket, datas)
        })


    })


    appWebHTTP.get(`*`, (req, res) => {
        console.log("req:",req)
        res.send("LaboFactice Teacher Instance")
    })

    return ioHTTP


}