var twitter = require('ntwitter');
var mongoose = require('mongoose');
var credentials = require('../config_twitter.js');
var config = require('../config.js');
var Schema = mongoose.Schema

// mapped 1-1 to Twitter object
var twschema = new Schema({
  created_at: Date,
  from_user: String,
  from_user_id: Number,
  from_user_id_str: String,
  from_user_name: String,
  geo: String,
  id: Number,
  id_str: String,
  iso_language_code: String,
  metadata: [String],
  profile_image_url: String,
  profile_image_url_https: String,
  source: String,
  text: String,
  to_user: String,
  to_user_id: Number,
  to_user_id_str: String,
  to_user_name: String 
});

var t = new twitter({
    consumer_key: credentials.consumer_key,
    consumer_secret: credentials.consumer_secret,
    access_token_key: credentials.access_token_key,
    access_token_secret: credentials.access_token_secret
});

// connect to dataabse
var db = mongoose.createConnection(config.db_host, config.db_name);
db.on('error', console.error.bind(console, 'connection error:'));

// Tweet Model object
var TweetElement = db.model(config.db_collection_twitter, twschema);

// Twitter object
var Twit = {
  'save' : function(tweet, callback) {
    TwitStore.save(tweet, callback);
  }
}

// Twitter Store Model
var TwitStore = {
  'getLastTweet' : function(callback) {
    // http://mongoosejs.com/docs/api.html#query_Query-sort
    // http://mongoosejs.com/docs/2.7.x/docs/finding-documents.html
    var q = TweetElement.findOne().limit(1);
    q.sort({ created_at: 'desc' });
    q.execFind(function(err, tweet) {
      if (err) {
        console.log('No tweet found');
        process.exit(0);
      }
      if (tweet.length === 0) {
        callback(false);
      }
      // callback last tweet
      callback(tweet[0]);
    });
  },
  'save' : function(tweet, callback) {
    twit = new TweetElement(tweet);
    twit.save(function(err, type) {
      callback(err, type);
    });
  }
}

TwitStore.getLastTweet(function(item) {
  var query = {};
  if (item) {
    query.since_id = item.id_str;
  }

  t.search(config.twitter_harvest_search, query, function(err, data) {
    if (data.results.length) {
      res = data.results;
      counter = 0;
      res.forEach(function (item) {
        Twit.save(item, function(err, type) {
          counter++;
          if (err) {
            console.log('Fatal error on saving tweet.');
            console.log(err);
            process.exit(0);
          }
          if (counter == res.length) {
            console.log('Imported: ' + counter + ' tweets.');
            process.exit(1);
          }
        });
      });
    }
    else {
      console.log('No fresh data available.');
      process.exit(1);
    }
  });
});

// Twitter search
/*
t.search('#sod13', {}, function(err, data) {
  if (data.results) {
    res = data.results;
    counter = 0;

    res.forEach(function (item) {
      Twit.save(item, function(err, type) {
        counter++;
        if (err) {
          console.log('Fatal error on saving tweet.');
          console.log(err);
          process.exit(0);
        }
        if (counter == res.length) {
          console.log('Imported: ' + counter + ' tweets.');
          process.exit(1);
        }
      });
    });
  }
});
*/

// Twitter Search
/*
t.search('#sod13', {}, function(err, data) {
  if (data.results) {
    results = data.results;
    results.forEach(function (item) {
      
    });
  }
})
*/