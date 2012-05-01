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
  var myFilter = new Filter({
	sites: ["test1","test2"],
	level: ["ERROR","WARNING","INFO","DEBUG"],
	dates: [new Date(2012,03,20),new Date(2012,03,22),new Date(2012,03,23)],
	filter:[]
  });
  myFilter.on("change:filter", function(model,filter){
  	options.logs.applyFilter(filter);
  });
  MyApp.listRegion.show(logCollectionView);
  MyApp.filterModalRegion.show(new FilterModal({model:myFilter}));
  Backbone.history.start();
});


Log = Backbone.Model.extend({
	 url : function() {
    var base = 'log';
    if(this.isNew()) { return base; }
    return base + '/' + this.id;
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
		/*sliderElement.slider({
          range: (max>0) ? true : false,
          min: min,
          max: max,
          values: [min,max]
        }).bind("slide",function(event,ui){
          if(datesArr==null) {
          	sliderLeft.html("Today");	
          	sliderRight.html("Today");
          } else {
          	var dateLeft = new moment(datesArr[ui.values[0]]);
          	var dateRight = new moment(datesArr[ui.values[1]]);
          	sliderLeft.html(dateLeft.format("MM/DD/YYYY"));	
          	sliderRight.html(dateRight.format("MM/DD/YYYY"));
          }
        });*/

	},
	saveFilter: function() {
		var filterArr = $(".filter-form").serializeObject();
		filterArr.dateLeft = new moment(filterArr.dateLeft).toDate().toJSON();
		filterArr.dateRight = new moment(filterArr.dateRight).toDate().toJSON();
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
	tagName: "ul"
});


