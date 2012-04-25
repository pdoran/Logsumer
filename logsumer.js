var moment = require('moment');

var Logsumer = module.exports = function(db) {
  var sites = [];
  var self = {};
  self.create = function(object,callback) {
    if(object.timestamp) { 
      var ts = moment(object.timestamp);
      object.date = ts.format("YYYY-MM-DD");
      object.time = ts.hours()+":"+ts.minutes()+":"+ts.seconds()+"."+ts.milliseconds();
      object.timestamp = object.timestamp.toJSON();
      object.timezone = ts.format("Z");
    } else {
      var ts = new Date();
      object.timestamp = ts.toJSON();
      object.date = ts.format("YYYY-MM-DD");
      object.time = ts.hours()+":"+ts.minutes+":"+ts.seconds()+"."+ts.milliseconds();
      object.timezone = ts.format("Z");
    }
    db.create(object,function(err,doc) {
      console.log("Creating...");
      callback(err,doc);
    });
  };
  self.findById = function(id,callback) {
    db.findById(id,function(err,doc){
      callback(err,doc);
    });  
  };
  self.filter = function(filter,callback) {
    db.select({db:"log",view:"filter",query:filter},function(err,docs){
      callback(err,docs);
    })
  }
  self.selectLevel = function(level,callback) {
    db.select({db:"log",view:"level",query:{"level": level}},function(err, docs) { 
      callback(err,docs);
    });  
  };
  self.findByErrorId = function(id,callback) {
    self.selectLevel("ERROR",function(err,docs){
      var doc = null;
      for(i=0;i<docs.length;i++) {
        var doc = docs[i];
        if(doc.message.indexOf(id)!=-1) break;
      }
      callback(err,doc);
    });
  }
  self.selectDate = function(date,callback) {
    var dateString = "";
    if(date instanceof Date) { dateString = date.toISOString().split("T")[0]; }
    else { dateString = date; }
    db.select({db:"log",view:"date",query:{"timestamp": dateString}},function(err, docs){
      callback(err,docs);
    });
  }
  self.selectSite = function(site,callback) {
    db.select({db:"log",view:"site",query:{"site":site}},function(err,docs){
      callback(err,docs);
    });
  }
  self.getSites = function(callback) {
    if(sites.length>0) { 
      db.log("Sites is cached fetching from cache");
      callback(null,sites); 
    }
    else 
    { 
      db.distinct("site",callback);
    }
  }
  return self;
}