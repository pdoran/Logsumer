
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
  , request = require('request')
  , faye = require('faye');

var app = module.exports = express.createServer();
var bayeux = new faye.NodeAdapter({mount: '/faye', timeout: 45});
//ports
var dnodePort = 7000;
var dnodeHost = "localhost";
var fayeHost = "localhost";
var fayePort = 8000;
var expressPort = 3002;
var bayeuxPort = 8001;
var bayeuxHost = "localhost";
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
  getFilterDefaults(function(err,distincts) {
    console.log(util.inspect(distincts));
    res.render("index.ejs", {faye: {host: bayeuxHost, port: bayeuxPort,mount:"/faye"}, filter: distincts } );  
  });
});

app.get('/log', function(req,resp) {
  var filterObj = _.pick(req.query,"site","level");
  var hasLeft = _.has(req.query,"dateLeft");
  var hasRight = _.has(req.query,"dateRight");
  console.log("req.query: " + util.inspect(req.query));
  if( (hasLeft && req.query.dateLeft!="") && (hasRight && req.query.dateRight!="") ) {
    filterObj.date = { "$gte": new moment(req.query.dateLeft).format("YYYY-MM-DD") , "$lte" : new moment(req.query.dateRight).format("YYYY-MM-DD") };
  } else if(hasLeft && req.query.dateLeft!="") {
    filterObj.date = new moment(req.query.dateLeft).format("YYYY-MM-DD");
  } else if(hasRight && req.query.dateRight!="") {
    filterObj.date = new moment(req.query.dateRight).format("YYYY-MM-DD");
  }
  console.log(util.inspect(filterObj)); 
  dnode.connect(dnodeHost,dnodePort,function(remote){
    remote.filter(filterObj,function(err,docs){
      if(err) { console.log("Error on filter " + err); resp.send(500); }
      else { resp.send(docs); }
    });
  });
});



var SaveDocument = function(req,resp) {
  console.log(util.inspect(req.body));
  dnode.connect(dnodeHost,dnodePort,function(remote){
    remote.saveLog(req.body,function(err,doc){
      if(err) { console.log(err); resp.send(500); }
      else { resp.send(doc); }
    });
  });
};
app.post('/log/:id', SaveDocument);
app.put('/log/:id', SaveDocument);

app.get('/log/level/:level?', function(req, resp) {
  dnode.connect(dnodeHost,dnodePort,function(remote){
    console.log("remoting to " + remote.toString());
    remote.selectLevel(req.params.level, function(err, docs){
      if(err) { console.log(err); resp.send(500); }
      else { resp.send(docs); }
    });
    
  });
});

var getFilterDefaults = function(callback) {
  dnode.connect(dnodeHost,dnodePort,function(remote){
    remote.distincts(["site","date"],function(err,distincts){
      if(err) { console.log(err); }
       callback(err,distincts);
    });
  })
};

app.listen(expressPort);
bayeux.listen(bayeuxPort);
var client = new faye.Client('http://'+fayeHost+':'+fayePort+'/faye');
var pushToClients = new faye.Client('http://localhost:'+bayeuxPort+'/faye');
client.subscribe("/logs/new",function(object){
  console.log("New log " + util.inspect(object));
  pushToClients.publish("/logs/new",object);
});
client.subscribe("/cache/update",function(object){
  console.log("Got the cache update of " + util.inspect(object));
  pushToClients.publish("/filter/update/defaults",object);
});
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);


