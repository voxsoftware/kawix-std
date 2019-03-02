import Bundler from '../package/bundle.js'
import Path from 'path'

var init= async function(){
    var path= Path.join(__dirname, "..", ".." ,"node_modules","coffeescript")
    var outfile= Path.join(__dirname, "runtime.js")

    var bundler= new Bundler(path)
    bundler.packageJsonSupport= true
    await bundler.writeToFile(outfile).bundle()

}

init()