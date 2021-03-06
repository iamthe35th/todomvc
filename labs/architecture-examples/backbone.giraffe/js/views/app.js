/*global Backbone, jQuery, _, ENTER_KEY */
var app = app || {};

(function ($) {
  'use strict';

  // The Application
  // ---------------

  // Our overall **AppView** is the top-level piece of UI.
  app.AppView = Giraffe.App.extend({

    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: '#todoapp',

    // Our template for the line of statistics at the bottom of the app.
    statsTemplate: _.template($('#stats-template').html()),

    // If `routes` is defined on an app, it will automatically create a router.
    routes: {
      '*filter': 'routes:filter'
    },

    // The Giraffe app acts as an event aggregator for routes and other communication.
    appEvents: {
      "routes:filter": "setFilter",
    },

    dataEvents: {
    	'add todos': 'addOne',
    	'reset todos': 'addAll',
    	'change:completed todos': 'filterOne',
      'all todos': 'render'
    },

    ui: {
    	$allCheckbox: '#toggle-all',
    	$input: '#new-todo',
    	$footer: '#footer',
    	$main: '#main'
    },

    // At initialization we bind to the relevant events on the `Todos`
    // collection, when items are added or changed. Kick things off by
    // loading any preexisting todos that might be saved in *localStorage*.
    initialize: function () {
	    this.todos = app.todos;

      setTimeout(function(){app.todos.fetch();},1);
    },

    // Re-rendering the App just means refreshing the statistics -- the rest
    // of the app doesn't change.
    render: function () {
      var completed = app.todos.completed().length;
      var remaining = app.todos.remaining().length;

      if (app.todos.length) {
        this.$main.show();
        this.$footer.show();

        this.$footer.html(this.statsTemplate({
          completed: completed,
          remaining: remaining
        }));

        this.$('#filters li a')
          .removeClass('selected')
          .filter('[href="#/' + (app.TodoFilter || '') + '"]')
          .addClass('selected');
      } else {
        this.$main.hide();
        this.$footer.hide();
      }

      this.$allCheckbox[0].checked = !remaining;
    },

    // Add a single todo item to the list by creating a view for it, and
    // appending its element to the `<ul>`.
    addOne: function (todo) {
      var view = new app.TodoView({ model: todo });
      view.attachTo('#todo-list');
    },

    // Add all items in the **Todos** collection at once.
    addAll: function () {
      this.$('#todo-list').html('');
      app.todos.each(this.addOne, this);
    },

    filterOne: function (todo) {
      todo.trigger('visible');
    },

    filterAll: function () {
      app.todos.each(this.filterOne, this);
    },

    setFilter: function(filter) {
      app.TodoFilter = filter || '';
      this.filterAll();
    },

    // Generate the attributes for a new Todo item.
    newAttributes: function () {
      return {
        title: this.$input.val().trim(),
        order: app.todos.nextOrder(),
        completed: false
      };
    },

    // If you hit return in the main input field, create new **Todo** model,
    // persisting it to *localStorage*.
    createOnEnter: function (e) {
      if (e.which !== ENTER_KEY || !this.$input.val().trim()) {
        return;
      }

      app.todos.create(this.newAttributes());
      this.$input.val('');
    },

    // Clear all completed todo items, destroying their models.
    clearCompleted: function () {
      _.invoke(app.todos.completed(), 'destroy');
      return false;
    },

    toggleAllComplete: function () {
      var completed = this.$allCheckbox[0].checked;

      app.todos.each(function (todo) {
        todo.save({
          'completed': completed
        });
      });
    }
  });

})(jQuery);
