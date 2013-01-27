var twitter = require('ntwitter');
var mongoose = require('mongoose');
var credentials = require('../config_twitter.js');
var Schema = mongoose.Schema


/** Example Twit
{ created_at: 'Sun, 27 Jan 2013 13:38:31 +0000',
  from_user: 'Lorenzo_Galante',
  from_user_id: 592519979,
  from_user_id_str: '592519979',
  from_user_name: 'Next Level',
  geo: null,
  id: 295526200565182460,
  id_str: '295526200565182464',
  iso_language_code: 'en',
  metadata: { result_type: 'recent' },
  profile_image_url: 'http://a0.twimg.com/profile_images/2256917966/3812795249_2803596804_o_normal.jpeg',
  profile_image_url_https: 'https://si0.twimg.com/profile_images/2256917966/3812795249_2803596804_o_normal.jpeg',
  source: '&lt;a href=&quot;http://twitter.com/download/android&quot;&gt;Twitter for Android&lt;/a&gt;',
  text: 'RT @spaghetti_folks: #twitantonio lo screenshot definitivo!! -1 stay tuned! #spaghettiopendata #SOD13 http://t.co/j3YwSWn9 http://t.co/ZT6L4iCp',
  to_user: null,
  to_user_id: 0,
  to_user_id_str: '0',
  to_user_name: null 
}
*/

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
var db = mongoose.createConnection('localhost', 'twitAntonio');
db.on('error', console.error.bind(console, 'connection error:'));
var TweetElement = db.model('harvest3', twschema);


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

  t.search('#sod13', query, function(err, data) {
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