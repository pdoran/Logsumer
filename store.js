var _ = require("underscore"),
	util = require("util");
	


var BaseStore = (function() {
	var connection = null;
	this.connect = function(host,port,db,user,pass) {};
	this.create = function(object,callback) {};
	this.update =  function(object,callback) {};
	this.findById = function(id,callback) {};
	this.select = function(query,callback) {};
	this.distinct = function(key,callback) {};
	this.log = function(message) {
		console.log(message);
	};
	return this;
})();

module.exports.Base = BaseStore;

