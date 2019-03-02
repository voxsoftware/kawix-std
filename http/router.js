

class Event{
	get defaultPrevented(){
		return this._defaultPrevented
	}
	preventDefault(){
		this._defaultPrevented= true 
	}
}

class Router{

	constructor(){
		this._params= {}
		this._handles= {}
		this._id= 0
	}

	get normalizeUrls() {
		return this._normalizeUrls
	}
	set normalizeUrls(value) {
		return this._normalizeUrls= value
	}

	_compare(method, env, path){
		var uri = env.request.uri 
		//console.log("Comparing:", method, path)
		var params = env.request.params = env.request.params || {}
		var good
		if(method != "use" && method!="all"){
			if(env.request.method.toUpperCase() != method.toUpperCase())
				return false
			
		}
		if (method == "use" && path == "")
			return true 
		if(path.test){
			/*regexp */
			uri.pathname.replace(path.test, function(){
				for(var i=1;i<arguments.length;i++){
					params[i-1]= arguments[i]
					good= true
				}
			})
			return good 
		}



		var parts= uri.pathname.split("/")
		var parts2= path.split("/")
		if(this._normalizeUrls){
			parts = parts.filter((a) => !!a)
			parts2 = parts2.filter((a) => !!a)
		}
		if(method == "use"){
			parts2= parts2.slice(0, parts.length)
		}
		if(parts2.length != parts.length)
			return false 

		var callbackParams=[]
		good= true
		for(var i=0;i<parts.length;i++){
			let part= parts[i]
			let part1= parts2[i]
			let name 
			if(part1.startsWith(":")){
				name= part1.substring(1)
				params[name]= part
				if (this._params[name] && !env._paramsexecuted[name]){
					env._paramsexecuted[name]= true
					callbackParams.push(this._params[name])
				}
			}
			else if(part1 != part){
				good= false 
				break 
			}
		}
		if(!good) return false
		return callbackParams
		
	}

	param(param, callback){
		callback._id = this._id++
		callback.param= param 
		this._params[param]= callback 
	}

	_method(method, path, callback, id){

		if(typeof path == "function"){
			callback= path 
			path= ""
		}

		var self= this
		callback._id= id || (this._id++)
		var createCallback= async function(env){

			env._paramsexecuted={}
			var uri= env.request.uri 
			var good= false
			if(method == "all" || method == "use"){
				good = self._compare(method, env, path)
			}
			else if(method == "upgrade"){
				if(env.type == "upgrade"){
					good= true 
				}
			}
			else if(env.request.method.toUpperCase() == method.toUpperCase()){
				good= self._compare(method, env, path)
			}
			if (good && good.length) {
				// execute param 
				for (var i = 0; i < good.length; i++) {
					
					await good[i](env)
					if(env.defaultPrevented)
						return 
				}
			}
			if (good) {
				await callback(env)
			}
		}
		createCallback.original= callback 
		createCallback.method= method 
		createCallback.path= path 
		createCallback._id= callback._id 

		this._handles[callback._id]= createCallback
	}

	removeCallback(callback){
		delete this._handles[callback._id]
		delete this._params [callback._id]
	}

	replaceCallback(old, callback){
		if (this._handles[old._id]) {
			delete this._handles[old._id]
			this._method(old.method, old.path, callback, old._id)
			delete old._id
		}
		else if (this._params[old._id]) {
			delete this._params[old._id]
			this.param(old.param, callback)
			delete old._id
		}else{
			// maybe throw an error?
		}
	}




	static convertExpressCallback(callback){
		var converted= function(env){
			return new Promise(function(resolve, reject){
				try{
					callback(env.request, env.response, function () {
						resolve()
						resolve=null 
					})
					env.response.once("finish", function(){
						if(resolve) resolve()
					})
				}catch(e){
					reject(e)
				}
			})
		}
	}

	async handle(env){
		var callback , ev 
		
		ev= new Event() 
		env.preventDefault =  ev.preventDefault.bind(ev)
		env.response.once("finish", env.preventDefault )

		for(let id in this._handles){
			
			callback= this._handles[id]
			//console.log("Handling:", id, callback)
			await callback(env)
			
			if (ev.defaultPrevented || env.response.finished){
				break 
			}
		}
	}

}


var methods = [
	'get',
	'post',
	'put',
	'head',
	'delete',
	'options',
	'trace',
	'copy',
	'lock',
	'mkcol',
	'move',
	'purge',
	'propfind',
	'proppatch',
	'unlock',
	'report',
	'mkactivity',
	'checkout',
	'merge',
	'm-search',
	'notify',
	'subscribe',
	'unsubscribe',
	'patch',
	'search',
	'connect',

	// special methods
	'upgrade',
	'use'
]

var createMethod= function(method){
	return function(path, callback){
		return this._method(method, path, callback)
	}
}
for(var i=0;i<methods.length;i++)
{
	Router.prototype[methods[i]]= createMethod(methods[i])
}
export default Router