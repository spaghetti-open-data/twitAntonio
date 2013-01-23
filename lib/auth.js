// needs to be refactored
var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , mongooseAuth = require('mongoose-auth');

var UserSchema = new Schema({})
  , User;

var config = require('../config.js');
var twitter_conf = require('../config_twitter.js');

// STEP 1: Schema Decoration and Configuration for the Routing
UserSchema.plugin(mongooseAuth, {
    // Here, we attach your User model to every module
    everymodule: {
      everyauth: {
          User: function () {
            return User;
          }
      }
    }
  , twitter: {
      everyauth: {
          consumerKey: twitter_conf.twit_consumer_key
        , consumerSecret: twitter_conf.twit_consumer_secret
        , redirectPath: '/'
      }
    }
});

mongoose.model('User', UserSchema);
mongoose.connect('mongodb://' + config.db_host + '/' + config.db_name);
User = mongoose.model('User');
