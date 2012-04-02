
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , ejs = require('ejs')
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

app.get('/logs/level/:level?', function(req, resp) {
  var requestURL = "http://localhost:3000"+req.url;
  console.log(requestURL);
  req.pipe(request(requestURL)).pipe(resp);
  
});

app.listen(3001);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
