# Copyright 2019 Kodhe
# registry.js 
# require npm modules easily. code written in coffeescript

import Semver from './semver.js'
import uniqid from '../util/uniqid.js'

import tar from '../compression/tar.js'
import fs from '../fs/mod.js'

import Crypto from 'crypto'
import Path from 'path'
import Child from 'child_process'
import Os from 'os'
import https from 'https'



if not global.kawix
	throw new Error("Need require @kawix/core")

class Registry 
	@cache= {}
	constructor: (@options={})->
		@url= @options.url or "https://registry.npmjs.org"
		@installed=[]
	

	

	_removedir: (path, retry= 0)->
		try 
			files= await fs.readdirAsync(path)
			for file in files 
				ufile= Path.join path, file 
				stat=await fs.statAsync ufile
				if stat.isDirectory()
					await @_removedir ufile 
					
				else 
					await fs.unlinkAsync ufile 
			
			await fs.rmdirAsync path 
		catch e
			if retry > 15
				throw e 
			await @_sleep 100
			return await @_removedir path, retry+1 
			
		



	_fileExists: (file)->   
		return new Promise (resolve, reject)->
			fs.access file, fs.constants.F_OK, (err)->  
				resolve(no) if err 
				resolve(yes)


	_getPackageCacheInstall: (module,version)->

		securename= module.replace /\//g, '%2F'
		if @options.versioncontrol isnt false 
			securename += "@#{version}"

		if @options.output
			folder= @options.output
		else 
			kawi= Path.join Os.homedir(), ".kawi"
			if not await @_fileExists(kawi)
				await fs.mkdirAsync(kawi)
			
			folder= Path.join kawi, 'npm-inst'

		if not await @_fileExists(folder)
			await fs.mkdirAsync(folder)  

		folder= Path.join folder, securename
		lock= folder + ".lock"
		#if not await @_fileExists(folder)
		#    await fs.mkdirAsync(folder)    
		return
			folder : folder 
			lock: lock 



	_getPackageCacheConfig: (pack, version)->

		securename= pack.replace /\//g, '%2F'
		securename += "@#{version}"


		kawi= Path.join Os.homedir(), ".kawi"
		if not await @_fileExists(kawi)
			await fs.mkdirAsync(kawi)
		
		folder= Path.join kawi, 'npm-packages'
		if not await @_fileExists(folder)
			await fs.mkdirAsync(folder)


		tarball= Path.join folder, securename + ".tar.gz"
		
		file= Path.join folder, pack + ".json"
		if not await @_fileExists(file)
			config= 
				file: file  
			await fs.writeFileAsync(file,JSON.stringify(config,null,'\t'))
		else
			config= await fs.readFileAsync(file,'utf8')
			config= JSON.parse config

		return
			folder : folder 
			tarball: tarball 
			file: file 
			moduleinfo: config


	
	_filerequest: (url, file)->
		buf=[]
		cont= null 
		er= (e)-> rej e  
		rej= null 
		
		https.get url, (resp)->

			if resp.statusCode != 200
				return er Error("Invalid response from registry. Status code #{resp.statusCode}")

			st= fs.createWriteStream file 
			st.on "error", er
			resp.pipe st
			st.on "finish", cont  
			resp.on "error", er 
		.on "error", er 


		return new Promise (resolve, reject)->
			cont= resolve 
			rej= reject



	
	_jsonrequest: (url)->
		buf=[]
		cont= null 
		er= (e)-> rej e  
		rej= null 
		https.get url, (resp)->

			if resp.statusCode != 200
				return er Error("Invalid response from registry. Status code #{resp.statusCode}")

			resp.on "data", (d)->
				buf.push d 
			resp.on "end", cont  
			resp.on "error", er 
		.on "error", er 

		
		
		return new Promise (resolve, reject)->
			cont= ()->
				try 
					text= Buffer.concat(buf).toString 'utf8'
				catch e 
					return reject new Error("Invalid response. Cannot parse as JSON: #{text}")
				return resolve(JSON.parse text )
			rej= reject


	_lock: (file)->
		# lock
		undefined 
	
	_unlock: (file)->
		# unlock
		undefined 


	_getNpmInfo: (cachedInfo, module)->

		time= cachedInfo.moduleinfo.data?.time ? 0
		if Date.now() - time < (10*60*1000)	
			return 


		# download an appropiate version 
		securename= module.replace /\//g, '%2F'
		url= "#{@url}/#{securename}"
		
		cachedInfo.moduleinfo.data= await @_jsonrequest url 
		cachedInfo.moduleinfo.data.time= Date.now() 
		await fs.writeFileAsync(cachedInfo.moduleinfo.file, JSON.stringify(cachedInfo.moduleinfo, null, '\t'))




	_checkPackageCache: (module, version)->
		cachedInfo= await @_getPackageCacheConfig(module, version)
		if not cachedInfo.moduleinfo
			json= await fs.readFileAsync cachedInfo.file 
			cachedInfo.moduleinfo= JSON.parse json 
		
		if cachedInfo.moduleinfo.versions
			versions= Object.keys(cachedInfo.moduleinfo.versions)
			versions.sort (a,b)->
				return 1 if a < b 
				return -1 if a > b 
				return 0 
				
			for ver in versions 
				if Semver.satisfies ver, version 
					resolvedversion= ver 
			

		
		if not resolvedversion
			await @_getNpmInfo cachedInfo, module


			resolvedversion = null
			data= cachedInfo.moduleinfo.data        
			versions= Object.keys(data.versions )
			versions.sort (a,b) -> if a > b then -1 else (if a < b then 1 else 0)
			if data["dist-tags"]?[version]
				resolvedversion= data["dist-tags"]?[version].version

			else 
				for ver in versions 
					if ver is version or (Semver.satisfies(ver, version))
						resolvedversion= ver 
						break 
			
			if not resolvedversion
				throw new Error("Cannot resolve module: #{module}@#{version}")
		
		cachedInfo= await @_getPackageCacheConfig(module, resolvedversion)
		cache= await @_getPackageCacheInstall(module, resolvedversion)
		time= Date.now() 

		while await @._fileExists(cache.lock)
			if Date.now() - time > 40000
				throw new Error("Error waiting access")
			await @_sleep 20
	
		arg= 
			cachedInfo: cachedInfo 
			proposedInstall: cache
			module: module 
			originalversion : version 
			version: resolvedversion
		if await @._fileExists cache.folder 
			arg.cached= cache.folder 
			return arg
		
		else 
			return arg

	_resolveDependencies: (moduledesc, pjson)->	
		if pjson.dependencies 
			moduledesc.dependencies= pjson.dependencies 
			moduledesc.resolveddependencies= []

			if not @options.parent 
				nod= Path.join moduledesc.folder, "node_modules"
				if not await @_fileExists nod 
					await fs.mkdirAsync nod 
			
			else 
				nod= @options.output

			for dep, version of pjson.dependencies 
				continue if pjson.bundleDependencies?.indexOf?(dep) >= 0
				
				# resolve dep 
				options= Object.assign {}, @options 
				options.output= nod
				options.parent= moduledesc 
				options.versioncontrol= no 

				reg= new Registry options 
				moduledep = await reg.resolve dep, version 
				moduledesc.resolveddependencies.push moduledep
		



				

	require: (module, version)->
		if not version 
			i= module.lastIndexOf("@")
			if i > 0
				version= module.substring(i+1)
				module= module.substring(0,i)
			else 
				version= "*"
		
		moduledesc= await @resolve module, version 
		return require(moduledesc.folder)


	resolve: (module, version)->

		if not version 
			i= module.lastIndexOf("@")
			if i > 0
				version= module.substring(i+1)
				module= module.substring(0,i)
			else 
				version= "*"

		cacher= Registry.cache[module] 
		if cacher
			versions= Object.keys cacher 
			versions.sort (a,b)->
				return 1 if a < b
				return -1 if a > b
				return 0

			for ver in versions  
				if Semver.satisfies ver, version 
					moduledesc= cacher[ver] 
					break 
		

		if not moduledesc
			moduledesc= await @_resolve module, version 
			
			# save cache 
			Registry.cache[moduledesc.name]= Registry.cache[moduledesc.name] ? {}
			Registry.cache[moduledesc.name][moduledesc.version]= moduledesc

		if not moduledesc.packageinfo 
			pjson= Path.join moduledesc.folder, "package.json"
			pjson= await fs.readFileAsync(pjson, 'utf8')
			pjson= JSON.parse pjson 
			moduledesc.packageinfo= pjson 
			if pjson.main 
				moduledesc.main= Path.normalize(Path.join(moduledesc.folder, pjson.main))
			else 
				moduledesc.main= Path.join(moduledesc.folder, "index.js")

		if @options.ignoredependencies isnt true  
			try 				
				if not moduledesc.fullyloaded
					await @_resolveDependencies moduledesc, moduledesc.packageinfo 
					moduledesc.fullyloaded= yes 
			catch e
				#await @_removedir folder 
				throw e


		return moduledesc 


	_resolve: (module, version)->
		result= await @_checkPackageCache module,version
		if result.cached 
			return
				folder: result.cached
				name: module 
				version: result.version 
				localtarball: result.cachedInfo.tarball
		else 
			await @_downloadCache result 
			return
				folder: result.proposedInstall.folder 
				name: module 
				version: result.version 
				localtarball: result.cachedInfo.tarball
		
	_maybeRemoveProposed: (folder, {module,originalversion,version})->

		if @options.parent
			pjson= Path.join(folder, "package.json")
			try 
				pjson= await fs.readFileAsync pjson, 'utf8'
			catch e 
				if e.code isnt 'ENOENT'
					throw e 			
			try 
				pjson= JSON.parse pjson 
			catch e 
				return await @_removedir folder
			if Semver.satisfies pjson.version, originalversion
				# no remove and no continue 
				return 
					folder: folder 
					name: module
					version: pjson.version 
			else 
				# save inside node_modules 
				nod= Path.join(@options.parent.folder, "node_modules")
				if not await @_fileExists nod 
					await fs.mkdirAsync nod 
				
				return	
					change: true 
					folder: Path.join nod, Path.basename(folder)


		return await @_removedir folder 


	_verifyDownlaod: (dist, tarball)->	
		hash = Crypto.createHash('sha1')
		return new Promise (resolve,reject)->
			inst= fs.createReadStream(tarball)
			inst.on "error", reject
			inst.on "data", (d)->
				hash.update d
			inst.on "end", ()->
				sha1= hash.digest('hex')
				if sha1 isnt dist.shasum
					return reject new Error("Shasum comprobation failed #{sha1}. Expected: #{dist.shasum}")
				resolve()


		

	_downloadCache: (result)->
		module= result.module 
		version= result.version 
		cachedInfo= result.cachedInfo
		proposedInstall= result.proposedInstall
		if not await @_fileExists(cachedInfo.tarball)
			# download 
			await @_lock cachedInfo.tarball+".lock"
			try 
				
				#console.info("Cachedinfo:",cachedInfo.moduleinfo)
				dist= cachedInfo.moduleinfo.data.versions[result.version]?.dist
				if not dist?.tarball 
					throw new Error("Failed to get a tarball for module #{module}@#{version}")
				
				# here now downloaded the tarball 
				await @_filerequest dist.tarball, cachedInfo.tarball
				# verify download 
				await @_verifyDownlaod dist, cachedInfo.tarball 


				cachedInfo.moduleinfo.versions=cachedInfo.moduleinfo.versions ? {}
				cachedInfo.moduleinfo.versions[version]= 
					version: version 
					name: module 
					install: proposedInstall
					dist: dist 
					tarball: cachedInfo.tarball
				await fs.writeFileAsync cachedInfo.file, JSON.stringify(cachedInfo.moduleinfo,null,'\t')

			catch e 
				# delete tarball 
				if await @_fileExists cachedInfo.tarball
					await fs.unlinkAsync cachedInfo.tarball

				throw e 
			finally 
				await @_unlock cachedInfo.tarball+".lock"
		

		# with tarball now can extract 
		temppath= proposedInstall.folder +  ".temp-" + uniqid()
		await @_lock proposedInstall.lock 
		try 
			await fs.mkdirAsync temppath

			# extract to this folder
			
			await tar.x
				file: cachedInfo.tarball 
				C: temppath
			
			contents= await fs.readdirAsync(temppath)
			if not contents.length 
				throw new Error("Failed extracting tarball")

			if await @._fileExists proposedInstall.folder 
				removeoptions= await @._maybeRemoveProposed proposedInstall.folder, result
				if removeoptions 
					if removeoptions.changed 
						proposedInstall.folder= removeoptions.folder 
						#console.info("changing proposed folder: ", proposedInstall.folder)
					else 
						return 


			await fs.renameAsync Path.join(temppath, contents[0]), proposedInstall.folder 

		catch e 
			if e.message.indexOf("zlib") >= 0
				# retry 
				await fs.unlinkAsync(cachedInfo.tarball)
				return await @_downloadCache result
			throw e
		finally 
			await @_removedir temppath 
			await @_unlock proposedInstall.lock 





	_sleep: (timeout = 100)->
		return new Promise (resolve)-> setTimeout resolve, timeout


	

export default Registry