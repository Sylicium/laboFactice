
let LaboFactice

const fs = require("fs")
const { exec } = require('node:child_process');
var bonjour = require('bonjour')()

function saveConfig() {
    fs.writeFileSync(`./application/config.json`, JSON.stringify(config, null, 4))
}
let config;
try {
    config = JSON.parse(fs.readFileSync("./application/config.json","UTF-8"))
} catch(e) {
    config = {
        "adminPassword":"prof",
        "defaultSavePath": "{{USERPROFILE}}\\Documents\\LaboFactice\\",
        "teacherLogin": {
            "identifiant": "prof",
            "password": "prof"
        },
        "bonjourService": {
            "name": "LaboFacticeLan",
            "port": 7890,
            "type": "LaboFacticeLanServiceName"
        },
        "classPlaces": [
            {
                "computerName": "test",
                "x": 0,
                "y": 0
            }
        ]
    }
    saveConfig()
    BasicF.toast({type:"warn", svg:"warn", title: "Echec du chargement du fichier de configuration", content:`L'application n'a pas pu charger le fichier de configuration config.json. Le fichier a été donc été réinitialisé à un état par défaut.`, timeout: 15*1000})
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

window.addEventListener("DOMContentLoaded", () => {

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


function makeLogin() {

    login_identifiant = document.getElementById("login_identifiant")
    login_password = document.getElementById("login_password")

    if(login_identifiant.value =="") return alert("Tous les champs ne sont pas remplis !")
    if(login_password.value =="") return alert("Tous les champs ne sont pas remplis !")


    if(login_identifiant.value != config.teacherLogin.identifiant || login_password.value != config.teacherLogin.password) {
        return setTimeout(() => {
            alert("L'identifiant ou le mot de passe est incorrect.")
        },200)
    }

    LoadingPage.start('Chargement ...')
    LaboFactice.startApp()

}

let makeLoginKeyDown = e => e.code == "Enter" ? makeLogin() : ""


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
        this.ApplicationInfos = {
            name: "LaboFactice",
            version: "1.0.0-indev"
        }
        this.initialized = false;
        this.Bonjour_service = undefined;
        let that = this
        this.lessons = []
        this.currentLessonUUID = undefined

        function* counter() {
            let c=0
            while(true) {
                c++
                yield c
            }
        }

        this.counter = counter()

        this.connectedComputers = []

        this.CanvaComputersFunctions = {
            makeCanvaDraggable: (canvaElement) => {
                if(!canvaElement || typeof canvaElement != 'object' || !canvaElement.className) return BasicF.toastError(new Error(`canvaElement must be type of DOM element.`))
                for(let i in [...canvaElement.children]) {
                    let e = [...canvaElement.children][i]
                    if(!e || !e.className) continue;
                    BasicF.setElementDraggable(e, true)
                }
                BasicF.toast({
                    type: "info",
                    title: "La carte peut maintenant être modifiée.",
                })
            },
            stopCanvaDraggable: (canvaElement, doSaving) => {
                if(!canvaElement || typeof canvaElement != 'object' || !canvaElement.className) return BasicF.toastError(new Error(`canvaElement must be type of DOM element.`))
                for(let i in [...canvaElement.children]) {
                    let e = [...canvaElement.children][i]
                    BasicF.setElementDraggable(e, false)
                }
                BasicF.toast({
                    type: "info",
                    title: "La carte ne peut plus être modifiée.",
                    svg: "warn"
                })
            
                if(doSaving) {
                    try {
                        config.classPlaces = JSON.parse(JSON.stringify(LaboFactice.CanvaComputersFunctions.canvaElementsToObjectList(canvaElement)))
                        saveConfig()
                        BasicF.toast({
                            type: "success",
                            title: "Emplacements enregistrés."
                        })
                    } catch(e) {
                        BasicF.toastError(e)
                    }
                }
            },
            redrawCanva: (canvaElement) => {
                if(!canvaElement || typeof canvaElement != 'object' || !canvaElement.className) return BasicF.toastError(new Error(`canvaElement must be type of DOM element.`))
                canvaElement.innerHTML = ""
                for(let i in config.classPlaces) {
                    let computer = config.classPlaces[i]
                    let the_computer_elem = document.createElement("div")
                    the_computer_elem.id = `canvaComputer_Name_${computer.computerName}`
                    the_computer_elem.className = "computer hovertext noselect"
                    the_computer_elem.innerHTML = `${computer.number}<div class="content">
                    <span><span class="studentLastname">Loading</span> <span class="studentFirstname">...</span></span>
                    <span class="recordBar recording"><span class="recordTime">00:00:00</span> <span class="inRecordMention">• (Recording)</span></span>
                    <span><span class="recordCount">0</span> Enregistrements</span>
                    <span><span class="computerName">PC: ${computer.computerName}</span></span>
                </div>
                <div class="msgBubble">💬</div>*
                <div class="callTeacher">🤚</div>`
                    the_computer_elem.style = `top:${computer.top}px;left:${computer.left}px;`
                    if(canvaElement.height < computer.top || canvaElement.width < computer.left) {
                        BasicF.toast({
                            type:"warn",
                            title: `Placement invalide`,
                            content: `L'élément '${computer.computerName}' a un placement de [top:${computer.top}px;left:${computer.left}px;] ce qui exède la taille limite du conteneur (${canvaElement.height}x${canvaElement.width})`,
                            timeout: 30*1000,
                            svg: "warn"
                        })
                        Logger.warn(`L'élément '${computer.computerName}' a un placement de [top:${computer.top}px;left:${computer.left}px;] ce qui exède la taille limite du conteneur (${canvaElement.height}x${canvaElement.width})`)
                    }
                    canvaElement.appendChild(the_computer_elem)
                }
        
            },
            canvaElementsToObjectList: (canvaElement) => {
                if(!canvaElement || typeof canvaElement != 'object' || !canvaElement.className) return BasicF.toastError(new Error(`canvaElement must be type of DOM element.`))
                let Obj = []
                /*for(let i in [...canvaElement.children]) {
                    let e = [...canvaElement.children][i]
                    if(!e || !e.className) continue;
                    Obj.push({
                        "id": parseInt(),
                        "computerName": `${e.id.replace("canvaComputer_Name_","")}`,
                        "top": parseInt(e.style.top),
                        "left": parseInt(e.style.left),
                    })
                }*/
                for(let i in config.classPlaces) {
                    let computer = config.classPlaces[i]
                    let elem = document.getElementById(`canvaComputer_Name_${computer.computerName}`)
                    let temp = JSON.parse(JSON.stringify(config.classPlaces[i]))
                    if(!elem || typeof parseInt(elem.style.top) != 'number' || typeof parseInt(elem.style.left) != 'number') {
                        BasicF.toast({
                            type:"warn",
                            title: `Erreur lors de l'enregistrement de ${computer.computerName}`,
                            content: `Il est possible que l'ordinateur n'existe plus sur l'interface. Essayez de relancer l'application. Si le problème persiste contactez le développeur.`,
                            timeout: 7*1000,
                        })
                        Obj.push(temp)
                        continue;
                    }
                    temp.top = parseInt(elem.style.top) ?? 0
                    temp.left = parseInt(elem.style.left) ?? 0
                    Obj.push(temp)
                }
                return Obj
            }
        }

    }


    startApp() {
        LoadingPage.stop()
        document.getElementById("loginbox").hidden = true
        document.getElementById("application").hidden = false
    }

    init() {
        this.loadLessons()

        let randomWaiting = {
            min: 50,
            max: 250
        }

        let service = bonjour.publish({ name: config.bonjourService.name, type: config.bonjourService.type, port: config.bonjourService.port })
        service.start()
        this.Bonjour_service = service

        // this.SOCKET_IO = _startServer()

        this.initialized = true
        
        LoadingPage.stop()
        ApplicationLoadingToast.remove()
        BasicF.toast({ type:"success", svg:"success", title: "Chargement terminé", content: `Merci d'utiliser LaboFactice !\nDéveloppé par Sylicium`, autoHide:true, timeout: 5000})


        this.refreshConnectedUsersList_listElement_interval = setInterval(() => {
            try {
                let elem = document.getElementById("connectedUsersList_tbody")
                elem.innerHTML = ""
                let the_html = ``
                for(let i in this.connectedComputers) {}
            } catch(e){
                console.log(e)
            }
        }, 2000)

    }
    
    getName() { return this.ApplicationInfos.name}

    quit() {
        if(this.selectedRecordUUID == null) {
            return alert(`Vous devez selectionner une piste audio avant de quitter.`)
        }
        let confirmation = confirm("Vous allez quitter LaboFactice, tout ce qui n'as pas été enregistré / envoyé sera perdu !")
        if(confirmation) {
            window.close()
        }
    }

    setConnectedComputers(connectedComputersObject) {
        this.connectedComputers = connectedComputersObject
    }
    exportConnectedComputersToList() {
        function* counter() {
            let c=0
            while(true) {
                c++
                yield c
            }
        }
        let countr = counter()
        let l = []
        for(let i in this.connectedComputers) {
            let obj = this.connectedComputers[i]
            l.push({
                "number": countr.next().value,
                "computerName": obj.computerName,
                "top": 0,
                "left": 0
            })
        }
        return l
    }

    importConnectedComputersAndSave() {
        let confirmation = confirm(`Attention, cette action remplacera tous les postes précédemment enregistrés ainsi que leurs emplacement dans la salle. Êtes vous sûr de vouloir continuer.`)
        if(!confirmation) return;
        try {
            let list = this.exportConnectedComputersToList()
            config.classPlaces = list
            saveConfig()
            // Now refreshing canva
            LaboFactice.CanvaComputersFunctions.redrawCanva(document.getElementById("inSession_computer_canva"))
            BasicF.toast({
                type: "success",
                title: "La configuration a été remplacée avec succès.",
            })
        } catch(e) {
            BasicF.toastError(e)
        }
        
    }

    selectMenu(name) {
        let application_menu = document.getElementById("application").getElementsByClassName("menu")[0]
        application_menu.hidden = true
        let application = document.getElementById("application")
        application.hidden = false
        let app = application.getElementsByClassName("app")[0]
        app.hidden = false
        for(let i in [...app.children]) {
            if(!app.children[i] || !app.children[i].className ) continue;
            if(app.children[i].classList.contains(name)) {
                app.children[i].hidden = false
            } else {
                app.children[i].hidden = true
            }
        }
        if(name == "startSession") {
            this.refreshLessonsListDisplay_byElementID("lessonList_startSession", {
                btnDelete: false,
                onclickLesson: (UUID) => {
                    this.startSession(UUID)
                }
            })
        }
        if(name == "inSession") {
            LaboFactice.CanvaComputersFunctions.redrawCanva(
                document.getElementById("inSession_computer_canva")
            )
        }
    }

    goToMenu() {
        let application = document.getElementById("application")
        let app = application.getElementsByClassName("app")[0]
        let menu = application.getElementsByClassName("menu")[0]
        app.hidden = true
        menu.hidden = false
    }

    displayComputerNamePages() {
        LaboFactice.SOCKET_IO.sockets.emit('LaboFactice_displayComputerNamePage', config.classPlaces)
    }

    startSession(lessonUUID) {
        let lesson;
        try {
            lesson = this.lessons.filter(x => x.UUID == lessonUUID)[0]
            if(!lesson) {
                console.log(`Application.startSession(): lesson list (tried to find ${lessonUUID}):`, JSON.parse(JSON.stringify(this.lessons)))
                return BasicF.toastError(new Error(`Application.startSession(): Cannot find lesson with ID '${lessonUUID}'.`))
            }
        } catch(e) {
            return BasicF.toastError(e)
        }
        console.log(`Starting server/session with lessons data=`,lesson)

        this.currentLessonUUID = lessonUUID

        if(this.SOCKET_IO != undefined) {
            BasicF.toast({
                type: "error",
                svg: "error",
                title: "Serveur socket.io déjà connecté.",
                content: `Impossible de démarrer le serveur socket.io car il est déjà démarré.`
            })
        } else {
            try {
                this.SOCKET_IO = _startServer(LaboFactice, {
                    lessonDatas: lesson,
                    port: config.bonjourService.port
                })
                BasicF.toast({
                    type: "success",
                    svg: "success",
                    title: "Session démarrée.",
                    content: `port=${config.bonjourService.port}`,
                    timeout: 30*1000,
                })
                this.selectMenu("inSession")
            } catch(e) {
                BasicF.toastError(e)
            }
        }
        
    }

    stopSession() {
        let num = NaN
        let the_prompt = prompt("Dans combien de seconde voulez vous que la session se coupe ?\nQuand la session session se coupe toutes les données non enregistrées par les utilisateurs seront définitivement perdues.")
        num = parseInt(the_prompt)
        while(num == NaN) {
            BasicF.toast({
                type: "error",
                title: "Valeur invalide",
                content: `La valeur renseignée n'est pas un nombre de seconde valide.`,
                timeout: 10*1000,
            })
            let the_prompt = prompt("Dans combien de seconde voulez vous que la session se coupe ?\nQuand la session session se coupe toutes les données non enregistrées par les utilisateurs seront définitivement perdues.")
            num = parseInt(the_prompt)
            if(num > 300) {
                if(!confirm(`Le nombre de seconde renseigné équivaut à ${BasicF.formatTime(num*1000, "hhhmmmsss")}, êtes vous sûr ?`)) {
                    num = NaN
                }
            }
            if(num < 30) {
                if(!confirm(`Le nombre de seconde renseigné est inférieur à 30 secondes (${BasicF.formatTime(num*1000, "sss")}), êtes vous sûr ?`)) {
                    num = NaN
                }
            }
        }

        this.SOCKET_IO.emit("LaboFactive_stopSession", {
            timestamp: Date.now(),
            secondsBeforeEnd: num,
            endTimestamp: Date.now() + num*1000
        })
    }

    realTimeUpdate(datas) {
        /*
        datas = {
            computerName: string,
            isDisconnected: boolean,
            windowHasFocus: boolean,
            loginInformations: {
                logged: logged, // boolean
                firstname: firstname, // string
                lastname: lastname, // string
                birthday: birthday, // string "JJ/MM/AAAAA"
            },
            inSession: boolean
            recording: boolean
            recordTime: "00:00:00
            recordCount"
        }
        */
        try {
            console.log("update:",datas)

            let computer = config.classPlaces.filter(x => { return x.computerName == datas.computerName})
            if(computer.length == 0) {
                Logger.warn(`[Application.realTimeUpdate()]: Failed updating computer '${datas.computerName}': Computer not in list. Try doing a new export of connected computers.`)
                return;
            }
            computer = computer[0]

            console.log("computer:",computer)

            let computerElement = document.getElementById(`canvaComputer_Name_${computer.computerName}`)
            if(!computerElement || (!computerElement.className && computerElement.className != "")) {
                Logger.debug(`Realtime update failed. Datas:`,datas)
                return BasicF.toast({
                    type: "warn",
                    title: "Realtime update failed",
                    content: `Computer: ${computer.computerName}.`
                })
            }

            if(datas.isDisconnected == true) { // datas et pas computer car le computer est stocké ici alors que le datas est envoyé du serveur.
                computerElement.classList.remove("status__connected")
                computerElement.classList.remove("status__unfocused")
                computerElement.classList.remove("status__recording")
                computerElement.classList.add("status__none")
                return;
            }
            
            if(datas.windowHasFocus) { computerElement.classList.remove("status__unfocused")
            } else { computerElement.classList.add("status__unfocused") }

            if(!datas.recording) { computerElement.classList.remove("status__recording")
            } else { computerElement.classList.add("status__recording") }

            if(!datas.inSession) { computerElement.classList.remove("status__connected")
            } else { computerElement.classList.add("status__connected") }

            let content = computerElement.getElementsByClassName("content")[0]
            content.getElementsByClassName("studentLastname")[0].textContent = datas.loginInformations.lastname
            content.getElementsByClassName("studentFirstname")[0].textContent = datas.loginInformations.firstname
            content.getElementsByClassName("computerName")[0].textContent = datas.computerName
            content.getElementsByClassName("recordCount")[0].textContent = datas.recordCount
            content.getElementsByClassName("recordTime")[0].textContent = datas.recordTime ?? "00:00:00"

        } catch(e) {
            BasicF.toastError(e)
        }
        
    }

    loadLessons() {
        let path = "./application/datas/lessons.json"
        try {
            let lessons = JSON.parse(fs.readFileSync(path,"UTF-8"))
            this.lessons = lessons
            this.refreshLessonsListDisplay()
        } catch(e) {
            this.lessons = []
            BasicF.toast({ type:"warn", svg:"warn", title: "Impossible de charger les leçons", content:`${LaboFactice.getName()} n'as pas pu charger les leçons du fichier ${path}.\nLe fichier a été vidé puis recréé.`, timeout: 15*1000})
            this.saveLessons()
            this.refreshLessonsListDisplay()
        }
    }

    saveLessons() {
        fs.writeFileSync(`./application/datas/lessons.json`, JSON.stringify(this.lessons, null, 4))
    }


    openAddLeconPopup() {
        document.getElementById("addLesson").hidden = false
    }
    closeAddLeconPopup() {
        document.getElementById("addLesson").hidden = true
    }

    sendAddLesson() {

        let addLesson_lessonName = document.getElementById("addLesson_lessonName")
        let addLesson_lessonYoutubeLink = document.getElementById("addLesson_lessonYoutubeLink")
        let addLesson_lessonText = document.getElementById("addLesson_lessonText")
        let addLesson_lessonClassName = document.getElementById("addLesson_lessonClassName")

        if(addLesson_lessonName.value =="") return alert("Tous les champs ne sont pas remplis !")
        if(addLesson_lessonYoutubeLink.value == "") return alert("Tous les champs ne sont pas remplis !")
        if(addLesson_lessonText.value == "") return alert("Tous les champs ne sont pas remplis !")
        // if(addLesson_lessonClassName == "") addLesson_lessonClassName = ""
        
        let newLesson = {
            UUID: `${BasicF.genHex(6)}`,
            name: addLesson_lessonName.value,
            class: `${addLesson_lessonClassName.value}`,
            youtubeLink: addLesson_lessonYoutubeLink.value,
            text: addLesson_lessonText.value,
        }

        console.log("this.lessons",this.lessons)
        console.log("newLesson",newLesson)
        this.lessons.push(newLesson)
        this.closeAddLeconPopup()
        this.refreshLessonsListDisplay()

        setTimeout(() => { this.saveLessons() }, 250)
        

    }
    removeLessonByUUID(UUID) {
        let elem = document.getElementById(`lesson-UUID-${UUID}`)
        elem.remove()
        this.lessons = this.lessons.filter(x => { return x.UUID != UUID})
        this.saveLessons()
        this.refreshLessonsListDisplay()
    }
    removeLessonByElement(elem) {
        let UUID = elem.parentElement.getElementsByClassName("UUID")[0].textContent
        let confirmation = confirm(`Voulez vous vraiment supprimer la lesson ${UUID} ?`)
        if(!confirmation) return;
        this.removeLessonByUUID(UUID)
    }


    refreshLessonsListDisplay_byElementID(elementID=undefined, options={ btnDelete: false,onclickLesson:(lessonElement) =>{} }) {
        /*

        options: {
            btnDelete: false,
            onclickLesson: (lessonElement) => {}
        }
        */
        let lessonList;
        try {
            lessonList = elementID == undefined ? null : document.getElementById(`${elementID}`)
            if(!lessonList) return BasicF.toastError(new Error(`Application.refreshLessonsListDisplay_byElementID(): Element not found with ID: ${elementID}`))
        } catch(e) {
            return BasicF.toastError(e)
        }

        lessonList.innerHTML = `<div class="lesson lessonHeader">
        <div class="UUID">Identifiant</div>
        <div class="name">Nom de la leçon</div>
        <div class="class">Classe</div>
        <div class="youtubeLink">URL d'une vidéo youtube</div>
        <div class="text">Texte explicatif pour la leçon</div>
    </div>`
        
        for(let i in this.lessons) {
            let lessonElem = document.createElement("div")
            lessonElem.className = `lesson bcss-noselect`
            lessonElem.onclick = (pointerEvent) => { return options.onclickLesson(this.lessons[i].UUID) }
            lessonElem.id = `lesson-UUID-${this.lessons[i].UUID}`
            lessonElem.innerHTML = `
            <div class="UUID">${this.lessons[i].UUID}</div>
            <div class="name">${this.lessons[i].name}</div>
            <div class="class">${this.lessons[i].class}</div>
            <div class="youtubeLink"><a target="_BLANK" href="${this.lessons[i].youtubeLink}">${this.lessons[i].youtubeLink}</a></div>
            <div class="text">${this.lessons[i].text}</div>
            ${options.btnDelete ? `<button class="bcss-b-simple-danger" onclick='LaboFactice.removeLessonByElement(this)'>Supprimer</button>` : ""}`
            lessonList.appendChild(lessonElem)
        }
    }

    refreshLessonsListDisplay() {
        let lessonList = document.getElementById("lessonList")

        lessonList.innerHTML = `<div class="lesson lessonHeader">
        <div class="UUID">Identifiant</div>
        <div class="name">Nom de la leçon</div>
        <div class="class">Classe</div>
        <div class="youtubeLink">URL d'une vidéo youtube</div>
        <div class="text">Texte explicatif pour la leçon</div>
    </div>`
        
        for(let i in this.lessons) {
            let lessonElem = document.createElement("div")
            lessonElem.className = `lesson bcss-noselect`
            lessonElem.id = `lesson-UUID-${this.lessons[i].UUID}`
            lessonElem.innerHTML = `
            <div class="UUID">${this.lessons[i].UUID}</div>
            <div class="name">${this.lessons[i].name}</div>
            <div class="class">${this.lessons[i].class}</div>
            <div class="youtubeLink"><a target="_BLANK" href="${this.lessons[i].youtubeLink}">${this.lessons[i].youtubeLink}</a></div>
            <div class="text">${this.lessons[i].text}</div>
            <button class="bcss-b-simple-danger" onclick='LaboFactice.removeLessonByElement(this)'>Supprimer</button>`
            lessonList.appendChild(lessonElem)
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

LaboFactice = new new_Application()


let ApplicationLoadingToast = BasicF.toast({ type:"loading", svg:"loading", title: "Chargement de l'application", content: `Merci d'utiliser LaboFactice !\nDéveloppé par Sylicium`, autoHide:false, timeout: 0})
LaboFactice.init()


}) /* window on load. no script outside */


