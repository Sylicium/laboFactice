

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
            recordCount: number,
            callTeacher: boolean,
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
            socketID: "",
            computerName: systemOS.hostname(),
            loginInformations: {
                logged: (typeof datas.loginInformations.logged == 'boolean' ? datas.loginInformations.logged : "Error:socketServer.on('LaboFactice_connected'):INVALID_OBJECT_TYPE"),
                firstname: datas.loginInformations.firstname ?? "Error:socketServer.on('LaboFactice_connected'):INVALID_FORM_OR_TYPE",
                lastname: datas.loginInformations.lastname ?? "Error:socketServer.on('LaboFactice_connected'):INVALID_FORM_OR_TYPE",
                birthday: datas.loginInformations.birthday ?? "Error:socketServer.on('LaboFactice_connected'):INVALID_FORM_OR_TYPE",
            },
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

            connectedComputers[datas.computerName] = {
                socketID: socket.id,
                computerName: datas.computerName ??  "Error:socketServer.on('LaboFactice_connected'):INVALID_FORM_OR_TYPE",
                /*windowHasFocus: (typeof datas.windowHasFocus == 'boolean' ? datas.windowHasFocus : "Error:socketServer.on('LaboFactice_connected'):INVALID_OBJECT_TYPE"),
                */
                loginInformations: {
                    logged: (typeof datas.loginInformations.logged == 'boolean' ? datas.loginInformations.logged : "Error:socketServer.on('LaboFactice_connected'):INVALID_OBJECT_TYPE"),
                    firstname: datas.loginInformations.firstname ?? "Error:socketServer.on('LaboFactice_connected'):INVALID_FORM_OR_TYPE",
                    lastname: datas.loginInformations.lastname ?? "Error:socketServer.on('LaboFactice_connected'):INVALID_FORM_OR_TYPE",
                    birthday: datas.loginInformations.birthday ?? "Error:socketServer.on('LaboFactice_connected'):INVALID_FORM_OR_TYPE",
                },
                /*
                inSession: (typeof datas.inSession == 'boolean' ? datas.inSession : "Error:socketServer.on('LaboFactice_connected'):INVALID_OBJECT_TYPE"),
                recordCount: (typeof datas.recordCount == 'number' ? datas.recordCount : "Error:socketServer.on('LaboFactice_connected'):INVALID_OBJECT_TYPE")
                */
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

            connectedComputers = connectedComputers.filter(x => {
                return x
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
                    recordCount: datas.recordCount, // number
                    callTeacher: datas.callTeacher
                }
                LaboFactice.realTimeUpdate(sanitizedDatas)
            } catch(e) {
                console.warn(e)
            }
        })

        socket.on(`LaboFactice_sendMyRecord`, datas => {
            /*
            {
                lesson: datas.lesson,
                record: recordToSend,
                recordsCount: this.records.length
            }
            */
            try {
                datas = {
                    lesson: datas.lesson,
                    record: datas.record,
                    recordsCount: parseInt(datas.recordsCount) != NaN ? parseInt(datas.recordsCount) : 0
                }
                console.log(`[socket:LaboFactice_sendMyRecord] Received datas:`,datas)
                //let computer = connectedComputers.filter(x => { return x.socketID == socket.id})[0]
                let computer = connectedComputers[0]
                console.log("debugAMZ: 1")
                console.log("computer:",computer)
                BasicF.toast({
                    type: "info",
                    title: `Enregistrement reçu.`,
                    content: `De: ${computer.loginInformations.lastname.toUpperCase()} ${computer.loginInformations.firstname}`,
                })
                console.log("debugAMZ: 2")
    
                let main_path = `${process.env.USERPROFILE}\\Documents\\LaboFactice\\Records\\${lesson.class}\\${lesson.UUID}`
                console.log("debugAMZ: 3")
                if(!fs.existsSync(main_path)) fs.mkdirSync(main_path, { recursive: true })
    
                console.log("debugAMZ: 4")
                let file_name = `${computer.loginInformations.lastname.toUpperCase()}_${computer.loginInformations.firstname}__${BasicF.formatDate(Date.now(), "DD-MM-YYYY_hhhmm")}`
    
                console.log("debugAMZ: 5")
                if(recordsCount > 0) {
                    console.log("debugAMZ: 6")
                    var dataurl= "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==";
                    var regex = /^data:.+\/(.+);base64,(.*)$/;
                    var matches = dataurl.match(regex);
                    var ext = matches[1];
                    var data = matches[2];
                    var buffer = Buffer.from(data, 'base64');
                    console.log("debugAMZ: 7")
                    // fs.writeFileSync('data.' + ext, buffer);
                    fs.writeFileSync(`${main_path}\\${file_name}.mp3`, buffer)
                    console.log("debugAMZ: 8")
                    
                } else {
                    console.log("debugAMZ: 9")
                    fs.writeFileSync(`${main_path}\\${file_name}.txt`, `L'élève a participé à la session mais aucun enregistrement n'existait pour être envoyé.`)
                }
                console.log("debugAMZ: 10")
            } catch(e) {
                console.log("debugAMZ: 11")
                BasicF.toastError(e)
            }
        })


    })


    appWebHTTP.get(`*`, (req, res) => {
        console.log("req:",req)
        res.send("LaboFactice Teacher Instance")
    })

    return ioHTTP


}