var ForecastView = Backbone.View.extend({
  el: '#forecast', // every Backbone view has an associated DOM element

  template: require('../../templates/forecast.hbs'),

  initialize: function () {
    this.listenTo(this.model, 'change', this.render);
    this.render();
  },

  render: function () {
    var context = {};
    daily = this.model.get('daily') || { data: [] };
    context.sevenDayForecast = [];

    daily.data.forEach(function (day) {
      var contextData = {};
      var timestamp = new Date(day.time * 1000);
      var sunrise = new Date(day.sunriseTime * 1000);
      var sunset = new Date(day.sunsetTime * 1000);
      contextData.date = timestamp.getMonth() + 1 + '/' + timestamp.getDate();
      contextData.sunRise = sunrise.getHours() + ':' + sunrise.getMinutes();
      contextData.sunSet = sunset.getHours() + ':' + + sunset.getMinutes();
      contextData.maxTemp = day.temperatureMax;
      contextData.minTemp = day.temperatureMin;
      contextData.summary = day.summary;
      context.sevenDayForecast.push(contextData)
    });

    this.$el.html(this.template(context));
    return this;
  } 

});

module.exports = ForecastView;