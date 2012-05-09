var moment = require('moment'),
    cache = require('./cachestore.js').Cache.init(["site","date"]),
    events = require('events').EventEmitter,
    _ = require('underscore'),
    util = require('util');

var Logsumer = module.exports = function(db) {
  var sites = [];
  var self = {};
  self.cacheEmitter = cache.emitter;
  self.emitter = new events();
  self.create = function(object,callback) {
    if(object.timestamp) { 
      var dateParts = object.timestamp.split("T");
      var ts = moment(dateParts[0],"YYYY-MM-DD");
      object.date = ts.format("YYYY-MM-DD");
      object.time = ts.hours()+":"+ts.minutes()+":"+ts.seconds()+"."+ts.milliseconds();
      //object.timestamp = ts.toDate().toJSON();
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
      self.emitter.emit("create",doc);
      callback(err,doc);
    });
  };
  self.save = function(object,callback) {
    db.save(object,callback);
  }
  self.findById = function(id,callback) {
    db.findById(id,function(err,doc){
      callback(err,doc);
    });  
  };
  self.filter = function(filter,callback) {
    db.select({db:"log",view:"filter",query:filter},function(err,docs){
      callback(err,docs);
    });
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
  self.distincts = function(keys,callback) {
    var calls = new events();
    var keyCount = (typeof keys === "string") ? 1 : keys.length;
    var returnObject = {};
    var errs = [];
    calls.on('complete',function(key,value){
      console.log("Getting distincts completed for " + key);
      keyCount--;
      returnObject[key] = value;
      if(keyCount===0) {
        if(errs.length===0) callback(null,returnObject);
        else callback(errs,returnObject);
      }
    });
    calls.on('error',function(err){
      console.log("Getting distincts error " + err);
      keyCount--;
      errs.push(err);
      if(keyCount===0) {
        callback(errs,returnObject);
      }
    });
    _.each(keys,function(key){
      var cb = function(err,values) {
        if(err) calls.emit('error',err);
        else {
          calls.emit('complete',key,values);
        }
      }
      cache.get(key,db.distinct,cb);
    });

  };
  self.updateCache = function(object) {
    _.each(object,function(value,key){
      if(cache.hasKey(key)) {
        cache.updateIfNeeded(key,value);
      }
    });
  };
  return self;
}