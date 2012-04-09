
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , ejs = require('ejs')
  , plates = require('plates')
  , dnode = require('dnode')
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
  dnode.connect(7000,function(remote){
    console.log("remoting to " + remote.toString());
    remote.selectLevel(req.params.level, function(err, docs){
      if(err) { console.log(err); resp.send(500); }
      else { resp.send(docs); }
    });
    
  });
  //var requestURL = "http://localhost:3000"+req.url;
  //console.log(requestURL);
  //req.pipe(request(requestURL)).pipe(resp);
  
});
app.get('/magic', function(req, resp){
  var html = '<ul class="peoples"><li class="people"><span id="name"></span> <span id="age"></span></li></ul>';
  var data = { people : [
      {name:"Bob", age: 27},
      {name:"Lisa", age: 28}
  ]

  };
  resp.send(plates.bind(html, data));
})
app.listen(3002);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

