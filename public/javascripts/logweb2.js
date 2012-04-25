MyApp = new Backbone.Marionette.Application();

MyApp.addRegions({
  listRegion: "#list"
});

LogRouter = Backbone.Router.extend({
  routes: {
        "log/:level": "level"
  },
  logsCollection: null,
  initialize: function(options) {
  	this.logsCollection = options.logs;
  },
  level: function(level) {
      this.logsCollection.level(level);
   }
});

MyApp.addInitializer(function(options){
  var logRouter = new LogRouter({logs: options.logs});
  var logCollectionView = new LogList({collection: options.logs});
  
  MyApp.listRegion.show(logCollectionView);
  Backbone.history.start();
});

Log = Backbone.Model.extend({
	 url : function() {
    var base = 'log';
    if(this.isNew()) { return base; }
    return base + '/' + this.id;
  	}
});

LogCollection = Backbone.Collection.extend({
	model:Log,
	url: "log",
	level: function(level) {
    	this.applyFilter({level:level});
  	},
  	applyFilter: function(filter) {
  		this.fetch({data: filter});
  	}
});

LogRow = Backbone.Marionette.ItemView.extend({
  template: "#log-row-template",
  tagName: "li",
  className: "log-entry"
});

LogList = Backbone.Marionette.CollectionView.extend({
	itemView: LogRow,
	tagName: "ul"
})