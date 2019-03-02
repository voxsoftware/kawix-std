import Bundler from './bundle.js'
import Path from 'path'

var init= async function(){
    var path= Path.join(__dirname, "..", "..","test","node_modules","coffeescript")
    var out= Path.join(__dirname, "..", "..", "test")
    var outfile= Path.join(out, "bundle.js")

    var bundler= new Bundler(path)
    await bundler.writeToFile(outfile).bundle()

}

init()