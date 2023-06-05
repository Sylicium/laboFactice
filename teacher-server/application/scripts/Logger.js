

class the_Logger {
    constructor() {

    }

    log(...args) {
        console.log(`[LOG] `,...args)
    }
    warn(...args) {
        console.log(`[LOG] `,...args)
    }
    error(...args) {
        console.log(`[LOG] `,...args)
    }
    debug(...args) {
        console.log(`[LOG] `,...args)
    }
}


const Logger = new the_Logger()