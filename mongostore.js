var _ = require("underscore"),
	util = require("util"),
	events = require('events').EventEmitter,
	BaseStore = require('./store').Base,
	mongodb = require('mongodb'),
	ObjectID = require('mongodb').ObjectID;

var MongoStore = (function() {
	this.__proto__ = BaseStore.prototype;
	var connection = null;
	var dbConnectionWrapper = null;
	var dbConnection = null;
	var logCollection = "logs";
	var self = this;
	function guidGenerator() {
    	var S4 = function() {
       		return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    	};
    	return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
	}
	function wrapFunction(fn,context,params) {
		return function() {
			fn.apply(context,params);
		}
	}

	self.connect = function(host,port,db,user,pass) {
		connectionGuid = guidGenerator();
		mongoserver = new mongodb.Server(host, port, {auto_reconnect: true}),
    	connection = new mongodb.Db(db, mongoserver, {});
    	connection.on('close', function() {
    		self.log("Database Connection closed");
    	});
    	dbConnectionWrapper = function(scope) {
    		if(dbConnection!=null) { scope.apply(self,[dbConnection]); } 
    		else {
		    	connection.open(function(err,database){
		    		if(err) {
		    			self.log(err); 
		    		}
		    		if(user && user.lenght>0 && pass) {
		    			connection.authenticate(user,pass,function(err,authenticated){
		    				if(err) { 
		    					self.log(err); 
		    					scope.apply(self,[dbConnection]);
		    				}
		    				else {
									if(authenticated) {
			    					dbConnection = database;
		    						self.log("Authenticated!");
			    					scope.apply(self,[dbConnection]);
			    				}
			    			}
		    			});	
		    		}
		    		else {
		    			if(err) { 
		    				self.log(err); 
		    				scope.apply(self,[dbConnection]);
		    			}
		    			else {
			    			dbConnection = database;
			    			scope.apply(self,[dbConnection]);
			    		}
						}
		    	});
	    	}
	    };
    	return self;
	};
	self.create = function(object, callback) {
		dbConnectionWrapper(function(db){
			db.collection(logCollection,{},function(err,collection){
				collection.insert(object,{safe:true},callback);
			});
		});
	};
	self.save  = function(object, callback) {
		dbConnectionWrapper(function(db){
			db.collection(logCollection,{},function(err,collection){
				collection.findAndModify(
					{_id: new ObjectID(object._id)},
					[["_id",1]],
					object,
					function(err,doc){
					if(err) { console.log("ERROR Saving"); callback(err,doc); }
					else { 
						console.log("Found and updated " + util.inspect(doc)); 
						callback(err,doc); 
					}
				});
			});
		});
	};
	self.findById = function(id,callback) {
		
		dbConnectionWrapper(function(db){
			db.collection(logCollection,{}, function(err,collection){
				self.log("[findById]: Finding id: " + id);
				collection.findOne({_id: id},callback);
			});
		});
	};
	self.select = function(query,callback) {
		if(query && query.query) { query = query.query; }
		dbConnectionWrapper(function(db){
			db.collection(logCollection,{}, function(err, collection){
				var objQuery = {};
				_.each(query,function(value,key){
					if(_.isArray(value)) {
						objQuery[key] = {$in: value }
					} else {
						objQuery[key] = value;
					}
				});
				collection.find(objQuery,{sort:{"timestamp":-1}}).toArray(callback);
			})
		});
		
	};
	self.distinct = function(key, callback) {
		dbConnectionWrapper(function(db){
			db.collection(logCollection,{}, function(err, collection){
				collection.distinct(key,callback);
			});
		});
	}

	return self;
})(); 
module.exports.Mongo = MongoStore;
