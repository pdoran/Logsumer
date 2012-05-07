var util = require('util'),
		_ = require('underscore');

var CacheStore = (function() {

	var store = {}
	var self = this;

	self.init = function(key) {
		if(typeof key === "string") { 
			store.key = null;
		}
		else {
			_.each(key, function(val) {
				store.val = null;
			});
		}
		return self;
	};
	self.get = function(key,miss,callback) {
		if(store.key!=null) {
			console.log("Cache hit on: " + key + " of value " + store.key);
			callback(null,store.key);
		} else {
			console.log("Miss on key " + key + " applying cache miss function");
			miss.apply(this,[key,function(err,values){
			console.log("Applied the miss and getting back these values " + values);
			if(err) console.log(err);
			store[key] = values;
			callback(err,values);
		}]);	
		}
		
	};
	return self;
	})(); 

module.exports.Cache = CacheStore;