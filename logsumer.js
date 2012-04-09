

var Logsumer = module.exports = function(db) {
  var self = {};
  self.create = function(object,callback) {
    db.create(object,function(err,doc) {
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
  return self;
}