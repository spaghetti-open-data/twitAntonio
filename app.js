
/**
 * Module dependencies.
 */

var express = require('express')
  , controllers = require("./controllers")
  , user = require('./controllers/user')
  , http = require('http')
  , path = require('path')
  , mongoose = require('mongoose');

// bootstrap the app!
var app = express();
var model = require('./models/mep.js');
var config = require('./config.js');

// Authentication
if (config.twitter_auth) {
  var everyauth = require('everyauth')
  var mongooseAuth = require('mongoose-auth');
  var auth = require('./lib/auth.js');
}

// App configuration
app.configure(function(){
  app.set('port', process.env.PORT || config.app_port);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser(config.app_secret));
  app.use(express.session());

  // user mongooseAuth middleware if twitter_auth is active
  if (config.twitter_auth) {
    app.use(mongooseAuth.middleware());
  }
  else {
    app.use(app.router);
  }

  //app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});


app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', controllers.mainController().indexAction);
app.get('/mappa', controllers.mainController().mapAction);
app.get('/cos_e', controllers.mainController().cos_eAction);
app.get('/credits', controllers.mainController().creditsAction);

// API
app.get('/api/meps', controllers.mainController().apiAction.get);
app.get('/api/autocomplete', controllers.mainController().apiAction.autocomplete);



// disabled at this stage
//app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

