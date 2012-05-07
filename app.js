var express = require('express'),
    util = require('util'),
    jsDiff = require('./diff'),
    mongoStore = require('./mongostore').Mongo,
    dnode = require('dnode'),
    app = express.createServer(),
    Logsumer = require('./logsumer'),
    db_mongo = mongoStore.connect('localhost',27017,"log","","");

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
  },
  filter: function(filter,cb) {
    console.log("Filtering: " + util.inspect(filter));
    logger.filter(filter,function(err,docs){
      cb(null,docs);
    });
  },
  saveLog: function(doc,cb) {
    console.log("Saving: " + util.inspect(doc));
    logger.save(doc,cb);
  },
  distincts: function(key,cb) {
    if(typeof key === "string") { key = [key]; }
    console.log("Finding distincts for: " + util.inspect(key));
    logger.distincts(key,cb);
  }
});
server.listen(7000);

app.post('/logs', function(req, resp) { 
    logger.create(req.body,function(err,doc){
      if(err) { console.log(err); }
    });
    resp.send(200);
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