// Copyright 2018-2019 the kawix authors. All rights reserved. MIT license.

import http from 'http'
import {EventEmitter} from 'events'
import Url from 'url'

class Server extends EventEmitter{

	constructor(){
		super()
		this._http= http.createServer(this._listener.bind(this))
		this._http.on("error", (e)=>{
			this.emit("error", e)
		})
		this._queue= []
	}


	/** Listen http server. Returns a promise */
	listen(addr){
		
		var host,port
		if (typeof addr == "string"){
			if(addr.indexOf(":")){
				host= addr.split(":")
				
				port= parseInt(host[1])
				host = host[0]
				this._http.listen(port, host)
			}else{
				this._http.listen(addr)
			}
		}else{
			this._http.listen(addr)
		}
		var r1, r2
		var listen= ()=>{
			this.emit("listen")
			r1() 
		}
		this.once("error", (e)=>{
			r2(e)
		})
		this._http.on("upgrade", this._upgrade.bind(this))
		return new Promise(function(resolve,reject){
			r1= resolve 
			r2= reject 
		})
	}

	/** close http server. Returns a promise */
	close(){
		return new Promise(function(resolve, reject){
			this._http.close((e) => {
				this.emit("close")
				if(e) return reject(e)
				resolve()
			})
		})
		
	}


	get connectEnabled(){
		return this._connectEnabled
	}
	
	set connectEnabled(value) {
		if(value){
			if (!this._connectCallback){
				this._connectCallback= this._connect.bind(this)
				this.on("connect", this._connectCallback)
			}			
		}else{
			if(this._connectCallback){
				this.removeListener("connect", this._connectCallback)
				delete this._connectCallback
			}
		}
		return this._connectEnabled= value 
	}


	get listening() {
		return this._http.listening
	}

	get maxHeadersCount() {
		return this._http.maxHeadersCount
	}

	set maxHeadersCount(value) {
		return this._http.maxHeadersCount = value
	}

	get headersTimeout() {
		return this._http.headersTimeout
	}

	set headersTimeout(value) {
		return this._http.headersTimeout = value
	}

	get timeout() {
		return this._http.timeout
	}

	set timeout(value) {
		return this._http.timeout = value
	}

	get keepAliveTimeout() {
		return this._http.keepAliveTimeout
	}

	set keepAliveTimeout(value) {
		return this._http.keepAliveTimeout = value
	}







	get innerServer(){
		return this._http
	}

	accept(){
		var self= this 
		if(this._queue.length){
			return this._queue.shift()
		}
		return new Promise(function(resolve,reject){
			self._resolve= resolve 
			self._reject= reject
		})
	}



	_emitEnv(){
		var resolve = this._resolve 
		if(resolve){
			delete this._resolve 
			resolve(this._queue.shift())
		}
	}

	_connect(req, socket, head) {
		var env = {
			request: req,
			socket: socket,
			head: head,
			write: socket.write.bind(socket),
			type:'connect'
		}
		env.end = this._response_end(socket.end, socket)
		return this._addQueue(env)
	}

	_upgrade(req, socket, head) {
		var env = {
			type:'upgrade',
			request: req,
			socket: socket,
			head: head,
			write: socket.write.bind(socket)
		}
		env.end = this._response_end(socket.end, socket)
		
		return this._addQueue(env)
	}

	_response_end(end,response){
		var self= this
		return function(){
			var args= arguments
			return new Promise(function(resolve, reject){
				end.apply(response,args)
				response.once("finish", resolve)
				//response.once("error", reject)
			})
		}
	}



	_listener(req, res){
		
		var env={
			request: req,
			response: res,
			write: res.write.bind(res)
		}
		env.end = this._response_end(res.end, res)
		return this._addQueue(env)
	}
	_addQueue(env){
		
		
		env.request.uri= Url.parse(env.request.url)
		env.request.on("error", (e) => {
			this.emit("error", e)
		})
		env.response.on("error", (e) => {
			this.emit("error", e)
		})
		this._queue.push(env)
		this._emitEnv()
	}


}

export default Server