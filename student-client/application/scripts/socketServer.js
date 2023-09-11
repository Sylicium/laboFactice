
function _startClient(LaboFactice, startClientDatas) {

    console.log("_startClient: datas:",startClientDatas)
    const { io } = require("socket.io-client");
    let systemOS = require("os")
    var win = nw.Window.get();

    let socket = io.connect(`http://${startClientDatas.ip}:${startClientDatas.port}`);

    socket.on("connect", () => {
        console.log("[socket] Connected with ID:",socket.id);
        socket.emit("LaboFactice_connected", getRealtimeDatas())
    });

    LaboFactice.internal_socket.on("logged", timestamp => {
        socket.emit("LaboFactice_connected", getRealtimeDatas())
    })

    socket.on("LaboFactice_loadLesson", (lessonDatas) => {
        LaboFactice.loadLesson(lessonDatas)
        LaboFactice.startSession()
    })

    socket.on("disconnect", () => {
        console.log("[socket] Disconnected.");
    });

    socket.on("LaboFactice", (datas) => {

    })


    socket.on("LaboFactice_displayComputerNamePage", (classPlaces) => {
        console.log("classPlaces:",classPlaces)
        let myComputer = classPlaces.filter(x => { return x.computerName == systemOS.hostname()})[0]
        console.log("myComputer:",myComputer)
        let myComputerNumber;
        if(!myComputer) {
            myComputerNumber = "Error. Computer not found in teacher config.classPlaces"
        } else {
            myComputerNumber =  myComputer.number
        }
        LaboFactice.displayComputerNamePage(myComputerNumber)
    })


    socket.on("LaboFactive_stopSession", datas => {
        
        BasicF.toast({
            type: "info",
            svg: "warn",
            title: "Fermeture de session",
            content: `La session va bientôt se terminer. Terminez vos enregistrements et selectionnez en un pour ne pas perdre votre travail.`,
            timeout: 30*1000,
        })
        BasicF.toast({
            type: "info",
            svg: "warn",
            title: "Fermeture automatique",
            content: `La session va se fermer automatiquement dans ${BasicF.formatTime(datas.secondsBeforeEnd*1000, "hh heures mm minutes et ss secondes")} (à ${BasicF.formatDate(new Date(datas.endTimestamp), "hh:mm:ss")})`,
            timeout: datas.secondsBeforeEnd*1000,
            progressBarType: "error"
        })

        setTimeout(() => {
            BasicF.toast({
                type: "info",
                svg: "warn",
                title: "Fermeture automatique",
                content: `La session est terminée.`,
                timeout: datas.secondsBeforeEnd*1000,
                progressBarType: "error"
            })
        }, datas.secondsBeforeEnd*1000)

        setTimeout(() => {
            LaboFactice.quit(true)
        }, datas.secondsBeforeEnd*1000+3000)


    })


    let windowHasFocus = true


    function getRealtimeDatas() {
        let win = nw.Window.get();
        return {
            computerName: systemOS.hostname(),
            callTeacher: LaboFactice.isCallingTeacher,
            windowHasFocus: windowHasFocus,
            loginInformations: LaboFactice.getLoginInformations(),
            inSession: LaboFactice.sessionAlreadyStarted,
            recording: LaboFactice.currentlyRecording,
            recordTime: LaboFactice.recordTimeFormated_temp,
            recordCount: LaboFactice.records.length // ATTENTION, NE PAS ENVOYER JUSTE RECORDS SINON CA ENVOIE AUSSI LE BLOB ET DATA URL --> SURCHARGE RESEAU
        }
    }

    setInterval(() => {
        let d = getRealtimeDatas()
        socket.emit("LaboFactice_realTimeDatas", d)
    }, 1*1000)

    win.on("blur", () => {
        windowHasFocus = false
        console.log(`Window lost focus at ${(new Date())}`);
    })
    win.on("focus", () => {
        windowHasFocus = true
        console.log(`Window get focus back`);
    })

    /* setInterval(() => { // A mettre en production
        win.enterFullscreen()
    }, 10*1000) */

    return socket
}

