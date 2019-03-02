import Bundler from '../package/bundle.js'
import Path from 'path'

var init= async function(){
    var path= Path.join(__dirname, "tar","node_modules")
    var outfile= Path.join(__dirname, "tar-lowlevel.js")

    var bundler= new Bundler(path)
    bundler.virtualName= 'tar$v$4.4.8/node_modules'
    bundler.packageJsonSupport= true

    await bundler.writeToFile(outfile).bundle()
}

init()