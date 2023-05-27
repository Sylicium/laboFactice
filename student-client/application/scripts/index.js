
const fs = require("fs")
const { exec } = require('node:child_process');

const config = JSON.parse(fs.readFileSync("./application/config.json","UTF-8"))
function saveConfig() {
    JSON.writeFileSync(`./application/config.json`, JSON.stringify(config, null, 4))
}

function openConfigFile() {
    let password = prompt(`Entrez le mot de passe Administrateur de LaboFactice:`)
    if(password == config.adminPassword) {
        exec('start "" "notepad.exe" "./application/config.json"')
        setTimeout(() => {
            window.close()
        }, 500)
    } else {
        setTimeout(() => {
            alert(`Le mot de passe est incorrect.`)
        }, 500)
    }
}


let LoadingPage = {
    start: (text=undefined) => {
        let loadingbox = document.getElementById("loadingbox")
        let loadingboxText = document.getElementById("loadingboxText")
        loadingboxText.textContent = (text == undefined ? "Chargement ..." : text)
        loadingbox.hidden = false
    },
    stop: () => {
        let loadingbox = document.getElementById("loadingbox")
        loadingbox.hidden = true
    },
    startFor: (msDuration, text=undefined) => {
        let loadingbox = document.getElementById("loadingbox")
        let loadingboxText = document.getElementById("loadingboxText")
        loadingboxText.textContent = (text == undefined ? "Chargement ..." : text)
        loadingbox.hidden = false
        setTimeout(() => {
            loadingbox.hidden = true
        }, msDuration)
    }
}


function startSession() {
    LoadingPage.startFor(3*1000, 'En attente de la session ...')
    setTimeout(() => {
        document.getElementById("loginbox").hidden = true
        document.getElementById("application").hidden = false
    })
}

function blobToDataURL(blob, callback) {
    var a = new FileReader();
    a.onload = function(e) {callback(e.target.result);}
    a.readAsDataURL(blob);
}

let GLOBAL_ = {
    rec: undefined
}

class new_Application {
    constructor() {
        this.records = []
        this.recordButton = document.getElementById("recordButton")
        this.currentlyRecording = false;
        this.startedRecordAt = Date.now()
        let that = this
        this.handlerFunction = (stream) => {
            GLOBAL_.rec = new MediaRecorder(stream);
            GLOBAL_.rec.ondataavailable = e => {
              this.TEMP_.audioChunks.push(e.data);
              if (GLOBAL_.rec.state == "inactive"){
                let blob = new Blob(this.TEMP_.audioChunks,{type:'audio/mp3'});
                this.appendNewRecord(blob)
                //recordedAudioDownloadButton.src = URL.createObjectURL(blob);
                this.TEMP_.sendData(blob)
                }
            }
        }
        this.TEMP_ = {
            sendData: (datas) => {},
        }

        function* recordCounter() {
            let c=0
            while(true) {
                c++
                yield c
            }
        }

        this.recordCounter = recordCounter()

    }


    clearRecords() {
        this.records = []
    }


    async appendNewRecord(blob) {

        let blobToDataUrl = await new Promise(r => {let a=new FileReader(); a.onload=r; a.readAsDataURL(blob)}).then(e => e.target.result);

        let audioUUID = `student-record-${BasicF.genHex(16)}`


        let currentNumber = this.recordCounter.next().value

        this.records.push({
            UUID: audioUUID,
            blob: blob,
            dataURL: blobToDataUrl,
            number: currentNumber
        })
        
        let audioList = document.getElementById("audioList")
        let newDivRecordItem = document.createElement("div")
        newDivRecordItem.id = audioUUID
        newDivRecordItem.className = "audio"

        let paragraphElem = document.createElement("p")
        paragraphElem.textContent = currentNumber
        paragraphElem.style = "padding: 3px;"


        let audioElem = document.createElement("audio")
        audioElem.src = URL.createObjectURL(blob);
        audioElem.controls=true;
        audioElem.autoplay=false;

        let selectButtonElem = document.createElement("button")
        selectButtonElem.className = "bcss-b-simple"
        selectButtonElem.textContent = "Choisir"

        let deleteButtonElem = document.createElement("button")
        deleteButtonElem.className = "bcss-b-simple-danger"
        deleteButtonElem.textContent = "Supprimer"
        deleteButtonElem.onclick = () => { Application.deleteAudio(audioUUID) }
        
        newDivRecordItem.appendChild(paragraphElem)
        newDivRecordItem.appendChild(audioElem)
        newDivRecordItem.appendChild(selectButtonElem)
        newDivRecordItem.appendChild(deleteButtonElem)
        audioList.appendChild(newDivRecordItem)
    }

    deleteAudio(UUID) {
        let audioElement = document.getElementById(UUID)
        let dataAudio = this.records.filter(x => { return x.UUID == UUID })[0]
        let confirmation = confirm(`Voulez vous vraiment supprimer l'audio n°${dataAudio.number} ? (action irréversible)`)
        if(confirmation) {
            console.log(`Audio supprimé:`,dataAudio, audioElement)
            audioElement.remove()
            this.records = this.records.filter(x => { return x.UUID != UUID})
        }
    }


    init() {
        navigator.mediaDevices.getUserMedia({audio:true})
        .then(stream => {this.handlerFunction(stream)})

        let recordTimer = document.getElementById("elapsedTime")
        setInterval(() => {
            if(this.currentlyRecording) {
                recordTimer.textContent = BasicF.formatTime(Date.now() - this.startedRecordAt, "hh:mm:ss")
            }
        }, 1000)
    }

    quit() {
        let confirmation = confirm("Vous allez quitter LaboFactice, tout ce qui n'as pas été enregistré / envoyé sera perdu !")
        if(confirmation) {
            window.close()
        }
    }


    toggleRecord() {
        console.log(this.recordButton)
        if(this.currentlyRecording) {
            this.stopRecord()
        } else {
            this.startNewRecord()
        }
    }

    startNewRecord() {
        console.log("Starting record.")
        this.currentlyRecording = true;
        this.recordButton.className = "bcss-b-simple-danger"
        this.recordButton.textContent = "Arrêter l'enregistrement"
        this.onclick = "Application.toggleRecord()"
        this.TEMP_.audioChunks = [];
        this.startedRecordAt = Date.now()
        GLOBAL_.rec.start();
    }

    stopRecord() {
        console.log("Stopping record.")
        this.currentlyRecording = false;
        this.recordButton.className = "bcss-b-simple"
        this.recordButton.textContent = "Commencer l'enregistrement"
        this.onclick = "Application.toggleRecord()"
        GLOBAL_.rec.stop();
    }
}


/*

test de focus vite fait, détect pas la perte de focus mais détecte si on est dans une autre app en plein écran

const isFocused = () => typeof document.hidden !== undefined ? !document.hidden : null;

// Call/Use it
isFocused();


*/

/*
PRODUCTION:

"window": {
    "resizable": false,
    "toolbar": false,
    "frame": false,
    "width": 10000,
    "height": 10000,
    "position": "center",
    "icon": "/application/icon.png"
}

*/
let Application = new new_Application()

Application.init()