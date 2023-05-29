



function _startClient(datas) {

    console.log("_startClient: datas:",datas)
    const { io } = require("socket.io-client");

    let socket = io.connect(`http://${datas.ip}:${datas.port}`);

    socket.on("connect", () => {
        console.log("[socket] Connected with ID:",socket.id);
    });
    socket.on("disconnect", () => {
        console.log("[socket] Disconnected.");
    });

    return socket
}

