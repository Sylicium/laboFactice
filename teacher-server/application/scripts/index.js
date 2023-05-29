
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
    LaboFactice.startSession()

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
        this.initialized = false;
        this.Bonjour_service = undefined;
        let that = this
        this.lessons = []

        function* counter() {
            let c=0
            while(true) {
                c++
                yield c
            }
        }

        this.counter = counter()

    }


    startSession() {
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

        this.SOCKET_IO = _startServer()


        /*this.startSessionInterval = setInterval(() => {
            if()
        }, 1000);*/


        this.initialized = true
        
        LoadingPage.stop()
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
    }

    goToMenu() {
        let application = document.getElementById("application")
        let app = application.getElementsByClassName("app")[0]
        let menu = application.getElementsByClassName("menu")[0]
        app.hidden = true
        menu.hidden = false
    }


    loadLessons() {
        let lessons = JSON.parse(fs.readFileSync("./application/datas/lessons.json","UTF-8"))
        this.lessons = lessons
        this.refreshLessonsListDisplay()
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

        if(addLesson_lessonName.value =="") return alert("Tous les champs ne sont pas remplis !")
        if(addLesson_lessonYoutubeLink.value =="") return alert("Tous les champs ne sont pas remplis !")
        if(addLesson_lessonText.value =="") return alert("Tous les champs ne sont pas remplis !")
        
        let newLesson = {
            UUID: `${BasicF.genHex(6)}`,
            name: addLesson_lessonName.value,
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

    refreshLessonsListDisplay() {
        let lessonList = document.getElementById("lessonList")
        lessonList.innerHTML = `<div class="lesson">
        <div class="UUID">Identifiant</div>
        <div class="name">Nom de la leçon</div>
        <div class="youtubeLink">URL d'une vidéo youtube</div>
        <div class="text">Texte explicatif pour la leçon</div>
    </div>`



        
        for(let i in this.lessons) {
            let lessonElem = document.createElement("div")
            lessonElem.className = `lesson`
            lessonElem.id = `lesson-UUID-${this.lessons[i].UUID}`
            lessonElem.innerHTML = `
            <div class="UUID">${this.lessons[i].UUID}</div>
            <div class="name">${this.lessons[i].name}</div>
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

let LaboFactice = new new_Application()
LaboFactice.init()


