
const fs = require("fs")
const { exec } = require('node:child_process');
var bonjour = require('bonjour')()

const config = JSON.parse(fs.readFileSync("./application/config.json","UTF-8"))
function saveConfig() {
    JSON.writeFileSync(`./application/config.json`, JSON.stringify(config, null, 4))
}

function openConfigFile() {
    let password = prompt(`Entrez le mot de passe Administrateur de LaboFactice:`)
    if(password == null) return;
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
        LoadingPageBackground.clear()
        LaboFactice.init()
        let loadingbox = document.getElementById("loadingbox")
        let loadingboxText = document.getElementById("loadingboxText")
        loadingboxText.textContent = (text == undefined ? "Chargement ..." : text)
        loadingbox.hidden = false
    },
    stop: () => {
        LoadingPageBackground.clear()
        let loadingbox = document.getElementById("loadingbox")
        loadingbox.hidden = true
    },
    startFor: (msDuration, text=undefined) => {
        LoadingPageBackground.clear()
        LaboFactice.init()
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

    login_firstname = document.getElementById("login_firstname")
    login_lastname = document.getElementById("login_lastname")
    login_birthday = document.getElementById("login_birthday")

    if(login_firstname.value =="") return alert("Tous les champs ne sont pas remplis !")
    if(login_lastname.value =="") return alert("Tous les champs ne sont pas remplis !")
    if(login_birthday.value =="") return alert("Tous les champs ne sont pas remplis !")

    let realDate = login_birthday.value.split("-").reverse().join("/")

    LoadingPage.start(3*1000, 'En attente de la session ...')

}
function blobToDataURL(blob, callback) {
    var a = new FileReader();
    a.onload = function(e) {callback(e.target.result);}
    a.readAsDataURL(blob);
}

let GLOBAL_ = {
    rec: undefined
}


class new_LoadingPageBackground {
    constructor() {
        this.element = document.getElementById("loadingboxCodeBackground")
    }
    clear() {
        this.element.innerHTML = ""
    }
    appendText(text) {
        let codeElem = document.createElement("p")
        codeElem.textContent = `${text}`
        this.element.appendChild(codeElem)
    }
    appendTextList(textList) {
        for(let i in textList) {
            this.appendText(textList[i])
        }
    }

}

let LoadingPageBackground = new new_LoadingPageBackground()

class new_Application {
    constructor() {
        this.initialized = false
        this.records = []
        this.selectedRecordUUID = null
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

        this.Bonjour_browser_getIpConfig = () => {
            console.warn("Bonjour browser not defined yet.")
            return { error: "Bonjour browser not defined yet." }
        }

    }


    startSession() {
        LoadingPage.stop()
        document.getElementById("loginbox").hidden = true
        document.getElementById("application").hidden = false
    }

    init() {

        let randomWaiting = {
            min: 50,
            max: 250
        }

        //let service = bonjour.publish({ name: 'My Web Server', type: 'http', port: 7890 })
        LoadingPageBackground.appendText(`Initializing Application.`)
        // await BasicF.sleep(BasicF.randFloat(randomWaiting.min,randomWaiting.max))
        LoadingPageBackground.appendText(`Starting Bonjour browser...`)
        // await BasicF.sleep(BasicF.randFloat(randomWaiting.min,randomWaiting.max))
        let browser = bonjour.findOne({type:"labo"})
        this.Bonjour_browser = browser
        this.Bonjour_browser_getIpConfig = () => {
            return {
                "name": browser.services[0].name,
                "type": browser.services[0].type,
                "ip": browser.services[0].referer.address,
                "port": browser.services[0].port,
            }
        }


        /*this.startSessionInterval = setInterval(() => {
            if()
        }, 1000);*/




        LoadingPageBackground.appendText(`  Done.`)
        // await BasicF.sleep(BasicF.randFloat(randomWaiting.min,randomWaiting.max))
        LoadingPageBackground.appendText(`  Requesting microphone usage...`)
        // await BasicF.sleep(BasicF.randFloat(randomWaiting.min,randomWaiting.max))
        navigator.mediaDevices.getUserMedia({audio:true})
        .then(stream => {
            LoadingPageBackground.appendText(`  Microphone usage get.`)
            this.handlerFunction(stream)
        }).catch(e => {
            console.log(e)
            LoadingPageBackground.appendText(`  Microphone usage cannot be ready. Error: ${e}`)
            LoadingPageBackground.appendText(`${e.stack.join("\n")}`)
        })
        // await BasicF.sleep(BasicF.randFloat(randomWaiting.min,randomWaiting.max))
        
        LoadingPageBackground.appendText(`Initializing timer for voice records...`)
        // await BasicF.sleep(BasicF.randFloat(randomWaiting.min,randomWaiting.max))
        let recordTimer = document.getElementById("elapsedTime")
        let recordTimer2 = document.getElementById("elapsedTime2")
        setInterval(() => {
            if(this.currentlyRecording) {
                let new_text = BasicF.formatTime(Date.now() - this.startedRecordAt, "hh:mm:ss")
                recordTimer.textContent = new_text
                recordTimer2.textContent = new_text
            }
        }, 1000)
        LoadingPageBackground.appendText(`  Done.`)
        // await BasicF.sleep(BasicF.randFloat(randomWaiting.min,randomWaiting.max))
        LoadingPageBackground.appendText(`Ended starting configuration. Now connecting to application.`)
        this.initialized = true
        
        // await BasicF.sleep(500)
        LoadingPage.stop()
    }

