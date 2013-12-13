var ForecastView = Backbone.View.extend({
  el: '#forecast', // every Backbone view has an associated DOM element

  template: require('../../templates/forecast.hbs'),

  initialize: function () {
    this.listenTo(this.model, 'change', this.render);
    this.render();
    // this.makeWeek;
  },

  render: function () {
    var context = {}
    context.daily = this.model.get('daily') || {};
    this.$el.html(this.template(context));
    return this;
  }



});

module.exports = ForecastView;