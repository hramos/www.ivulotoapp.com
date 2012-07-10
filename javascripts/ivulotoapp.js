$(function() {
	Parse.$ = jQuery;

	Parse.initialize("WT3PvD15jVQwISWe2eLtMQVnWWXOgDdAl7ZbFViS", "IzTMZ5y9S7jl1gfW2AOsO6Tvbvp5yygj670hvxdR");

	// DrawDate Model
	// -------------

	var DrawDate = Parse.Object.extend("IVULotoDrawDate");

	// Drawing Model
	// -------------

	var Drawing = Parse.Object.extend("IVULotoDrawing", {
		  // Instance methods
		  entry: function() {
		  	var fullEntry = this.get("entry");
		  	var prettyEntry = fullEntry;
		  	if (fullEntry.length == 10) {
			  	prettyEntry = fullEntry.substr(0, 5) + "-" + fullEntry.substr(5,5);		  		
		  	}
		    return prettyEntry;
			}
		}
	);


	// DrawDate Collection
	// ----------------

	var DrawDateList = Parse.Collection.extend({
		model: DrawDate
	});


	// Drawing Collection
	// ----------------

	var DrawingList = Parse.Collection.extend({
		model: Drawing
	});

	// The Application
	// ---------------

	// Drawing View
	var DrawingView = Parse.View.extend({
    template: _.template($('#drawing-template').html()),

    render: function() {
    	console.log(this.model.toJSON());
			$(this.el).html(this.template({
				"entry_display": this.model.entry(),
				"business_name": this.model.get("spotName"),
				"city": this.model.get("city")
			}));
    	return this;
    }
 	});

	// Results View
	var ResultsView = Parse.View.extend({

    template: _.template($('#results-template').html()),

		initialize: function() {
    	var self = this;

    	_.bindAll(this, 'addDrawDate', 'addAllDrawDates', 'addOne', 'addAll', 'render');

			this.$el.html(this.template({
				"drawing_identifier": "",
				"drawing_date": ""
			}));

    	// Create our collection of Photos
    	this.drawDates = new DrawDateList;

    	this.drawDates.query = new Parse.Query(DrawDate);
	    this.drawDates.query.limit(1);
	    this.drawDates.query.descending("createdAt");

			this.drawDates.bind('add', this.addDrawDate);
			this.drawDates.bind('reset', this.addAllDrawDates);
			// this.drawDates.bind('all', this.render);
    
    	this.drawDates.fetch();

    	// Create our collection of Photos
    	this.drawings = new DrawingList;

    	this.drawings.query = new Parse.Query(Drawing);
	    this.drawings.query.limit(10);
	    this.drawings.query.descending("createdAt");

			this.drawings.bind('add', this.addOne);
			this.drawings.bind('reset', this.addAll);
			this.drawings.bind('all', this.render);
      	
    	// Fetch all the todo items for this user
			this.drawings.fetch();
    },

    render: function() {
			console.log("OK");
    	return this;
    },

		addDrawDate: function(draw_date) {
			console.log(draw_date.get("drawDate").toLocaleDateString());
			this.$el.html(this.template({
				"drawing_identifier": draw_date.get("drawIdentifier"),
				"drawing_date": draw_date.get("drawDate").toLocaleDateString()
			}));

		},

  	// Add all items in the Todos collection at once.
  	addAllDrawDates: function(collection, filter) {
			console.log("Adding Collection: " + collection);
	  	this.drawDates.each(this.addDrawDate);
  	},

		addOne: function(drawing) {
			console.log("Adding " + drawing);
	  	var view = new DrawingView({model: drawing});
	  	this.$("#results").append(view.render().el);
		},

  	// Add all items in the Todos collection at once.
  	addAll: function(collection, filter) {
			console.log("Adding Collection: " + collection);
			this.$("#results").html("");
	  	this.drawings.each(this.addOne);
  	}
 	});

 	// The main view for the app
	var AppView = Parse.View.extend({
	    // Instead of generating a new element, bind to the existing skeleton of
	    // the App already present in the HTML.
	    el: $("#home"),

	    initialize: function() {
	      this.render();
	    },

	    render: function() {
	    }
	});

	var App = new AppView;

	var AppRouter = Backbone.Router.extend({
		routes: {
			"resultados/:draw_identifier": "getResults",
			"*actions": "defaultRoute" // matches http://example.com/#anything-here
  	},

		getResults: function( draw_identifier ) {
			var query = new Parse.Query(DrawDate);
			query.equalTo("drawIdentifier", draw_identifier);
			query.first({
			  success: function(draw_date) {
			    // Successfully retrieved the object.
			    var queryDrawings = new Parse.Query(Drawing);
			    queryDrawings.equalTo("parent", draw_date);
			    queryDrawings.descending("prize");
			    queryDrawings.find({
			    	success: function(drawings) {
					    // results has the list of users with a hometown team with a winning record
					    console.log(drawings);
					    // should actually draw these instead
				      var view = new ResultsView();
							App.$("#main").html(view.render().el);
					  }
					});
			  },
			  error: function(error) {
			    alert("Error: " + error.code + " " + error.message);
			  }
			});
		},

		defaultRoute: function( actions ){
          // The variable passed in matches the variable in the route definition "actions"
			console.log("Default");

      var view = new ResultsView();
			App.$("#main").html(view.render().el);
    }
  });
	
	// Initiate the router
	var app_router = new AppRouter;

	// Start Backbone history a neccesary step for bookmarkable URL's
	Backbone.history.start();

});