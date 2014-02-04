;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"./models/weather":2,"./views/details":3,"./views/forecast":4,"./views/summary":5}],2:[function(require,module,exports){
var WeatherModel = Backbone.Model.extend({

});

module.exports = WeatherModel;
},{}],3:[function(require,module,exports){
var DetailsView = Backbone.View.extend({
  el: '#details', // every Backbone view has an associated DOM element

  template: require('../../templates/details.hbs'),

  initialize: function () {
    this.listenTo(this.model, 'change', this.render);
    this.render();
  },

  render: function () {
    var context = {}
    context.currently = this.model.get('currently') || {};
    context.today = this.model.get('daily') || {};
    this.$el.html(this.template(context));
    return this;
  }
});

module.exports = DetailsView;
},{"../../templates/details.hbs":12}],4:[function(require,module,exports){
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
},{"../../templates/forecast.hbs":13}],5:[function(require,module,exports){
var SummaryView = Backbone.View.extend({
  el: '#current', // every Backbone view has an associated DOM element

  template: require('../../templates/summary.hbs'),

  initialize: function () {
    this.listenTo(this.model, 'change', this.render);
    this.render();
  },

  render: function () {
    var context = {}
    context.currently = this.model.get('currently') || {};
    context.today = this.model.get('daily') || {};
    this.$el.html(this.template(context));
    return this;
  }

});

module.exports = SummaryView;
},{"../../templates/summary.hbs":14}],6:[function(require,module,exports){
"use strict";
var base = require("./handlebars/base");

// Each of these augment the Handlebars object. No need to setup here.
// (This is done to easily share code between commonjs and browse envs)
var SafeString = require("./handlebars/safe-string")["default"];
var Exception = require("./handlebars/exception")["default"];
var Utils = require("./handlebars/utils");
var runtime = require("./handlebars/runtime");

// For compatibility and usage outside of module systems, make the Handlebars object a namespace
var create = function() {
  var hb = new base.HandlebarsEnvironment();

  Utils.extend(hb, base);
  hb.SafeString = SafeString;
  hb.Exception = Exception;
  hb.Utils = Utils;

  hb.VM = runtime;
  hb.template = function(spec) {
    return runtime.template(spec, hb);
  };

  return hb;
};

var Handlebars = create();
Handlebars.create = create;

exports["default"] = Handlebars;
},{"./handlebars/base":7,"./handlebars/exception":8,"./handlebars/runtime":9,"./handlebars/safe-string":10,"./handlebars/utils":11}],7:[function(require,module,exports){
"use strict";
/*globals Exception, Utils */
var Utils = require("./utils");
var Exception = require("./exception")["default"];

var VERSION = "1.1.2";
exports.VERSION = VERSION;var COMPILER_REVISION = 4;
exports.COMPILER_REVISION = COMPILER_REVISION;
var REVISION_CHANGES = {
  1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
  2: '== 1.0.0-rc.3',
  3: '== 1.0.0-rc.4',
  4: '>= 1.0.0'
};
exports.REVISION_CHANGES = REVISION_CHANGES;
var isArray = Utils.isArray,
    isFunction = Utils.isFunction,
    toString = Utils.toString,
    objectType = '[object Object]';

function HandlebarsEnvironment(helpers, partials) {
  this.helpers = helpers || {};
  this.partials = partials || {};

  registerDefaultHelpers(this);
}

exports.HandlebarsEnvironment = HandlebarsEnvironment;HandlebarsEnvironment.prototype = {
  constructor: HandlebarsEnvironment,

  logger: logger,
  log: log,

  registerHelper: function(name, fn, inverse) {
    if (toString.call(name) === objectType) {
      if (inverse || fn) { throw new Exception('Arg not supported with multiple helpers'); }
      Utils.extend(this.helpers, name);
    } else {
      if (inverse) { fn.not = inverse; }
      this.helpers[name] = fn;
    }
  },

  registerPartial: function(name, str) {
    if (toString.call(name) === objectType) {
      Utils.extend(this.partials,  name);
    } else {
      this.partials[name] = str;
    }
  }
};

function registerDefaultHelpers(instance) {
  instance.registerHelper('helperMissing', function(arg) {
    if(arguments.length === 2) {
      return undefined;
    } else {
      throw new Error("Missing helper: '" + arg + "'");
    }
  });

  instance.registerHelper('blockHelperMissing', function(context, options) {
    var inverse = options.inverse || function() {}, fn = options.fn;

    if (isFunction(context)) { context = context.call(this); }

    if(context === true) {
      return fn(this);
    } else if(context === false || context == null) {
      return inverse(this);
    } else if (isArray(context)) {
      if(context.length > 0) {
        return instance.helpers.each(context, options);
      } else {
        return inverse(this);
      }
    } else {
      return fn(context);
    }
  });

  instance.registerHelper('each', function(context, options) {
    var fn = options.fn, inverse = options.inverse;
    var i = 0, ret = "", data;

    if (isFunction(context)) { context = context.call(this); }

    if (options.data) {
      data = createFrame(options.data);
    }

    if(context && typeof context === 'object') {
      if (isArray(context)) {
        for(var j = context.length; i<j; i++) {
          if (data) {
            data.index = i;
            data.first = (i === 0)
            data.last  = (i === (context.length-1));
          }
          ret = ret + fn(context[i], { data: data });
        }
      } else {
        for(var key in context) {
          if(context.hasOwnProperty(key)) {
            if(data) { data.key = key; }
            ret = ret + fn(context[key], {data: data});
            i++;
          }
        }
      }
    }

    if(i === 0){
      ret = inverse(this);
    }

    return ret;
  });

  instance.registerHelper('if', function(conditional, options) {
    if (isFunction(conditional)) { conditional = conditional.call(this); }

    // Default behavior is to render the positive path if the value is truthy and not empty.
    // The `includeZero` option may be set to treat the condtional as purely not empty based on the
    // behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
    if ((!options.hash.includeZero && !conditional) || Utils.isEmpty(conditional)) {
      return options.inverse(this);
    } else {
      return options.fn(this);
    }
  });

  instance.registerHelper('unless', function(conditional, options) {
    return instance.helpers['if'].call(this, conditional, {fn: options.inverse, inverse: options.fn, hash: options.hash});
  });

  instance.registerHelper('with', function(context, options) {
    if (isFunction(context)) { context = context.call(this); }

    if (!Utils.isEmpty(context)) return options.fn(context);
  });

  instance.registerHelper('log', function(context, options) {
    var level = options.data && options.data.level != null ? parseInt(options.data.level, 10) : 1;
    instance.log(level, context);
  });
}

var logger = {
  methodMap: { 0: 'debug', 1: 'info', 2: 'warn', 3: 'error' },

  // State enum
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  level: 3,

  // can be overridden in the host environment
  log: function(level, obj) {
    if (logger.level <= level) {
      var method = logger.methodMap[level];
      if (typeof console !== 'undefined' && console[method]) {
        console[method].call(console, obj);
      }
    }
  }
};
exports.logger = logger;
function log(level, obj) { logger.log(level, obj); }

exports.log = log;var createFrame = function(object) {
  var obj = {};
  Utils.extend(obj, object);
  return obj;
};
exports.createFrame = createFrame;
},{"./exception":8,"./utils":11}],8:[function(require,module,exports){
"use strict";

var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

function Exception(/* message */) {
  var tmp = Error.prototype.constructor.apply(this, arguments);

  // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
  for (var idx = 0; idx < errorProps.length; idx++) {
    this[errorProps[idx]] = tmp[errorProps[idx]];
  }
}

Exception.prototype = new Error();

exports["default"] = Exception;
},{}],9:[function(require,module,exports){
"use strict";
/*global Utils */
var Utils = require("./utils");
var Exception = require("./exception")["default"];
var COMPILER_REVISION = require("./base").COMPILER_REVISION;
var REVISION_CHANGES = require("./base").REVISION_CHANGES;

function checkRevision(compilerInfo) {
  var compilerRevision = compilerInfo && compilerInfo[0] || 1,
      currentRevision = COMPILER_REVISION;

  if (compilerRevision !== currentRevision) {
    if (compilerRevision < currentRevision) {
      var runtimeVersions = REVISION_CHANGES[currentRevision],
          compilerVersions = REVISION_CHANGES[compilerRevision];
      throw new Error("Template was precompiled with an older version of Handlebars than the current runtime. "+
            "Please update your precompiler to a newer version ("+runtimeVersions+") or downgrade your runtime to an older version ("+compilerVersions+").");
    } else {
      // Use the embedded version info since the runtime doesn't know about this revision yet
      throw new Error("Template was precompiled with a newer version of Handlebars than the current runtime. "+
            "Please update your runtime to a newer version ("+compilerInfo[1]+").");
    }
  }
}

// TODO: Remove this line and break up compilePartial

function template(templateSpec, env) {
  if (!env) {
    throw new Error("No environment passed to template");
  }

  var invokePartialWrapper;
  if (env.compile) {
    invokePartialWrapper = function(partial, name, context, helpers, partials, data) {
      // TODO : Check this for all inputs and the options handling (partial flag, etc). This feels
      // like there should be a common exec path
      var result = invokePartial.apply(this, arguments);
      if (result) { return result; }

      var options = { helpers: helpers, partials: partials, data: data };
      partials[name] = env.compile(partial, { data: data !== undefined }, env);
      return partials[name](context, options);
    };
  } else {
    invokePartialWrapper = function(partial, name /* , context, helpers, partials, data */) {
      var result = invokePartial.apply(this, arguments);
      if (result) { return result; }
      throw new Exception("The partial " + name + " could not be compiled when running in runtime-only mode");
    };
  }

  // Just add water
  var container = {
    escapeExpression: Utils.escapeExpression,
    invokePartial: invokePartialWrapper,
    programs: [],
    program: function(i, fn, data) {
      var programWrapper = this.programs[i];
      if(data) {
        programWrapper = program(i, fn, data);
      } else if (!programWrapper) {
        programWrapper = this.programs[i] = program(i, fn);
      }
      return programWrapper;
    },
    merge: function(param, common) {
      var ret = param || common;

      if (param && common && (param !== common)) {
        ret = {};
        Utils.extend(ret, common);
        Utils.extend(ret, param);
      }
      return ret;
    },
    programWithDepth: programWithDepth,
    noop: noop,
    compilerInfo: null
  };

  return function(context, options) {
    options = options || {};
    var namespace = options.partial ? options : env,
        helpers,
        partials;

    if (!options.partial) {
      helpers = options.helpers;
      partials = options.partials;
    }
    var result = templateSpec.call(
          container,
          namespace, context,
          helpers,
          partials,
          options.data);

    if (!options.partial) {
      checkRevision(container.compilerInfo);
    }

    return result;
  };
}

exports.template = template;function programWithDepth(i, fn, data /*, $depth */) {
  var args = Array.prototype.slice.call(arguments, 3);

  var prog = function(context, options) {
    options = options || {};

    return fn.apply(this, [context, options.data || data].concat(args));
  };
  prog.program = i;
  prog.depth = args.length;
  return prog;
}

exports.programWithDepth = programWithDepth;function program(i, fn, data) {
  var prog = function(context, options) {
    options = options || {};

    return fn(context, options.data || data);
  };
  prog.program = i;
  prog.depth = 0;
  return prog;
}

exports.program = program;function invokePartial(partial, name, context, helpers, partials, data) {
  var options = { partial: true, helpers: helpers, partials: partials, data: data };

  if(partial === undefined) {
    throw new Exception("The partial " + name + " could not be found");
  } else if(partial instanceof Function) {
    return partial(context, options);
  }
}

exports.invokePartial = invokePartial;function noop() { return ""; }

exports.noop = noop;
},{"./base":7,"./exception":8,"./utils":11}],10:[function(require,module,exports){
"use strict";
// Build out our basic SafeString type
function SafeString(string) {
  this.string = string;
}

SafeString.prototype.toString = function() {
  return "" + this.string;
};

exports["default"] = SafeString;
},{}],11:[function(require,module,exports){
"use strict";
var SafeString = require("./safe-string")["default"];

var escape = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "`": "&#x60;"
};

var badChars = /[&<>"'`]/g;
var possible = /[&<>"'`]/;

function escapeChar(chr) {
  return escape[chr] || "&amp;";
}

function extend(obj, value) {
  for(var key in value) {
    if(value.hasOwnProperty(key)) {
      obj[key] = value[key];
    }
  }
}

exports.extend = extend;var toString = Object.prototype.toString;
exports.toString = toString;
// Sourced from lodash
// https://github.com/bestiejs/lodash/blob/master/LICENSE.txt
var isFunction = function(value) {
  return typeof value === 'function';
};
// fallback for older versions of Chrome and Safari
if (isFunction(/x/)) {
  isFunction = function(value) {
    return typeof value === 'function' && toString.call(value) === '[object Function]';
  };
}
var isFunction;
exports.isFunction = isFunction;
var isArray = Array.isArray || function(value) {
  return (value && typeof value === 'object') ? toString.call(value) === '[object Array]' : false;
};
exports.isArray = isArray;

function escapeExpression(string) {
  // don't escape SafeStrings, since they're already safe
  if (string instanceof SafeString) {
    return string.toString();
  } else if (!string && string !== 0) {
    return "";
  }

  // Force a string conversion as this will be done by the append regardless and
  // the regex test will do this transparently behind the scenes, causing issues if
  // an object's to string has escaped characters in it.
  string = "" + string;

  if(!possible.test(string)) { return string; }
  return string.replace(badChars, escapeChar);
}

exports.escapeExpression = escapeExpression;function isEmpty(value) {
  if (!value && value !== 0) {
    return true;
  } else if (isArray(value) && value.length === 0) {
    return true;
  } else {
    return false;
  }
}

exports.isEmpty = isEmpty;
},{"./safe-string":10}],12:[function(require,module,exports){
var templater = require("/Users/nmcgiver/Code/JavaScript/backbone weatherapp/backbone-examples/backbone weather/node_modules/browserify-handlebars/node_modules/handlebars/dist/cjs/handlebars.runtime").default.template;module.exports = templater(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n    <tr>\n        <td><b>"
    + escapeExpression(((stack1 = ((stack1 = data),stack1 == null || stack1 === false ? stack1 : stack1.key)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + ":</b></td>\n        <td>"
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "</td>\n    </tr>\n";
  return buffer;
  }

  buffer += "<h3>Detailed Forecast for the Day</h3>\n</br>\n<table class=\"table table-striped\">\n    <thead>\n        <tr><th>Data Point</th><th>Data</th></tr>\n    </thead>\n    <tbody>\n";
  stack1 = helpers.each.call(depth0, (depth0 && depth0.currently), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " \n    </tbody>\n</table>\n";
  return buffer;
  });
},{"/Users/nmcgiver/Code/JavaScript/backbone weatherapp/backbone-examples/backbone weather/node_modules/browserify-handlebars/node_modules/handlebars/dist/cjs/handlebars.runtime":6}],13:[function(require,module,exports){
var templater = require("/Users/nmcgiver/Code/JavaScript/backbone weatherapp/backbone-examples/backbone weather/node_modules/browserify-handlebars/node_modules/handlebars/dist/cjs/handlebars.runtime").default.template;module.exports = templater(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n    <tbody>\n        <tr><td> ";
  if (stack1 = helpers.date) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.date); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + " </td>\n        <td> <div class = \"test\"><a id=\"elem\" href=\"#\" class=\"btn btn-primary\" rel=\"popover\" data-trigger=\"hover\" data-original-title=\"Summary\" data-content=\"";
  if (stack1 = helpers.summary) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.summary); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\">Hover for Summary</a></div> </td>\n        <td> ";
  if (stack1 = helpers.sunRise) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.sunRise); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + " am / ";
  if (stack1 = helpers.sunSet) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.sunSet); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + " pm</td>\n        <td> ";
  if (stack1 = helpers.maxTemp) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.maxTemp); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + " / ";
  if (stack1 = helpers.minTemp) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.minTemp); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + " &deg; Fahrenheit  </td>\n        </tr>\n    </tbody>\n";
  return buffer;
  }

  buffer += "<table class=\"table table-striped\">\n    <thead>\n        <tr><th>Day</th><th>Forecast</th><th>Sunrise/Set</th><th>High/Low Temp</th></tr>\n    </thead>\n";
  stack1 = helpers.each.call(depth0, (depth0 && depth0.sevenDayForecast), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n</table>\n\n\n\n";
  return buffer;
  });
},{"/Users/nmcgiver/Code/JavaScript/backbone weatherapp/backbone-examples/backbone weather/node_modules/browserify-handlebars/node_modules/handlebars/dist/cjs/handlebars.runtime":6}],14:[function(require,module,exports){
var templater = require("/Users/nmcgiver/Code/JavaScript/backbone weatherapp/backbone-examples/backbone weather/node_modules/browserify-handlebars/node_modules/handlebars/dist/cjs/handlebars.runtime").default.template;module.exports = templater(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div class=\"container\">\n    <div class=\"row\">\n      <div class=\"col-md-4\">\n        <h3>Currently</h3>\n        <p><b>Temperature:</b> "
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.currently)),stack1 == null || stack1 === false ? stack1 : stack1.temperature)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</p>\n        <p><b>It Is:</b> "
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.currently)),stack1 == null || stack1 === false ? stack1 : stack1.summary)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</p> \n      </div>\n      <div class=\"col-md-4\">\n        <h3>Today</h3>\n        <p><b>Weather Summary:</b> "
    + escapeExpression(((stack1 = ((stack1 = ((stack1 = ((stack1 = (depth0 && depth0.today)),stack1 == null || stack1 === false ? stack1 : stack1.data)),stack1 == null || stack1 === false ? stack1 : stack1[0])),stack1 == null || stack1 === false ? stack1 : stack1.summary)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</p>\n        <p><b>Max/Min Temperature:</b> "
    + escapeExpression(((stack1 = ((stack1 = ((stack1 = ((stack1 = (depth0 && depth0.today)),stack1 == null || stack1 === false ? stack1 : stack1.data)),stack1 == null || stack1 === false ? stack1 : stack1[0])),stack1 == null || stack1 === false ? stack1 : stack1.apparentTemperatureMax)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "/"
    + escapeExpression(((stack1 = ((stack1 = ((stack1 = ((stack1 = (depth0 && depth0.today)),stack1 == null || stack1 === false ? stack1 : stack1.data)),stack1 == null || stack1 === false ? stack1 : stack1[0])),stack1 == null || stack1 === false ? stack1 : stack1.apparentTemperatureMin)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</p>\n      </div>\n      <div class=\"col-md-4\">\n        <h3>Weekly</h3>\n        <p><b>Weather Summary:</b> "
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.today)),stack1 == null || stack1 === false ? stack1 : stack1.summary)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</p>\n      </div>\n    </div>\n</div>\n\n\n";
  return buffer;
  });
},{"/Users/nmcgiver/Code/JavaScript/backbone weatherapp/backbone-examples/backbone weather/node_modules/browserify-handlebars/node_modules/handlebars/dist/cjs/handlebars.runtime":6}]},{},[1])
;