$(function () { // wait for on-ready

var SummaryView = require('./views/summary');
var DetailView = require('./views/details');
var ForecastView = require('./views/forecast');
var WeatherModel = require('./models/weather');

var app = {};
app.views = {};
app.models = {};

var APIKey = "532eb67dc6378f420488de360afa07a2"
var LatLong = "45.532814,-122.689296"

var url = "https://api.forecast.io/forecast/" + APIKey + '/' + LatLong;

app.models.currentWeather = new WeatherModel({currently: {}});

app.views.summary = new SummaryView({model: app.models.currentWeather});
app.views.details = new DetailView({model: app.models.currentWeather});
app.views.forecast = new ForecastView({model: app.models.currentWeather});

window.app = app;

$.getJSON(url + "?callback=?", null, function(weatherData) {
  app.models.currentWeather.set(weatherData);
});

});