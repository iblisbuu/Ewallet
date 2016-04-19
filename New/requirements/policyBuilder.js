var harmony = require('harmony-reflect');
var Reflect = require('./reflect.js');

function isEmpty(obj) {
   for (var x in obj) { if (obj.hasOwnProperty(x))  return false; }
   return true;
}

var defaultStateMethodArg =  {
	filter: function(arguments,condition){
	 	if (arguments[0] == condition[0]){
	 		return false;
	 	}else{
	 		return true;
	 	}
	 }
}

var defaultWhiteList = {
	filter: function(name,whiteList){
		if(whiteList.indexOf(name) == -1){
      		return false;
      	}else{
        	return true;
      	}
   }
}

var defaultBlackList = {
   filter: function(name,blackList){
    if(blackList.indexOf(name) == -1){
      return true;
      }else{
        return false;
      }
   }
}

var defaultStateMethod = {
	filter: function(){
		return true;
	}
}

var defaultTempSet = {
	filter : function(){
		return false;
	}
}

function cleanState(inputState,defaultState){
 	if (isEmpty(inputState)){
 		return defaultState;
 	}else{
 		return inputState;
 	}
}

function policy(inputState){
	 this.state = inputState; 
	 this.deny = function(denyObject){
	 	var err = new Error( 'is not allowed by the proxy' );
	 		if (denyObject.hasOwnProperty('method')) {
        			this.handler = {
        				get:function(target,name,recv){
        					console.log("get: " + name);
 							var method = Reflect.get(target, name, recv);
 							if (name === denyObject['method']){
 								if(denyObject.hasOwnProperty('arguments')){
 									return function () {
 										this.state = cleanState(inputState,defaultStateMethodArg);										
 										if (this.state.filter(arguments,denyObject['arguments'])){
	 										return Reflect.apply(method, this, arguments);
	 									}else{
					 						throw err;
	 									}
	 								}
 								}else {
 									 this.state = cleanState(inputState,defaultStateMethod);
 									 if (this.state.filter()){
 										return method;
 									}else{
 										//console.log(name);
					 					throw err;
 									}
 								}
 							}else{
 								return method;
 							}
        				}
        			}
        		}else if(denyObject.hasOwnProperty('propertyUpdate')){
        			var state = this.state;
        			this.handler = {
        				set:function(target,name,value,recv){
        					console.log("set: " +name);
        					if(denyObject['propertyUpdate'] === name){
        						if (state.filter(target,name,value,recv)){
        							Reflect.set(target,name,value,recv);
        						}else{
        							throw err;
        						}
        					}
        					Reflect.set(target,name,value,recv);
        				}
        			}
        		}
		return this;
	 }

	 this.whiteList = function(allowedList){
	 	this.state = { 
	 		filter : function(target,name,value,receiver){
	 			if (allowedList.indexOf(value) != -1){
	 				return true;
	 			}else{
	 				return false
	 			}
	 		}
	 	}
	 	return this;
	 }

	 this.install = function(target){
	 	return new Proxy(target,this.handler);
	 }
}

module.exports.policy = policy;
//window.policy = policy;
