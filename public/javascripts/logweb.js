LazyViews = Backbone.View.extend({
    initialize: function(options) {
        if(this.templateTagID && $(this.templateTagID)) { this.loadTemplate(); }
        if(this.init) { this.init(options); }
    },
    template: null,
    loadTemplate: function() {
        this.template = _.template($(this.templateTagID).html());
    },
    remove: function() {
        $(this.el).remove();
    }
});

App = {
    Views: {},
    Controllers: {},
    init: function() {
        this.Controllers = [new Logs() ];
        Backbone.history.start();
    }
};

(function($){
    $(document).ready(function() {
    $("#templates").load("/javascripts/template.html", function(responseText,textStatus, xhr){
        if(textStatus=="success" || textStatus=="notmodified") {
        
        }
        App.init();
    });
});
})(jQuery);

Logs = Backbone.Router.extend({
  routes: {
        "logs/:level": "level"
  },
    initialize: function(options) {
        
    },
    level: function(level) {
      var logs = new LogCollection();
      logs.level(level);
      
    }
    
});

var Log = Backbone.Model.extend({
  url : function() {
    var base = 'logs';
    if(this.isNew()) { return base; }
    return base + '/' + this.id;
  }
});

LogCollection = Backbone.Collection.extend({
  model: Log,
  url: 'logs',
  initialize: function() {
    this.bind("reset", this.doRender, this);
  },
  level: function(level) {
    var url = this.url;
    this.url += "/level/"+level;
    this.fetch();
    this.url = url;
  },
  doRender: function() {
    var logLst = new LogList({elementId: "list"});
    logLst.render(this);
  }
  
});

LazyViews = Backbone.View.extend({
    initialize: function(options) {
        if(this.templateTagID && $(this.templateTagID)) { this.loadTemplate(); }
        if(this.init) { this.init(options); }
    },
    template: null,
    loadTemplate: function() {
        this.template = _.template($(this.templateTagID).html());
    },
    remove: function() {
        $(this.el).remove();
    }
});

LogRow = LazyViews.extend({
    tagName: "li",
    className: "log-row",
    elementId: null,
    events: {
        
    },
    templateTagID: "#log-row-template",
    init: function(options) {
      this.model.bind("change",this.handleChange,this);
      
    },
    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    },
    handleChange: function(model) {
      var changedAttrs = model.changedAttributes();
      var reRender = _.detect(_.keys(changedAttrs), function(attr) {
          var rePaints = { };
          return rePaints[attr]!=null;
      });
      if(reRender) { this.render(); }
    }
});

LogList = LazyViews.extend({
  tagName: "div",
  elementId: null,
  templateTagID: "#loglist",
  init: function(options) {
    if(options.elementId) { this.elementId = options.elementId; }
  },
  render: function(collection) {
    $("#"+this.elementId).html(this.template({logs: collection.toJSON()}));
    return this;
  }

});