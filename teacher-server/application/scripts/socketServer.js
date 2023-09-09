

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
async function dataURLToBlob(dataURI) {
    return await (await fetch(dataURI)).blob(); 
}


function _startServer(LaboFactice, datas) {
    /*

    datas: {
        lessonDatas: {/lesson/},
        port: 1234,
    }



    On update datas:
    
        {
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

    setInterval(() => {
        console.log("connectedComputers:",connectedComputers)
    }, 5000)

    let connectedComputers = [
        /*{
            socketID: "",
            computerName: systemOS.hostname(),
        }*/
    ]
    
    ioHTTP.on('connection', async (socket) => {
        console.log(`[http/socket][+] New socket connected: ${socket.id}`)
        BasicF.toast({
            type: "log",
            title: "Session socket",
            content: `[${socket.id}] New socket connected.`,
            svg: "success"
        })
        let socket_id = socket.id

        socket.emit("LaboFactice_loadLesson", datas.lessonDatas)

        socket.on("LaboFactice_connected", (datas) => {
            if(!datas.computerName || typeof datas.windowHasFocus != 'boolean' || typeof datas.loginInformations != 'object' || typeof datas.inSession != 'boolean') {
                Logger.error(`Invalid socket datas>  SocketID:${socket.id}`,datas)
                return BasicF.toast({
                    type: "error",
                    title: "Invalid socket datas",
                    content: `SocketID:${socket.id}`
                })
            }

            connectedComputers.push({
                socketID: socket.id,
                computerName: datas.computerName ??  "Error:socketServer.on('LaboFactice_connected'):INVALID_FORM_OR_TYPE",
                /*windowHasFocus: (typeof datas.windowHasFocus == 'boolean' ? datas.windowHasFocus : "Error:socketServer.on('LaboFactice_connected'):INVALID_OBJECT_TYPE"),
                loginInformations: {
                    logged: (typeof datas.loginInformations.logged == 'boolean' ? datas.loginInformations.logged : "Error:socketServer.on('LaboFactice_connected'):INVALID_OBJECT_TYPE"),
                    firstname: datas.loginInformations.firstname ?? "Error:socketServer.on('LaboFactice_connected'):INVALID_FORM_OR_TYPE",
                    lastname: datas.loginInformations.lastname ?? "Error:socketServer.on('LaboFactice_connected'):INVALID_FORM_OR_TYPE",
                    birthday: datas.loginInformations.birthday ?? "Error:socketServer.on('LaboFactice_connected'):INVALID_FORM_OR_TYPE",
                },
                inSession: (typeof datas.inSession == 'boolean' ? datas.inSession : "Error:socketServer.on('LaboFactice_connected'):INVALID_OBJECT_TYPE"),
                recordCount: (typeof datas.recordCount == 'number' ? datas.recordCount : "Error:socketServer.on('LaboFactice_connected'):INVALID_OBJECT_TYPE")
                */
            })
            LaboFactice.setConnectedComputers(connectedComputers)
        })
        

        socket.on('disconnect', () => {
            try {

                console.log(`[http/socket][-] [${socket_id}] Disconnected.`)
                BasicF.toast({
                    type: "log",
                    title: "Session socket",
                    content: `[${socket_id}] Disconnected.`,
                    svg: "error"
                })
    
                connectedComputers = connectedComputers.filter(x => {
                    return (x.socketID != socket_id)
                })
    
                let computerInfos = connectedComputers.filter(x => {
                    return (x.socketID == socket_id)[0]
                })
    
                function sendDisconnected() {
                    LaboFactice.realTimeUpdate({
                        computerName: computerInfos.computerName,
                        isDisconnected: true
                    })
                }
    
                setTimeout(() => { sendDisconnected() }, 2*1000)
                setTimeout(() => { sendDisconnected() }, 5*1000)
            } catch(e) {
                console.log(e)
            }
            
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


        socket.on("LaboFactice_sendMyRecord", async datas => {
            console.log("LaboFactice_sendMyRecord:", datas)
            

            let filePath = `${config.defaultSavePath}`.replace("{{USERPROFILE}}", process.env.USERPROFILE + LaboFactice.currentLessonUUID)
            let fileName = `${datas.loginInformations.lastname}_${datas.loginInformations.firstname}`
            let fileExtension = `.wav`

            fs.mkdir(filePath, { recursive: true }, (err) => {
                if (err) throw err;
            });

            fs.writeFileSync((filePath + fileName + fileExtension) ,Buffer.from(await (await dataURLToBlob(datas.record.dataURL)).arrayBuffer(), 'binary').toString("base64"), {encoding: "base64"} )
        })


        socket.on("LaboFactice_realTimeDatas", (datas) => {
            //console.log("LaboFactice_realTimeDatas:",datas)
            try {
                let sanitizedDatas = {
                    computerName: datas.computerName,
                    windowHasFocus: datas.windowHasFocus,
                    loginInformations: {
                        logged: datas.loginInformations.logged,
                        firstname: datas.loginInformations.firstname,
                        lastname: datas.loginInformations.lastname,
                        birthday: datas.loginInformations.birthday,
                    },
                    inSession: datas.inSession, // boolean
                    recording: datas.recording, // boolean
                    recordTime: datas.recordTime, // 00:00:00,
                    recordCount: datas.recordCount // number
                }
                LaboFactice.realTimeUpdate(sanitizedDatas)
            } catch(e) {
                console.warn(e)
            }
        })


    })


    appWebHTTP.get(`*`, (req, res) => {
        console.log("req:",req)
        res.send("LaboFactice Teacher Instance")
    })

    return ioHTTP


}