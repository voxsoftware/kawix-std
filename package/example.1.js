import Registry from './registry.js'

(async function () {
    var folder, reg, time 
    reg = new Registry()

    time= Date.now()
    folder = await reg.require("socket.io", "2.1.1")
    console.info("requiring first time: ", Date.now()-time)
    time= Date.now()
    folder = await reg.require("socket.io", "2.1.1")
    console.info("requiring second time: ", Date.now()-time)
    time= Date.now()
    folder = await reg.require("socket.io", "2.1.1")
    console.info("requiring third time: ", Date.now()-time)
})()
