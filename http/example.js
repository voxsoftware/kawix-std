
import Server from './server'
import Router from './router'


var server, env, router, init 

init= async function(){

	server= new Server()
	server.listen("0.0.0.0:8181")
	server.on("error", function(e){
		console.error(e)
	})

	router= new Router()
	router.get("/hello", function(env){
		env.write("Hello world!")
		env.end()
	})
	router.get("/hello/:id", function(env){
		env.write("Hello world " + env.request.params.id)
		env.end()
	})
	router.use(function(env){
		env.write("Default method")
		env.end()
	})
	while(env= await server.accept()){
		await router.handle(env)
		// ensure end request
		if(!env.response.finished)
			env.end() 
	}
}
init()