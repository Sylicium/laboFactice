

class the_Logger {
    constructor() {
        this.getCurrentTime = () => {
            let formatDate = (timestamp, format) => {
                /*
                YYYY: year
                MM: month
                DDDDD: jour de la semaine
                DD: day
                hh: heure
                mm: minute
                ss: seconde
                */
                let la_date = new Date(timestamp)
                function formatThis(thing, length=2) {
                    return `0000${thing}`.substr(-2)
                }
        
                function getDayName() {
                    let list = [
                        "lundi",
                        "mardi",
                        "mercredi",
                        "jeudi",
                        "vendredi",
                        "samedi",
                        "dimanche"
                    ]
                    return list[la_date.getDay()-1]
                }
        
                let return_string = format.replace("YYYY", la_date.getFullYear()).replace("MM", formatThis(la_date.getMonth()+1)).replace("DDDDD", getDayName()).replace("DD", formatThis(la_date.getDate())).replace("hh", formatThis(la_date.getHours())).replace("mm", formatThis(la_date.getMinutes())).replace("ss", formatThis(la_date.getSeconds())).replace("ms", `${la_date.getMilliseconds()}`.padStart(3,0))
        
                return return_string
            }
            return formatDate(Date.now(), "DD/MM/YYYY hh:mm:ss.ms")
        }
    }

    log(...args) {
        console.log(`[${this.getCurrentTime()} LOG]`,...args)
    }
    warn(...args) {
        console.log(`[${this.getCurrentTime()} LOG]`,...args)
    }
    error(...args) {
        console.log(`[${this.getCurrentTime()} LOG]`,...args)
    }
    debug(...args) {
        console.log(`[${this.getCurrentTime()} LOG]`,...args)
    }
}


const Logger = new the_Logger()