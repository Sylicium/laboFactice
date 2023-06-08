
function _startClient(LaboFactice, datas) {

    console.log("_startClient: datas:",datas)
    const { io } = require("socket.io-client");
    let systemOS = require("os")
    var win = nw.Window.get();

    let socket = io.connect(`http://${datas.ip}:${datas.port}`);

    socket.on("connect", () => {
        console.log("[socket] Connected with ID:",socket.id);
        LaboFactice.startSession()
        socket.emit("LaboFactice_connected", getRealtimeDatas())
    });

    socket.on("disconnect", () => {
        console.log("[socket] Disconnected.");
    });

    socket.on("LaboFactice", (datas) => {

    })


    let windowHasFocus = true


    function getRealtimeDatas() {
        let win = nw.Window.get();
        return {
            computerName: systemOS.hostname(),
            windowHasFocus: windowHasFocus,
            loginInformations: LaboFactice.getLoginInformations(),
            inSession: LaboFactice.sessionAlreadyStarted,
            recording: LaboFactice.currentlyRecording,
            recordingTime: LaboFactice.recordTimeFormated_temp,
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

