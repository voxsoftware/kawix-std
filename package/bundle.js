// Copyright Kodhe 2019
import fs from '../fs/mod.js'
import Path from 'path'

var names=["isBlockDevice","isCharacterDevice","isDirectory","isFIFO",""]
class Bundle{

    /** Bundle a folder of files, like one unique file*/
    constructor(path, options={}){
        this._path= Path.normalize(path)
        this._filenames= {}
        this._fcount= 0
        this.options= options
        if(options.ignoreIrrelevantFiles == undefined){
            options.ignoreIrrelevantFiles= true
        }
    }

    

    writeTo(stream){
        this._stream= stream 
        this._stream.on("error", (e)=>{
            this._lastwriteError= e
        })
        return this
    }

    writeToFile(file){
        return this.writeTo(fs.createWriteStream(file))
    }

    get virtualName(){
        if(!this.options.virtualName){
            this.options.virtualName= Path.basename(this._path)
        }
        return this.options.virtualName 
    }

    set virtualName(name){
        return this.options.virtualName= name 
    }

    get packageJsonSupport(){
        return this.options.packageJsonSupport
    }
    set packageJsonSupport(value){
        return this.options.packageJsonSupport= value
    }

    get mainScript(){
        return this.options.mainScript
    }
    set mainScript(value){
        return this.options.mainScript= value
    }

    get ignoreIrrelevantFiles(){
        return this.options.ignoreIrrelevantFiles
    }
    set ignoreIrrelevantFiles(value){
        return this.options.ignoreIrrelevantFiles= value
    }

    async bundle(path){

        if(!this._header){
            this._stream.write("(function(){\n\t")
            this._stream.write("var fileData=[]")
            this._header= true 
        }
        await this._create(path)

        // load virtual paths into KModule 
        var str= JSON.stringify(this._filenames, null,'\t')
        this._stream.write("\n\tvar filenames=" + str)

        var packageJson= this.packageJsonSupport 
        if(packageJson){
            packageJson= `
                    if(id == "package.json"){
                        pjson= fileData[i]()
                        pjson= JSON.parse(pjson.content)
                    }
            `
        }
        
        else{

            if(this.mainScript){
                packageJson=`
                main= ${JSON.stringify(this.mainScript)}
                main= "${this.virtualName}" + (main ? ("/"+main) : "")
                `
            }
            else{
                packageJson= `
                        pe= id.split(".")
                        if(fileData.length == 1 || (pe.length == 2 && pe[0] == "mod")){
                            // mark as default
                            main= "${this.virtualName}" + (id ? ("/"+id) : "")
                        }  
                `
            }
        }

        var virtualAdd= `
        var mod1= function(KModule, exports){
            var i=0, main, pe, filecount, pjson
            for(var id in filenames){
                if(typeof module == "object"){
                    ${packageJson}                     
                }
                KModule.addVirtualFile("${this.virtualName}" + (id ? ("/"+id) : ""), fileData[i])
                i++
            }
            if(pjson){
                main= pjson.main
                if(main.substring(0,2)=="./"){
                    main= main.substring(2)
                }
                main= "${this.virtualName}" + (main ? ("/" + main) : "")
            }
            if(main){
                return KModule.import("/virtual/" + main)
            }
            if(typeof module == "object"){
                return exports 
            }
            return {}
        }
        /*
        if(typeof module == "object"){
            module.exports.__kawi= mod1
        }*/

        if(typeof window == "object"){
            if(window.KModuleLoader){
                module.exports= mod1(window.KModuleLoader, module.exports)
            }
        }
        if(typeof KModule == "object"){
            module.exports= mod1(KModule, module.exports)
        }
        return mod1
        `
        
        
        this._stream.write(virtualAdd)
        this._stream.write("\n})()")
        // this allow not reprocessed in kawix transpiler
        this._stream.write(kwcore.NextJavascript.transpiledLineComment)
        if(this._lastwriteError)
            throw this._lastwriteError 
        
        // FINISH 
        this._stream.end()
        return new Promise((resolve,reject)=>{
            this._stream.once("finish", ()=>{
                if(this._lastwriteError)
                    return reject(this._lastwriteError)
                return resolve()
            })
        })        

    }

    

    close(){
        if(this._stream)
            this._stream.close()
    }



    



    async _create(path){
        if(!path)
            path= this._path 

        var stat= await fs.statAsync(path)
        var rep, files, str, fullfile, continue1, rev, comp

        continue1= true 
        rev= Path.relative(this._path, path)
        if(this.ignoreIrrelevantFiles && path != this._path){
            comp= rev.split(Path.sep)
            comp= comp[comp.length-1]
            if(rev == "bin"){
                continue1= false
            }
            else if(comp){
                if(comp.toUpperCase().endsWith("TEST") || comp.toUpperCase().endsWith(".MD")){
                    continue1= false 
                }
                else if(comp.toUpperCase() == "LICENSE"){
                    continue1= false
                }
                else if(comp.startsWith(".")){
                    continue1= false
                }
            }
        }
        if(continue1 && comp && comp.toUpperCase() == ".git"){
            continue1= false
        }


        if(continue1){
            if(stat.isFile()){
                rep= {}
                rep.stat= Object.assign({}, stat)
                rep.stat.isfile= true 
                rep.filename= rev
                
                

                // maybe binary? because what about opening binary files
                rep.content= await fs.readFileAsync(path,'utf8')
                str= JSON.stringify(rep, null, '\t')
                this._stream.write(`\n\tfileData.push(function(){return ${str}})`)

                this._filenames[rep.filename]= this._fcount 
                this._fcount++ 

                if(this._lastwriteError)
                    throw this._lastwriteError 
                
            }
            else if(stat.isDirectory()){

                rep= {}
                rep.stat= Object.assign({}, stat)
                rep.stat.isdirectory= true 
                rep.filename= rev
                str= JSON.stringify(rep, null, '\t')
                this._stream.write(`\n\tfileData.push(function(){return ${str}})`)
                this._filenames[rep.filename]= this._fcount 
                this._fcount++ 


                files= await fs.readdirAsync(path)
                for(var i=0;i<files.length;i++){
                    if(files[i] == "." || files[i] == "..")
                        continue
                    fullfile= Path.join(path, files[i])
                    await this._create(fullfile)
                }
            }
        }

    }

}

export default Bundle