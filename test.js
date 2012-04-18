var vows = require('vows'),
	util = require('util'),
	logsumer = require('./logsumer'),
    assert = require('assert'),
    couchstore = require('./couchstore.js').Couch,
    db = couchstore.connect('lazysoftware.iriscouch.com', 80,"log2","",""),
	logger = new logsumer(db);

    function guidGenerator() {
    	var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    	return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
	}

var ERROR1_guid = guidGenerator();
var ERROR1 = {site:"test1",level:"ERROR",timestamp:new Date(),threadId:4,message:"Error id: " + ERROR1_guid + " Someone sent us up the bomb"};

vows.describe('create new log').addBatch({
	'when creating a new error log with CouchStore' : {
		topic: function() {  logger.create(ERROR1,this.callback); },
		'Callback produces error document created' : function(doc) {
			assert.isNotNull(doc._id);
		},
		'when viewing ERROR log level' : {
			topic: function() { logger.selectLevel("ERROR",this.callback); },
			'should return with 3 logs' : function(docs) {
				assert.strictEqual(docs.length>=1,true);
			}
		},
		'when finding byErrorId ' : {
			topic: function() { logger.findByErrorId(ERROR1_guid,this.callback); },
			'should return with ERROR1 log' : function(doc) {
				assert.deepEqual(doc.message,ERROR1.message);
			}
		},
		'when findingy by Date' : {
			topic: function() { logger.selectDate(new Date(),this.callback); },
			'should return logs for specified date' : function(docs) {
				assert.deepEqual(docs[0].timestamp.split(" ")[0], new Date().toJSON().split("T")[0]);
			}
		},
		'when finding by Site' : {
			topic: function() { logger.selectSite(ERROR1.site,this.callback); },
			'should return with at least 1 log' : function(docs) {
				assert.strictEqual(docs.length>0,true);
			}
		}
	}
}).run();