MyApp = new Backbone.Marionette.Application();

MyApp.addRegions({
  listRegion: "#list",
  filterModalRegion: "#filter",
  filterTabRegion: "#filter-tab"
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
  var myFilter = options.filterOptions;
  myFilter.on("change:filter", function(model,filter){
  	options.logs.applyFilter(filter);
  });
  if(options.faye) {
  	var fayeClient = new Faye.Client(options.faye);
  	fayeClient.subscribe("/filter/update/defaults",function(object){
  		myFilter.set(object.key,object.values);
  	});
  	options.logs.linkSubscription(fayeClient);
  }
  MyApp.listRegion.show(logCollectionView);
  MyApp.filterModalRegion.show(new FilterModal({model:myFilter}));
  Backbone.history.start();
});


Log = Backbone.Model.extend({
	idAttribute: "_id",
	url : function() {
    var base = 'log';
    if(this.isNew()) { return base; }
    return base + '/' + this.id;
  },
  defaults: {
  	"threadId": ""
  },
  read: function() {
  	this.toggle("is_read");
  	this.save();
  },
  flag: function() {
  	this.toggle("is_flag");
  	this.save();
  },
  toggle: function(field) {
  	var obj = {};
  	if(this.get(field)==1 || this.get(field)=="1") {
  		obj[field] = "0";
  	} else {
  		obj[field] = "1";
  	}
  	this.set(obj);
  },
  parse: function(response) {
  	console.log(response);
  	return response;
  }
});

Filter = Backbone.Model.extend({
	url: function() {
		var base = 'filter';
		if(this.isNew()) { return base; }
		return base + '/' + this.id;
	}
});

LogCollection = Backbone.Collection.extend({
	model:Log,
	url: "log",
	client:null,
	myFilter:null,
	level: function(level) {
    	this.applyFilter({level:level});
  	},
  	applyFilter: function(filter) {
  		this.myFilter = filter;
  		this.fetch({data: filter,
  			success: function(collection,response){
  				console.log(collection.toJSON());
  			},
  			error: function(collection,response){
					console.log(response);
  			}});
  	},
  	linkSubscription: function(client) {
  		this.client = client;
  		var self = this;
  		client.subscribe("/logs/new", function(object) {
  			self.add(object,{at:0});
  		});
  	},
  	
});

LogRow = Backbone.Marionette.ItemView.extend({
	initialize: function(){
    this.bindTo(this.model, "change", this.renderChange);
  },
  template: "#log-row-template",
  tagName: "li",
  className: "log-entry",
  events: {
  	"click .toggle-read": "read",
  	"click .toggle-flag": "flag"
  },
  renderChange: function() {
  	this.render();
  },
  read: function() {
  	this.model.read();
  },
  flag: function() {
  	this.model.flag();
  },
  templateHelpers: {
  	isRead: function() {
  		if(this.is_read && parseInt(this.is_read,10)==1) return true;
  		return false;
  	},
  	isFlag: function() {
  		if(this.is_flag && parseInt(this.is_flag,10)==1) return true;
  		return false;
  	}
  }
});

FilterModal = Backbone.Marionette.ItemView.extend({
	template: "#filter-template",
	tagName: "div",
	events: {
		"click .save-filter": "saveFilter"
	},
	onRender: function(options) {
		var sliderElement = this.$el.find('.filter-form');
		var sliderLeft = this.$el.find('.slider-left');
		var sliderRight = this.$el.find('.slider-right');
		var min = new Date();
		var max = new Date();
		var datesArr = this.model.get("dates"); 
		if(datesArr) { 
			min = datesArr[0];
			max = datesArr[datesArr.length-1];
		}
		var dates = this.$el.find( "#dateLeft, #dateRight" ).datepicker({
			defaultDate: new Date(),
			minDate: min,
			maxDate: max,
			onSelect: function( selectedDate ) {
				var option = this.id == "dateLeft" ? "minDate" : "maxDate",
					instance = $( this ).data( "datepicker" ),
					date = $.datepicker.parseDate(
						instance.settings.dateFormat ||
						$.datepicker._defaults.dateFormat,
						selectedDate, instance.settings );
				dates.not( this ).datepicker( "option", option, date );
			}
		});
	},
	saveFilter: function() {
		var filterArr = $(".filter-form").serializeObject();
		if(filterArr.dateLeft) {
			filterArr.dateLeft = new moment(filterArr.dateLeft).toDate().toJSON();	
		}
		if(filterArr.dateRight) {
			filterArr.dateRight = new moment(filterArr.dateRight).toDate().toJSON();	
		}
		this.model.set({filter:filterArr});
		$('#filter').modal('hide');
	},
	templateHelpers: {
		optionRender: function(field) {
			var returnStr = "";
			for(i=0;i<this[field].length;i++){
				returnStr+= "<option>" + this[field][i] + "</option>\r\n";
			}
			return returnStr;
		}
	}
});

LogList = Backbone.Marionette.CollectionView.extend({
	itemView: LogRow,
	tagName: "ul",
	appendHtml: function(collectionView, itemView) {
  	var itemIndex;
  	itemIndex = collectionView.collection.indexOf(itemView.model);
  	return collectionView.$el.insertAt(itemIndex, itemView.$el);
	}
});


