

var Logsumer = module.exports = function(db) {
  var self = {};
  self.create = function(object,callback) {
    if(object.timestamp) { object.timestamp = object.timestamp.toJSON().replace("T"," ");}
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
  self.selectLevel = function(level,callback) {
    db.select({db:"log",view:"level",input:{key: level}},function(err, docs) { 
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
    db.select({db:"log",view:"date",input:{key: dateString}},function(err, docs){
      callback(err,docs);
    });
  }
  self.selectSite = function(site,callback) {
    db.select({db:"log",view:"site",input:{key:site}},function(err,docs){
      callback(err,docs);
    });
  }
  return self;
}