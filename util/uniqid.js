(function(){
	var fileData=[]
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 16893,
		"nlink": 3,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 131072,
		"ino": 135523,
		"size": 3,
		"blocks": 1,
		"atimeMs": 1551505451657.0627,
		"mtimeMs": 1551505424616.569,
		"ctimeMs": 1551505424616.569,
		"birthtimeMs": 1551505424616.569,
		"atime": "2019-03-02T05:44:11.657Z",
		"mtime": "2019-03-02T05:43:44.617Z",
		"ctime": "2019-03-02T05:43:44.617Z",
		"birthtime": "2019-03-02T05:43:44.617Z",
		"isdirectory": true
	},
	"filename": ""
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 16893,
		"nlink": 2,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 131072,
		"ino": 135526,
		"size": 5,
		"blocks": 1,
		"atimeMs": 1551505452089.0706,
		"mtimeMs": 1551505424612.569,
		"ctimeMs": 1551505424612.569,
		"birthtimeMs": 1551505424612.569,
		"atime": "2019-03-02T05:44:12.089Z",
		"mtime": "2019-03-02T05:43:44.613Z",
		"ctime": "2019-03-02T05:43:44.613Z",
		"birthtime": "2019-03-02T05:43:44.613Z",
		"isdirectory": true
	},
	"filename": "uniqid"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 33204,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 2560,
		"ino": 136553,
		"size": 2493,
		"blocks": 5,
		"atimeMs": 1551505424594,
		"mtimeMs": 499162500000,
		"ctimeMs": 1551505424588.5686,
		"birthtimeMs": 1551505424588.5686,
		"atime": "2019-03-02T05:43:44.594Z",
		"mtime": "1985-10-26T08:15:00.000Z",
		"ctime": "2019-03-02T05:43:44.589Z",
		"birthtime": "2019-03-02T05:43:44.589Z",
		"isfile": true
	},
	"filename": "uniqid/index.js",
	"content": "/* \n(The MIT License)\nCopyright (c) 2014 Halász Ádám <mail@adamhalasz.com>\nPermission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the \"Software\"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:\nThe above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n*/\n\n//  Unique Hexatridecimal ID Generator\n// ================================================\n\n//  Dependencies\n// ================================================\nvar pid = process && process.pid ? process.pid.toString(36) : '' ;\nvar address = '';\nif(typeof __webpack_require__ !== 'function'){\n    var mac = '', networkInterfaces = require('os').networkInterfaces();\n    for(interface_key in networkInterfaces){\n        const networkInterface = networkInterfaces[interface_key];\n        const length = networkInterface.length;\n        for(var i = 0; i < length; i++){\n            if(networkInterface[i].mac && networkInterface[i].mac != '00:00:00:00:00:00'){\n                mac = networkInterface[i].mac; break;\n            }\n        }\n    }\n    address = mac ? parseInt(mac.replace(/\\:|\\D+/gi, '')).toString(36) : '' ;\n} \n\n//  Exports\n// ================================================\nmodule.exports = module.exports.default = function(prefix){ return (prefix || '') + address + pid + now().toString(36); }\nmodule.exports.process = function(prefix){ return (prefix || '') + pid + now().toString(36); }\nmodule.exports.time    = function(prefix){ return (prefix || '') + now().toString(36); }\n\n//  Helpers\n// ================================================\nfunction now(){\n    var time = Date.now();\n    var last = now.last || time;\n    return now.last = time > last ? time : last + 1;\n}\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 33204,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 1536,
		"ino": 136554,
		"size": 1448,
		"blocks": 3,
		"atimeMs": 1551505424608.569,
		"mtimeMs": 1551505424608.569,
		"ctimeMs": 1551505424612.569,
		"birthtimeMs": 1551505424612.569,
		"atime": "2019-03-02T05:43:44.609Z",
		"mtime": "2019-03-02T05:43:44.609Z",
		"ctime": "2019-03-02T05:43:44.613Z",
		"birthtime": "2019-03-02T05:43:44.613Z",
		"isfile": true
	},
	"filename": "uniqid/package.json",
	"content": "{\n  \"_from\": \"uniqid@^5.0.3\",\n  \"_id\": \"uniqid@5.0.3\",\n  \"_inBundle\": false,\n  \"_integrity\": \"sha512-R2qx3X/LYWSdGRaluio4dYrPXAJACTqyUjuyXHoJLBUOIfmMcnYOyY2d6Y4clZcIz5lK6ZaI0Zzmm0cPfsIqzQ==\",\n  \"_location\": \"/uniqid\",\n  \"_phantomChildren\": {},\n  \"_requested\": {\n    \"type\": \"range\",\n    \"registry\": true,\n    \"raw\": \"uniqid@^5.0.3\",\n    \"name\": \"uniqid\",\n    \"escapedName\": \"uniqid\",\n    \"rawSpec\": \"^5.0.3\",\n    \"saveSpec\": null,\n    \"fetchSpec\": \"^5.0.3\"\n  },\n  \"_requiredBy\": [\n    \"/\"\n  ],\n  \"_resolved\": \"https://registry.npmjs.org/uniqid/-/uniqid-5.0.3.tgz\",\n  \"_shasum\": \"917968310edc868d50df6c44f783f32c7d80fac1\",\n  \"_spec\": \"uniqid@^5.0.3\",\n  \"_where\": \"/disk1/projects/@kawix/std/package/uniqid\",\n  \"author\": {\n    \"name\": \"Halász Ádám\",\n    \"email\": \"mail@adamhalasz.com\",\n    \"url\": \"http://adamhalasz.com/\"\n  },\n  \"bugs\": {\n    \"url\": \"http://github.com/adamhalasz/uniqid/issues\",\n    \"email\": \"mail@adamhalasz.com\"\n  },\n  \"bundleDependencies\": false,\n  \"dependencies\": {},\n  \"deprecated\": false,\n  \"description\": \"Unique ID Generator\",\n  \"devDependencies\": {},\n  \"files\": [\n    \"index.js\"\n  ],\n  \"homepage\": \"http://github.com/adamhalasz/uniqid/\",\n  \"keywords\": [\n    \"unique id\",\n    \"uniqid\",\n    \"unique identifier\",\n    \"hexatridecimal\"\n  ],\n  \"license\": \"MIT\",\n  \"main\": \"index.js\",\n  \"name\": \"uniqid\",\n  \"repository\": {\n    \"type\": \"git\",\n    \"url\": \"git+https://github.com/adamhalasz/uniqid.git\"\n  },\n  \"version\": \"5.0.3\"\n}\n"
}})
	var filenames={
	"": 0,
	"uniqid": 1,
	"uniqid/index.js": 2,
	"uniqid/package.json": 3
}
        var mod1= function(KModule, exports){
            var i=0, main, pe, filecount, pjson
            for(var id in filenames){
                if(typeof module == "object"){
                    
                main= "uniqid"
                main= "uniqid$v$5.0.3/node_modules" + (main ? ("/"+main) : "")
                                     
                }
                KModule.addVirtualFile("uniqid$v$5.0.3/node_modules" + (id ? ("/"+id) : ""), fileData[i])
                i++
            }
            if(pjson){
                main= pjson.main
                if(main.substring(0,2)=="./"){
                    main= main.substring(2)
                }
                main= "uniqid$v$5.0.3/node_modules" + (main ? ("/" + main) : "")
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
        
})()
// kawi converted. Preserve this line, Kawi transpiler will not reprocess if this line found