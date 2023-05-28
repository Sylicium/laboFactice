
let BasicF = {}


BasicF.randInt = (min, max) => { return Math.floor(Math.random()*(max-min)+min) }
BasicF.randFloat = (min, max) => { return Math.random()*(max-min)+min }


BasicF.choice = (list) => { return list[Math.floor(Math.random()*list.length)]}
BasicF.genHex = (length) => { return Array(length).fill(undefined).map(x => { return BasicF.choice("0123456789abcdef".split(""))}).join("")}
BasicF.formatTime = (millisecondes, format) => {
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
BasicF.Emitter = Emitter

BasicF.sleep = ms => new Promise(r => setTimeout(r, ms));