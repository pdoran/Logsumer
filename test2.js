var vows = require('vows'),
	logsumer = require('./logsumer'),
    assert = require('assert'),
    mongostore = require('./mongostore').Mongo,
    util = require('util'),
    db = mongostore.connect('localhost',27017,"log","","");

var logger = new logsumer(db);

    function guidGenerator() {
    	var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    	return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
	}

var ERROR1_guid = guidGenerator();
var ERROR1 = {site:"test1",level:"ERROR",timestamp:new Date(),threadId:4,message:"Error id: " + ERROR1_guid + " Someone sent us up the bomb"};

vows.describe('create new log').addBatch({
'when creating a new error with mongostore' : {
		topic: function() {  logger.create(ERROR1,this.callback); },
		'Callback produces error document created' : function(doc) {
			console.log(util.inspect(doc));
			assert.isNotNull (doc);
		},
    'When selecting distinct set of sites' : {
        topic: function() { logger.getSites(this.callback); },
        'Callback should return at least 1 site' : function(sites) {
            console.log(util.inspect(sites));
            assert.deepEqual(sites.length>0,true);
        }
    }
}
}).run();