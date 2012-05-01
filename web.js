
/**
 * Module dependencies.
 */

var express = require('express')
  , util = require('util')
  , _ = require('underscore')
  , routes = require('./routes')
  , ejs = require('ejs')
  , dnode = require('dnode')
  , moment = require('moment')
  , request = require('request');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes
app.get('/', function(req, res) {
  res.render("index.ejs");
});

app.get('/log', function(req,resp) {
  var filterObj = _.pick(req.query,"site","level");
  var hasLeft = _.has(req.query,"dateLeft");
  var hasRight = _.has(req.query,"dateRight");
  if( hasLeft && hasRight ) {
    filterObj.date = { "$gte": new moment(req.query.dateLeft).format("YYYY-MM-DD") , "$lte" : new moment(req.query.dateRight).format("YYYY-MM-DD") };
  } else if(hasLeft) {
    filterObj.date = new moment(req.query.dateLeft).format("YYYY-MM-DD");
  } else if(hasRight) {
    filterObj.date = new moment(req.query.dateRight).format("YYYY-MM-DD");
  }
  console.log(util.inspect(filterObj)); 
  dnode.connect(7000,function(remote){
    remote.filter(filterObj,function(err,docs){
      if(err) { console.log(err); resp.send(500); }
      else { resp.send(docs); }
    });
  });
});
app.get('/log/level/:level?', function(req, resp) {
  dnode.connect(7000,function(remote){
    console.log("remoting to " + remote.toString());
    remote.selectLevel(req.params.level, function(err, docs){
      if(err) { console.log(err); resp.send(500); }
      else { resp.send(docs); }
    });
    
  });
});
app.listen(3002);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

