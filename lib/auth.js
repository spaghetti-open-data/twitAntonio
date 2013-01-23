// needs to be refactored
var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , mongooseAuth = require('mongoose-auth');

var UserSchema = new Schema({})
  , User;

var config = require('../config.js');

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
        myHostname: 'http://localhost:3000'
        , consumerKey: config.twit_consumer_key
        , consumerSecret: config.twit_consumer_secret
        , redirectPath: '/'
      }
    }
});

mongoose.model('User', UserSchema);
mongoose.connect('mongodb://localhost/example');
User = mongoose.model('User');
