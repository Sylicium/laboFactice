
const fs = require("fs")
const { exec } = require('node:child_process');
var bonjour = require('bonjour')()

const config = JSON.parse(fs.readFileSync("./application/config.json","UTF-8"))
function saveConfig() {
    fs.writeFileSync(`./application/config.json`, JSON.stringify(config, null, 4))
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


setInterval(() => {
    document.getElementById("inSession_currentDate").textContent = BasicF.formatDate(Date.now(), "DDDDD DD/MM/YYYY")
    document.getElementById("inSession_currentTime").textContent = BasicF.formatDate(Date.now(), "hh:mm:ss")
}, 1000)


let LoadingPage = {
    start: (text=undefined) => {
        //LoadingPageBackground.clear()
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
        //LoadingPageBackground.clear()
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


function blobToDataURL(blob, callback) {
    var a = new FileReader();
    a.onload = function(e) {callback(e.target.result);}
    a.readAsDataURL(blob);
}
async function dataURLToBlob(dataURI) {
    return await (await fetch(dataURI)).blob(); 
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
        this.element.scrollTop = this.element.scrollHeight;
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
        this.maxRecordCount = 5
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

        this.loginInformations = {
            logged: false,
            firstname: null,
            lastname: null,
            birthday: null,
        }
        this.sessionAlreadyStarted = false
        this.callingTeacher = false
        
        BasicF.Cooldowns.create("sendTchatMessage_z8mA0d21k", 1200)

    }

    getLoginInformations() {
        return JSON.parse(JSON.stringify(this.loginInformations))
    }


    startSession() {
        if(this.sessionAlreadyStarted == true) return;
        if(this.loginInformations.logged == false) {
            setTimeout(() => {
                this.startSession()
            }, 500)
            return;
        }
        this.sessionAlreadyStarted = true;
        console.log("starting session")
        LoadingPage.stop()
        document.getElementById("loginbox").hidden = true
        document.getElementById("application").hidden = false
    }


    async endSession(datas) {
        /* datas: {
            timeOut?: ms,
            lesson: {}
        }
        */
        try {
            BasicF.toast({
                type: "warn",
                title: `Fermeture de l'application.`,
                content: `L'application va se fermer dans ${BasicF.formatTime(datas.timeOut, "hh heures mm minutes et ss secondes.")}`,
                svg: "info",
                timeout: datas.timeOut ?? 10*1000,
            })
            await BasicF.sleep(datas.timeOut ?? 0)
            let recordToSend = {};
            if(this.records.length > 0) {
                let last_record = JSON.parse(JSON.stringify(this.records[this.records.length-1]))
                let selectedRecordDatas = LaboFactice.records.filter(x => x.UUID == LaboFactice.selectedRecordUUID)
                if(selectedRecordDatas.length > 0) {
                    recordToSend = selectedRecordDatas[0]
                } else {
                    recordToSend = last_record
                }
            }
            await this.SOCKET_IO.emit(`LaboFactice_sendMyRecord`, {
                lesson: datas.lesson,
                loginInformations: this.loginInformations,
                record: recordToSend,
                recordsCount: this.records.length
            })

            BasicF.toast({
                type: "warn",
                title: "Fermeture de l'application.",
                content: "L'application va se fermer."
            })

            setTimeout(() => {  
                window.close()
            }, 1.5*1000)
            
        } catch(e) {
            BasicF.toastError(e)
        }

    }


    displayComputerNamePage(computerNumber) {
        console.log("displayComputerNamePage !!!")
        let systemOS = require("os")
        document.getElementById("infoboxComputerName").hidden = false
        document.getElementById("infoboxComputerName_computerName").textContent = `${systemOS.hostname()}`
        document.getElementById("infoboxComputerName_computerNumber").textContent = `${computerNumber}`
    }

    async init() {

        let randomWaiting = {
            min: 50,
            max: 250
        }

        //let service = bonjour.publish({ name: 'My Web Server', type: 'http', port: 7890 })
        LoadingPageBackground.appendText(`Initializing Application.`)
        // await BasicF.sleep(BasicF.randFloat(randomWaiting.min,randomWaiting.max))
        LoadingPageBackground.appendText(`Starting Bonjour browser...`)
        // await BasicF.sleep(BasicF.randFloat(randomWaiting.min,randomWaiting.max))
        let browser = bonjour.findOne({ type: config.bonjourService.type })
        await BasicF.sleep(200)
        this.Bonjour_browser = browser
        this.Bonjour_browser_getIpConfig = () => {
            console.log("browser.services[0]:",browser.services, config.bonjourService.type)
            return {
                "name": browser.services[0].name,
                "type": browser.services[0].type,
                "ip": browser.services[0].referer.address,
                "port": browser.services[0].port,
                "hostname": browser.services[0].host
            }
        }
        try {
            this.SOCKET_IO = _startClient(LaboFactice, this.Bonjour_browser_getIpConfig())
        } catch(e) {
            LoadingPageBackground.appendText(`Crashed while initializing LaboFactice: ${e}`)
            await BasicF.sleep(500)
            console.log("Crashed during LaboFactice init()")
            console.log(e)
            setTimeout(() => {
                this.init()
            }, 1500)
            LoadingPage.start("En attente du poste prof ...")
            return;
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
                this.recordTimeFormated_temp = new_text
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
        document.getElementById("loginbox").hidden = false
    }

    makeLogin() {

        let login_firstname = document.getElementById("login_firstname")
        let login_lastname = document.getElementById("login_lastname")
        let login_birthday = document.getElementById("login_birthday")
    
        if(login_firstname.value =="") return alert("Tous les champs ne sont pas remplis !")
        if(login_lastname.value =="") return alert("Tous les champs ne sont pas remplis !")
        if(login_birthday.value =="") return alert("Tous les champs ne sont pas remplis !")
    
        let realDate = login_birthday.value.split("-").reverse().join("/")
    
        this.loginInformations = {
            logged: true,
            firstname: login_firstname.value,
            lastname: login_lastname.value,
            birthday: `${realDate}`,
        }
    
        LoadingPageBackground.clear()
        LoadingPage.start('En attente de la session ...')
    
    }

    clearRecords() {
        this.records = []
    }

    loadLesson(lessonDatas) {
        /*
        {
            "UUID": "17fda8",
            "name": "zefzef",
            "class": "Premiere STMG",
            "youtubeLink": "rth",
            "text": "rth"
        }
        */

        let app_left_video_listElements = document.getElementById("app_left_video_listElements")
        app_left_video_listElements.innerHTML = ""
        try {
            let youtubeVideoIdRegex = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/
            let youtubeVideoId = lessonDatas.youtubeLink.match(youtubeVideoIdRegex)[1]
            if(youtubeVideoId) {
                let video = document.createElement("iframe")
                video.className = "video"
                video.src = `https://www.youtube-nocookie.com/embed/${youtubeVideoId}`
                //video.style = "width:560px;height:315px;"
                video.frameborder = "0"
                video.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                video.frameborder = "0"
                //video.allowfullscreen = "true"
                video.setAttribute('allowFullScreen', '')

                app_left_video_listElements.appendChild(video)
            }
        } catch(e) {
            Logger.warn(e)
            /*
            document.getElementById("inSession_video1").src = lessonDatas.youtubeLink
            */
        }
        document.getElementById("inSession_className").textContent = lessonDatas.class
        document.getElementById("inSession_exerciceText").textContent = lessonDatas.text
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

    async quit() {
        if(this.selectedRecordUUID == null) {
            return alert(`Vous devez selectionner une piste audio avant de quitter.`)
        }
        let confirmation = confirm("Vous allez quitter LaboFactice, tout ce qui n'as pas été enregistré / envoyé sera perdu !")
        if(confirmation) {
            try {
                let selectedRecordDatas = LaboFactice.records.filter(x => x.UUID == LaboFactice.selectedRecordUUID)[0]
                
                
                /*
                fs.writeFileSync(`${process.env.USERPROFILE}\\Desktop\\LaboFactice_${BasicF.formatDate(Date.now(), 'DD-MM-YYYY_hhhmmmsss.txt')}`, JSON.stringify({
                    loginInformations: this.loginInformations,
                    record: selectedRecordDatas
                }))
                */

                this.downloadFromBlob(await dataURLToBlob(selectedRecordDatas.dataURL),`LaboFactice_${this.loginInformations.lastname}_${this.loginInformations.firstname}_${BasicF.formatDate(Date.now(), 'DD-MM-YYYY_hhhmmmsss.mp3')}`)

                await this.SOCKET_IO.emit(`LaboFactice_sendMyRecord`, selectedRecordDatas)
                setTimeout(() => {
                    window.close()
                }, 3*1000)
            } catch(e) {
                BasicF.toastError(e)
                BasicF.toast({
                    type: "warn",
                    title: "Erreur d'envoie au professeur",
                    content: "L'envoie de l'enregistrement a échoué. Les enregistrements ont été sauvegardés sur le Bureau.\nL'application va se fermer dans 10 secondes.",
                    hideProgressBar: true,
                    autoHide: false
                })
                fs.writeFileSync(`${process.env.USERPROFILE}\\Desktop\\LaboFactice_saveError${BasicF.formatDate(Date.now(), 'DD-MM-YYYY_hhhmmmsss.txt')}`, JSON.stringify({
                    loginInformations: this.loginInformations,
                    selectedRecordUUID: this.selectedRecordUUID,
                    records: this.records
                }))
                this.downloadFromBlob(await dataURLToBlob(the_datas.dataURL),`LaboFactice_${this.loginInformations.lastname}_${this.loginInformations.firstname}_${BasicF.formatDate(Date.now(), 'DD-MM-YYYY_hhhmmmsss.mp3')}`)
                setTimeout(() => {
                    window.close()
                }, 10*1000)
                
            }
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
        if(this.records.length == this.maxRecordCount) return BasicF.toast({
            type: "warn",
            title: `Nombre maximum d'enregistrement atteint: ${this.maxRecordCount}`,
            content: `Supprimez des enregistrements avant d'en enregistrer de nouveau.`
        })
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
        this.recordTimeFormated_temp = "00:00:00"
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

    downloadFromBlob(blob, name = 'file.mp3') {
        // Convert your blob into a Blob URL (a special url that points to an object in the browser's memory)
        const blobUrl = URL.createObjectURL(blob);
      
        // Create a link element
        const link = document.createElement("a");
      
        // Set link's href to point to the Blob URL
        link.href = blobUrl;
        link.download = name;
      
        // Append link to the body
        document.body.appendChild(link);
      
        // Dispatch click event on the link
        // This is necessary as link.click() does not work on the latest firefox
        link.dispatchEvent(
          new MouseEvent('click', { 
            bubbles: true, 
            cancelable: true, 
            view: window 
          })
        );
      
        // Remove link from body
        document.body.removeChild(link);
    }



    sendTchatMessage(event) {
        if(event.code != "Enter") return;
        let inputElement = document.getElementById("inSession_tchatInput")
        if(inputElement.value.length == 0) return;

        let cooldown = BasicF.Cooldowns.use("sendTchatMessage_z8mA0d21k")
        if(!cooldown.use) {
            return BasicF.toast({
                type: "warn",
                title: `Ralentissez entre les actions !`,
                content: `Attendez encore ${(cooldown.remaining/1000).toFixed(1)}s`
            })
        }

        let tchatContent = document.getElementById("inSession_tchat_content")

        let new_message = document.createElement("div")
        new_message.className = "message message_me"
        new_message.innerHTML = `<div class="username">Vous<span style="font-weight:100;"> | ${BasicF.formatDate(Date.now(), "hh:mm:ss")}</span></div>
            <div class="msg_content"></div>`
        new_message.getElementsByClassName("msg_content")[0].textContent = inputElement.value
        
        tchatContent.appendChild(new_message)
        tchatContent.scrollTo(0,10000);

        inputElement.value = ""
        
        
    }


    callTeacher(toggleTo=undefined) {
        let callButtonElem = document.getElementById("callTeacherButton")
        if(toggleTo == true) {
            callButtonElem.textContent = "Appeller le professeur"
            callButtonElem.classList.remove("active")
            return this.callingTeacher = false
        } else if(toggleTo == false) {
            callButtonElem.textContent = "🔊 Professeur appellé"
            callButtonElem.classList.add("active")
            return this.callingTeacher = true
        } else {
            if(callButtonElem.classList.contains("active")) {
                callButtonElem.textContent = "Appeller le professeur"
                callButtonElem.classList.remove("active")
                return this.callingTeacher = false
            } else {
                callButtonElem.textContent = "🔊 Professeur appellé"
                callButtonElem.classList.add("active")
                return this.callingTeacher = true
            }
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
    "fullscreen": true,
    "position": "center",
    "icon": "/application/LaboFacticeLogo.ico"
  }

*/

let LaboFactice = new new_Application()
LaboFactice.init()