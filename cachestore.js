var util = require('util'),
		_ = require('underscore'),
		events = require('events').EventEmitter;

var CacheStore = (function() {

	var self = this;
	var emitter = new events();
	self.store = {};
	self.emitter = emitter;
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
		if(self.store[key]!=null) {
			console.log("Cache hit on: " + key + " of value " + self.store[key]);
			callback(null,self.store[key]);
		} else {
			console.log("Miss on key " + key + " applying cache miss function");
			miss.apply(self,[key,function(err,values){
			console.log("Applied the miss and getting back these values " + values);
			if(err) console.log(err);
			this.store[key] = values;
			emitter.emit("cache:update",key,values);
			callback(err,values);
		}]);	
		}
		
	};
	self.hasKey = function(key) {
		return _.has(self.store,key);
	};
	self.updateIfNeeded = function(key,value,callback) {
		
		if(self.hasKey(key)) {
			var values = self.store[key];
			if(_.isArray(values)) {
				if(!(_.include(values,value))) {
					values.push(value);
				}
			} else if(_.isString(values)) {
				values = [values,value];
			}
			self.store[key] = values;
			emitter.emit("cache:update",key,values);
			callback(null,values);
		}
		callback("Cache mismatch", null);
	};
	return self;
	})(); 

module.exports.Cache = CacheStore;