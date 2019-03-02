import Bundler from '../../package/bundle.js'
import Path from 'path'

var init= async function(){
    var path= Path.join(__dirname, "node_modules")
    var outfile= Path.join(__dirname, "..","uniqid.js")

    var bundler= new Bundler(path)
    bundler.virtualName= 'uniqid$v$5.0.3/node_modules'
    bundler.mainScript= "uniqid"

    await bundler.writeToFile(outfile).bundle()
}

init()