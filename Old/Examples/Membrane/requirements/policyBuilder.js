var harmony = require('harmony-reflect');
var membranes = require('./membranes.js');
var Reflect = require('./reflect.js');
//var wm = new WeakMap();

function requireClean (filePath){
	var wetTarget = require (filePath);
    var bob = membranes.makeMembrane(wetTarget).target;
    return bob;
}


function handler(state,whiteList,obj) {
	return{
		get : function(target,name,recv){
			console.log("get: " + name);
			var method = Reflect.get(target, name, recv);
			if (typeof method === "function")
			  return function () {
				if (state.condition(name,whiteList,arguments)){			 
               		return Reflect.apply(method, target, arguments);
				}
				else {
					var err = new Error(name +' is not allowed by the proxy' );
					throw err;
				}
			  }
			  
			if (state.condition(name,whiteList)){			 
               return method
			}
			else {
				var err = new Error(name +' is not allowed by the proxy' );
				throw err;
			}
		},
		set: function(target,name,val){
			console.log("set: "+name);
			//target[name] = val;
			Reflect.set(target,name,val);
		},
		construct: function(target, argumentsList) {

		if (state.condition(argumentsList)){
			return Reflect.construct(target,argumentsList)
		}else{
			var err = new Error( 'is not allowed by the proxy' );
			throw err;
		}
	}

	}

}

function policy(state){
 	this.allow = function(allowedListFunctions){
 		this.nameFunction = allowedListFunctions;
 		return this;
 	}
 	this.deny = function(denyListFunctions){
 		this.nameFunction = denyListFunctions;
 		return this;
 	}

 	this.install = function(fromValue){
 		if (true){
 			return new Proxy(fromValue,handler(state,this.nameFunction,fromValue));
 		}
 	}
}



module.exports.policy = policy;
module.exports.requireClean = requireClean;
