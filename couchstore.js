var _ = require("underscore"),
	util = require("util"),
	events = require('events').EventEmitter,
	BaseStore = require('./store').Base,
	couchdb = require('felix-couchdb');


var CouchStore = (function() {
	this.__proto__ = BaseStore.prototype;
	var connection = null;
	var self = this;
	self.connect = function(host,port,db,user,pass) {
			this.log("Connecting to couch store: " + host + " on port: " + port);
			var client = couchdb.createClient(port, host);
	    	connection = client.db(db);
	    	return this;
	};
	self.create = function(object,callback) {
		connection.saveDoc(object,callback);
	}
	self.update = function(object,callback) {

	};
	self.findById = function(id,callback) {
		connection.getDoc(id,function(err,data){
			if(err) {
				self.log(err.toString());
			}
			callback(err,data);
		});
	};
	self.select = function(query,callback) {
		if(query && query.query) { 
			var value = null;
			for(var key in query.query) {
				if(key) {
					value = query.query[key];
				}
			}
			query.input = {key: value };
		}
		connection.view(query.db,query.view,query.input,function(err,data){
			var newData = null;
			if(err) { 
				console.log(err.toString());
			} else {
				newData = _.map(data.rows,function(val) { return val.value; });
			}
			callback(err,newData);
		});
	};
	self.distinct = function(key, callback) {
		callback("Not implemented!",null);
	}

	return self;
})();

module.exports.Couch = CouchStore;