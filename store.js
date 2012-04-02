var _ = require("underscore"),
	couchdb = require('felix-couchdb'),
	util = require("util");


var BaseStore = {
	url: "",
	username: "",
	password: "",
	connection: null,
	connect : function(host,port,db,user,pass) {},
	create : function(object,callback) {},
	update: function(object,callback) {},
	findById : function(id,callback) {},
	select : function(query,callback) {},
	log: function(message) {
		console.log(message);
	}
};

var CouchStore = (function() {
	var couch = {
		connection: null,
		connect: function(host,port,db,user,pass) {
			var client = couchdb.createClient(port, host);
	    	this.connection = client.db(db);
	    	return this;
		},
		create: function(object,callback) {

		},
		update: function(object,callback) {

		},
		findById: function(id,callback) {

		},
		select: function(query,callback) {
			console.log(util.inspect(query));
			this.connection.view(query.db,query.view,query.input,function(err,data){
				var newData =null;
				if(err) { 
					
				} else {
					var newData = _.map(data,function(val) { return val.value; });
				}
				callback(err,{});
			});
		}
	};

	return _.extend({},BaseStore,couch);
		
})();

module.exports.Couch = CouchStore;






