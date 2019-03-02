import Bundler from '../bundle.js'
import Path from 'path'

var init= async function(){
    var path= Path.join(__dirname, "node_modules")
    var outfile= Path.join(__dirname, "..","semver.js")

    var bundler= new Bundler(path)
    bundler.virtualName= 'semver$v$5.6.0/node_modules'
    bundler.mainScript= "semver"

    await bundler.writeToFile(outfile).bundle()
}

init()