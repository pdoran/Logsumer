 var util = require('util'), 
 	mongostore = require('./store.js').Mongo,
 	logsumer = require('./logsumer'),
    db = mongostore.connect('flame.mongohq.com',27045,"log","writer","foo");

    function guidGenerator() {
    	var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    	return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
	}

var ERROR1_guid = guidGenerator();
var ERROR1 = {site:"test1",level:"ERROR",timestamp:new Date(),threadId:4,message:"Error id: " + ERROR1_guid + " Someone sent us up the bomb"};

 var logger = new logsumer(db);
var myDoc=null;
 logger.create(ERROR1,function(err,doc){
 	var myDoc=doc[0];
 	console.log(util.inspect(myDoc));
 	logger.findById(myDoc._id,function(err,doc){
 		console.log("LOGGING BY ID" + util.inspect(doc));
 	});
 	logger.selectLevel("ERROR",function(err,docs){
 		console.log("LOGGING BY ERROR LEVEL" + util.inspect(docs));
 	});
 });
