var express = require('express'),
    util = require('util'),
    //couchdb = require('felix-couchdb'),
    jsDiff = require('./diff'),
    couchStore = require('./couchstore').Couch,
    mongoStore = require('./mongostore').Mongo,
    dnode = require('dnode'),
    app = express.createServer(),
    Logsumer = require('./logsumer'),
    db = couchStore.connect('lazysoftware.iriscouch.com', 80,"log","",""),
    db_mongo = mongostore.connect('localhost',27017,"log","","");

app.use(express.bodyParser());
var diffBucket = {
  "ERROR": [],
  "WARNING": [],  
  "INFO": []
};

var logger = new Logsumer(db_mongo);
//dnode functions
var server = dnode({
  findById : function(id, cb) {
    logger.findById(id,cb);
  },
  selectLevel : function(level,cb) {
    console.log("Select level: " + level);
    logger.selectLevel(level,cb);
  }
});
server.listen(7000);

app.post('/logs', function(req, resp) { 
    logger(req.body,function(err,doc){
      if(err) { console.log(err); }
    });
    resp.send(200);
});
app.get('/logs/:id?',function(req, resp){
  logger.findById(req.params.id,function(err,doc){
    if(err) { resp.send(err); }
    else { resp.send(doc); }
  });
});
app.get('/logs/level/:level?', function(req, resp) {
  logger.selectLevel(req.params.level,function(err, docs) { 
    if(err) { resp.send(err); }
    else { resp.send(docs); }
  });
});
app.get('/logs/date/:date?', function(req, resp) {
  logger.selectDate(req.params.date,function(err, docs) { 
    if(err) { resp.send(err); }
    else { resp.send(docs); }
  });
});

app.get('/funk', function(req, resp) {
    db.view('log','level', {key: 'INFO'},  function(err, docs) { 
    if(err) { resp.send(err); }
    else {
      console.log(util.inspect(docs));
      var beforeCount = docs.rows[1].value.message.length;
      var afterCount = docs.rows[2].value.message.length;
      var wordLength = beforeCount + afterCount / 2;
      var diffs = jsDiff.diffWords(docs.rows[1].value.message, docs.rows[2].value.message);
      var diffObj=diffHTMLGenerator(diffs);
      var threshhold = false;
      if(passesThreshold(diffObj,(2/3))) {
        threshhold =true;
      }
      resp.send("<html><body>"+diffObj.diffHTML+"<br>" + "diffAdds: " + diffObj.diffAdds + ", diffRemoves: " + diffObj.diffRemoves + ", diffSame: " + diffObj.diffSame + ", diffAddsTextLength: " + diffObj.diffAddsTextLength + ", diffRemovesTextLength: " + diffObj.diffRemovesTextLength + ", diffSameTextLength: " + diffObj.diffSameTextLength + " Threshold: " + threshhold + "</body></html>");
    }
  });
});
app.get('/doit/level/:level?', function(req, resp) {
  db.view('log','level', {key: req.params.level},  function(err, docs) { 
    if(err) { resp.send(err); }
    else { 
      var rows = docs.rows;
      for(var i=0;i<rows.length;i++) {
        console.log(util.inspect(rows[i].value));
        diffBucket = GroupItem( rows[i].value , diffBucket  );
      }
        resp.send(util.inspect(diffBucket[req.params.level])); 
        //resp.send(util.inspect(docs));
      }
  });

});
app.get('/', function(req, resp) { 
    var diffs = jsDiff.diffWords("hello my name is patrick. I am awesome!", "hello my name is jason. I am cool!");
    var diffString=diffHTMLGenerator(diffs);
    resp.send("<html><body>"+diffString+"</body></html>");
});

var passesThreshold = function(objDiff, threshold) {
  return (objDiff.diffSameTextLength * (threshold)) >= (objDiff.diffAddsTextLength+objDiff.diffRemovesTextLength);
}
var diffHTMLGenerator = function(diffs) {
  var diffString="";
  var diffObj = { 
    diffHTML : "",
    diffAdds: 0,
    diffRemoves: 0,
    diffSame: 0,
    diffAddsTextLength: 0,
    diffRemovesTextLength: 0,
    diffSameTextLength: 0
  
  }
    for(var i=0;i<diffs.length;i++) {
      var objDiff = diffs[i];
      if(objDiff.added) {
        diffObj.diffAdds++;
        diffObj.diffAddsTextLength+= objDiff.value.length;
        diffObj.diffHTML+= "<ins>"+objDiff.value+"</ins>";
      } else if(objDiff.removed) {
        diffObj.diffRemoves++;
        diffObj.diffRemovesTextLength+= objDiff.value.length;
        diffObj.diffHTML+= "<del>"+objDiff.value+"</del>";
      } else {
        diffObj.diffSame++;
        diffObj.diffSameTextLength+= objDiff.value.length;
        diffObj.diffHTML += objDiff.value;
      }
    }
    return diffObj;
}
var GroupItem = function(item, groupObject) {
  var buckets = groupObject[item.level];
  var message = item.message;
  if(buckets.length==0) { 
    var ids = new Array();
    ids.push(item._id);
    
    var bucket = { "ids": ids, "message": message };
    buckets.push(bucket);
    groupObject[item.level] = buckets;
    console.log("Adding to empty bucket: " + ids[0]);
    return groupObject;
  } else {
    var diffObj, bucket, diffs;
    for(var i=0;i<buckets.length;i++) {
      var bucket = buckets[i];
      var diffs = jsDiff.diffWords(message, bucket.message);
      var diffObj=diffHTMLGenerator(diffs);
      if(passesThreshold(diffObj,(2/3))) {
        bucket.ids.push(item._id);
        buckets[i] = bucket;
        groupObject[item.level] = buckets;
        console.log("Adding to current bucket: " + bucket.ids[0] + " id matching " + item._id + " bucket size " + bucket.ids.length);
        return groupObject;
      }
    }
    var ids = new Array();
    ids.push(item._id);
    var bucket = { "ids": ids, "message": message };
    buckets.push(bucket);
    groupObject[item.level] = buckets;
    console.log("Adding to empty bucket no matches: " + ids[0]);
    return groupObject;
  }
  console.log("We didn't add anything this is odd.");
  return groupObject;
}

app.listen(3000);