    clearRecords() {
        this.records = []
    }


    getRecordByUUID(UUID) {
        let r = this.records.filter(x => { return x.UUID == UUID})
        return r.length > 0 ? r[0] : null
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
        selectButtonElem.onclick = (event) => {
            let recordUUID = event.target.parentElement.id
            let the_record = LaboFactice.getRecordByUUID(recordUUID)
            let confirmation = confirm(`Choisir l'enregistrement ${the_record.number} ?`)
            if(!confirmation) return;
            let audioList = document.getElementById("audioList")
            for(let i in [...audioList.children]) {
                if(!audioList.children[i] || !audioList.children[i].className) continue;
                audioList.children[i].classList.remove("selected")
            }
            event.target.parentElement.classList.add("selected")
            this.selectedRecordUUID = `${recordUUID}`
        }

        let deleteButtonElem = document.createElement("button")
        deleteButtonElem.className = "bcss-b-simple-danger"
        deleteButtonElem.textContent = "Supprimer"
        deleteButtonElem.onclick = () => { LaboFactice.deleteAudio(audioUUID) }
        
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
            console.log(`[LaboFactice:deleteAudio()] Audio supprimé:`,dataAudio, audioElement)
            audioElement.remove()
            this.records = this.records.filter(x => { return x.UUID != UUID})
        }
        if(this.selectedRecordUUID == UUID) this.selectedRecordUUID = null
    }

    quit() {
        if(this.selectedRecordUUID == null) {
            return alert(`Vous devez selectionner une piste audio avant de quitter.`)
        }
        let confirmation = confirm("Vous allez quitter LaboFactice, tout ce qui n'as pas été enregistré / envoyé sera perdu !")
        if(confirmation) {
            window.close()
        }
    }


    toggleRecord() {
        console.log("[LaboFactice:toggleRecord()] ",this.recordButton)
        if(this.currentlyRecording) {
            this.stopRecord()
        } else {
            this.startNewRecord()
        }
    }

    startNewRecord() {
        console.log("[LaboFactice:startNewRecord()] Starting record.")
        this.currentlyRecording = true;
        this.recordButton.className = "bcss-b-simple-danger"
        this.recordButton.textContent = "Arrêter l'enregistrement"
        this.onclick = "LaboFactice.toggleRecord()"
        this.TEMP_.audioChunks = [];
        this.startedRecordAt = Date.now()
        try {
            GLOBAL_.rec.start();
            document.getElementById("elapsedTime_recordingDot").classList.add("active")
            document.getElementById("currentlyRecordingPopup").hidden = false
            document.getElementById("elapsedTime").textContent = "00:00:00"
            document.getElementById("elapsedTime2").textContent = "00:00:00"
        } catch(e) {
            alert(`An error occured: ${e}\nSee console for more details.\n\n${!this.initialized ? "Careful ! LaboFactice is not initalized yet !" : ""}`)
        }
    }

    stopRecord() {
        console.log("[LaboFactice:stopRecord()] Stopping record.")
        this.currentlyRecording = false;
        this.recordButton.className = "bcss-b-simple"
        this.recordButton.textContent = "Commencer l'enregistrement"
        this.onclick = "LaboFactice.toggleRecord()"
        try {
            GLOBAL_.rec.stop();
            document.getElementById("elapsedTime_recordingDot").classList.remove("active")
            document.getElementById("currentlyRecordingPopup").hidden = true
        } catch(e) {
            alert(`An error occured: ${e}\nSee console for more details.\n\n${!this.initialized ? "Careful ! LaboFactice is not initalized yet !" : ""}`)
        }
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
    "permissions": [
      "audio"
    ],
    "resizable": false,
    "toolbar": false,
    "frame": false,
    "width": 1000,
    "height": 1000,
    "position": "center",
    "icon": "/application/LaboFacticeLogo.ico"
  }

*/

let LaboFactice = new new_Application()
LaboFactice.init()