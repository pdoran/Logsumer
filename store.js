var _ = require("underscore"),
	couchdb = require('felix-couchdb'),
	util = require("util");


var BaseStore = function() {
	var connection = null;
	this.connect = function(host,port,db,user,pass) {};
	this.create = function(object,callback) {};
	this.update =  function(object,callback) {};
	this.findById = function(id,callback) {};
	this.select = function(query,callback) {};
	this.log = function(message) {
		console.log(message);
	};
};

var CouchStore = (function() {
	this.__proto__ = BaseStore.prototype;
	var connection = null;
	this.connect = function(host,port,db,user,pass) {
			var client = couchdb.createClient(port, host);
	    	connection = client.db(db);
	    	return this;
	};
	this.create = function(object,callback) {
		connection.create(object,callback);
	}
	this.update = function(object,callback) {

	};
	this.findById = function(id,callback) {

	};
	this.select = function(query,callback) {
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

	return this;
})();

module.exports.Couch = CouchStore;