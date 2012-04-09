var vows = require('vows'),
	logsumer = require('./logsumer'),
    assert = require('assert'),
    couchstore = require('./store.js').Couch,
    db = couchstore.connect('lazysoftware.iriscouch.com', 80,"log","","");
    function guidGenerator() {
    	var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    	return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
	}

var ERROR1_guid = guidGenerator();
var ERROR1 = {site:"test1",level:"ERROR",timestamp:new Date(),threadId:4,message:"Error id: " + ERROR1_guid + " Someone sent us up the bomb"};

vows.describe('create new log').addBatch({
	'when creating a new error log' : {
		topic: function() {  var logger = new logsumer(db);
								logger.create(ERROR1,this.callback); 
						  },
		'Callback produces error document created' : function(doc) {
			assert.isNotNull (doc);
		}

	},
	'when viewing ERROR log level' : {
		topic: function() { var logger = new logsumer(db); 
							logger.selectLevel("ERROR",this.callback);
							},
		'should return with 3 logs' : function(docs) {
			assert.strictEqual(docs.length>3,true);
		}
	},
	'when finding byErrorId ' : {
		topic: function() { var logger = new logsumer(db); 
							logger.findByErrorId(ERROR1_guid,this.callback);
							},
		'should return with ERROR1 log' : function(doc) {
			assert.deepEqual(doc.message,ERROR1.message);
		}
	}
}).run();