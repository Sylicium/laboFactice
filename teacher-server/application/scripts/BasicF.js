

let BasicF;
try {


Logger.log(`[BasicFunctions] Loading module.`)

class Emitter {
    constructor() {
        this.eventsNames = {}
        
        this.on = (callName, callback_f) => {
            if(typeof callback_f != 'function') throw new Error("Callback must must type of 'function'.")
            if(this.eventsNames[callName] == undefined) this.eventsNames[callName] = []
            this.eventsNames[callName].push(callback_f)
        }
        this.emit = (callName, datas) => {
            if(this.eventsNames[callName] == undefined) return;
            for(let i in this.eventsNames[callName]) {
                try { this.eventsNames[callName][i](datas) } catch(e) { console.log(e) }
            }
        }
        this.removeListeners = (callName) => (this.eventsNames[callName] = [])
        this.removeAllListeners = (callName) => (this.eventsNames = {})
        this.countListeners = (callName) => (this.eventsNames[callName] != undefined ? this.eventsNames[callName].length : 0)
    }
}

class the_BasicFunctions {
    constructor() {
        this._datas = {
            html: {
                icons: {
                    info:`<svg class="toast_icons" style="color:#2db7f5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>`,
                    success:`<svg class="toast_icons" style="color:#19be6b;color:#008800;"  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>`,
                    warn:`<svg class="toast_icons" style="color:#ff9900;color:#FFF000" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>`,
                    error:`<svg class="toast_icons" style="color:#ed4014;color:#7a0000" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    </svg>`,
                    loading: `<svg class="toast_icons toast_icons_loadingcss" style="color:#2db7f5" xmlns="http://www.w3.org/2000/svg" class="loading" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M9.504 1.132a1 1 0 01.992 0l1.75 1a1 1 0 11-.992 1.736L10 3.152l-1.254.716a1 1 0 11-.992-1.736l1.75-1zM5.618 4.504a1 1 0 01-.372 1.364L5.016 6l.23.132a1 1 0 11-.992 1.736L4 7.723V8a1 1 0 01-2 0V6a.996.996 0 01.52-.878l1.734-.99a1 1 0 011.364.372zm8.764 0a1 1 0 011.364-.372l1.733.99A1.002 1.002 0 0118 6v2a1 1 0 11-2 0v-.277l-.254.145a1 1 0 11-.992-1.736l.23-.132-.23-.132a1 1 0 01-.372-1.364zm-7 4a1 1 0 011.364-.372L10 8.848l1.254-.716a1 1 0 11.992 1.736L11 10.58V12a1 1 0 11-2 0v-1.42l-1.246-.712a1 1 0 01-.372-1.364zM3 11a1 1 0 011 1v1.42l1.246.712a1 1 0 11-.992 1.736l-1.75-1A1 1 0 012 14v-2a1 1 0 011-1zm14 0a1 1 0 011 1v2a1 1 0 01-.504.868l-1.75 1a1 1 0 11-.992-1.736L16 13.42V12a1 1 0 011-1zm-9.618 5.504a1 1 0 011.364-.372l.254.145V16a1 1 0 112 0v.277l.254-.145a1 1 0 11.992 1.736l-1.735.992a.995.995 0 01-1.022 0l-1.735-.992a1 1 0 01-.372-1.364z" clip-rule="evenodd" />
                    </svg>`
                }
                
            }
        }
        this.Emitter = Emitter
    }

    redirect(url) {
        if(url.startsWith("/application/")) {
            document.location.href = document.location.origin + url
        } else if(url.startsWith("/")) {
            document.location.href = document.location.origin + "/application" + url
        } else {
            document.location.href = url
        }

    }

    sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }

    toastError(err) {
        console.log(`toastError:`,err)
        this.toast({
            title: `Une erreur est survenue`,
            content: `${err.stack}`,
            type: "error",
            progressBarType: "error",
            svg: "error",
            timeout: 30*1000,
        })
    }
    toast(datas) {
        /* {
            "title": "💔 Woops",
            "content": "L'application a crash !",
            "type": "success",
            "progressBarType": "warning",
            "timeout": 6033,
            "svg": "loading"
            "hideProgressBar": false,
            "autoHide": true,
            "isHoverToPause": true,
        }*/
        // console.log("datas=",datas.content)
        if(datas.svg == "info") { datas.title = `${this._datas.html.icons.info} ${datas.title ?? ""}` }
        if(datas.svg == "success") { datas.title = `${this._datas.html.icons.success} ${datas.title ?? ""}` }
        if(datas.svg == "warn") { datas.title = `${this._datas.html.icons.warn} ${datas.title ?? ""}` }
        if(datas.svg == "error") { datas.title = `${this._datas.html.icons.error} ${datas.title ?? ""}` }
        if(datas.svg == "loading") { datas.title = `${this._datas.html.icons.loading} ${datas.title ?? ""}` }
        return Toasting.create(datas)
    }

    get html() {
        return {
            toggleClass: (elem, className, forceTo=undefined) => {
                if(forceTo == true) {
                    return elem.classList.add(className)
                } else if(forceTo==false) {
                    return elem.classList.remove(className)
                }
                if(elem.classList.includes(className)) {
                    elem.classList.remove(className)
                } else {
                    elem.classList.add(className)
                }
            }
        }
    }

    get random() {
        return {
            Int: (min, max) => {
                return Math.floor(Math.random()*(max-min)+min)
            },
            Float: (min, max) => {
                return Math.floor(Math.random()*(max-min)+min)
            },
            Hex: (length, capslock=false) => {
                let h = Array(length).fill(0).map(x => this.choice("0123456789abcdef".split(""))).join("")
                return (capslock == true ? h.toUpperCase() : h)
            },
            Base64: (length, urlSafe=true) => {
                let the_list = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
                if(urlSafe) { the_list.push("_","-") } else { the_list.push("+","/") }
                let h = Array(length).fill(0).map(x => this.choice(the_list)).join("")
                return (capslock == true ? h.toUpperCase() : h)
            },
            Base62: (length) => {
                let the_list = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
                let h = Array(length).fill(0).map(x => this.choice(the_list)).join("")
                return (capslock == true ? h.toUpperCase() : h)
            },
            Letter: (length) => {
                let the_list = "abcdefghijklmnopqrstuvwxyz".split("")
                return Array(length).fill(0).map(x => this.choice(the_list)).join("")
            }
        }
    }

    get _cookies() {
        return {
            get: (cname) => {
                let name = cname + "=";
                let ca = document.cookie.split(';');
                for(let i = 0; i < ca.length; i++) {
                    let c = ca[i];
                    while (c.charAt(0) == ' ') {
                    c = c.substring(1);
                    }
                    if (c.indexOf(name) == 0) {
                    return c.substring(name.length, c.length);
                    }
                }
                return "";
            },
            set: (cname, cvalue, exdays) => {
                if(!exdays) exdays = 1
                const d = new Date();
                d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
                let expires = "expires="+d.toUTCString();
                document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
            },
            list() {
                let cookies = document.cookie.split(';')

                let l = cookies.map((cookie, n) => decodeURIComponent(cookie))
                let dict = {}
                for(let i in l) {
                    let r = l[i].split("=").map(x => { return x.trim() })
                    let s = r.shift()
                    dict[s] = r.join("=")
                }
                return dict
            }
        }
    }

    choice(list) {
        return list[Math.floor(Math.random()*list.length)]
    }

    censorText(text, uncensoredLength = 5) {
        return text.split("").map((x,i) => { return (i<uncensoredLength ? x : "*") }).join("")
    }

    randInt = (min, max) => { return Math.floor(Math.random()*(max-min)+min) }
    randFloat = (min, max) => { return Math.random()*(max-min)+min }
    choice = (list) => { return list[Math.floor(Math.random()*list.length)]}
    genHex = (length) => { return Array(length).fill(undefined).map(x => { return BasicF.choice("0123456789abcdef".split(""))}).join("")}
    formatTime(millisecondes, format) {
        /*
        Renvoie un dictionnaire avec le formatage de la durée en ms, en jour, heures, etc...
        YYYY: year
        MM: month
        DDDDD: jour de l'année
        DD: jours du mois
        hh: heure
        mm: minute
        ss: seconde
        */
        let v = {
            y: 31536000000,
            mo: 2628000000,
            d: 86400000,
            h: 3600000,
            m: 60000,
            s: 1000
        }
        let la_date = {
            years: Math.floor(millisecondes / v.y),
            months: Math.floor((millisecondes % v.y) / v.mo), // value de l'année divisée en douze poue faire à peu pres
            all_days: Math.floor(millisecondes / v.d), // jours de l'année
            days: Math.floor(((millisecondes % v.y) % v.mo) / v.d), // jours du mois
            hours: Math.floor((((millisecondes % v.y) % v.mo) % v.d) / v.h),
            minutes: Math.floor(((((millisecondes % v.y) % v.mo) % v.d) % v.h) / v.m),
            seconds: Math.floor((((((millisecondes % v.y) % v.mo) % v.d) % v.h) % v.m) / v.s),
            milliseconds: (((((millisecondes % v.y) % v.mo) % v.d) % v.h) % v.m) % v.s
        }
        //console.log(la_date)
    
        function formatThis(thing, length = 2) {
            return `0000${thing}`.substr(-length)
        }
    
        let return_string = format.replace("YYYY", la_date.years).replace("MM", formatThis(la_date.months)).replace("DDDDD", la_date.all_days).replace("DD", formatThis(la_date.days)).replace("hh", formatThis(la_date.hours)).replace("mm", formatThis(la_date.minutes)).replace("ss", formatThis(la_date.seconds)).replace("ms", formatThis(la_date.milliseconds, 3))
    
        return return_string
    }

    sleep = ms => new Promise(r => setTimeout(r, ms));


}


BasicF = new the_BasicFunctions();

Logger.log(`[BasicFunctions] Successfully loaded module.`)

} catch(e) {
    Logger.log(`[BasicFunctions] An error occured while loading the module:`,e)
}