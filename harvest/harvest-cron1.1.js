var twitter = require('ntwitter');
var mongoose = require('mongoose');
var credentials = require('../config_twitter.js');
var config = require('../config.js');

// mapped 1-1 to Twitter object
var twschema = new mongoose.Schema(config.tw_harvest_schema_1_1, {autoindex: true});

var t = new twitter({
    consumer_key: credentials.twit_consumer_key,
    consumer_secret: credentials.twit_consumer_secret,
    access_token_key: credentials.twit_access_token,
    access_token_secret: credentials.twit_token_secret
});

// connect to dataabse
var db = mongoose.createConnection(config.db_host, config.db_name);
db.on('error', console.error.bind(console, 'connection error:'));

// Tweet Model object
var TweetElement = db.model(config.db_collection_twitter11, twschema);

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
  'save' : function(remote_tweet, callback) {

	  TweetElement.findOneAndUpdate({id: remote_tweet.id},remote_tweet,{upsert : true}, function(err, tweet) {
	        if (err) { 
	          console.error('Find tweets problems, please check mongodb connection.');
	          process.exit(0);
	        }
	        else{
	              callback(err, tweet);
	        }
	        /*
	        // new tweet
	        if (!tweet) {
	        	tweet = new TweetElement(remote_tweet);
	        	tweet.save(function(err, type) {
	              callback(err, type);
	            });
	        }
	        // existing user
	        else {
	          for (attr in remote_tweet) {
	        	  tweet.attr = remote_tweet[attr];
	          }
	          tweet.save(function(err, type) {
	              callback(err, type);
	            });
	        }
	        */
	      });
	  
  },
  'getFirstTweetOfDay' : function(day,callback) {
	    // http://mongoosejs.com/docs/api.html#query_Query-sort
	    // http://mongoosejs.com/docs/2.7.x/docs/finding-documents.html
	  	var dayParts = day.split("-");
	  	var start = new Date(Date.UTC(dayParts[0], dayParts[1]-1, dayParts[2]-1,0,0,0));
	  	var end = new Date(Date.UTC(dayParts[0], dayParts[1]-1, dayParts[2]-1,23,59,59));
//	  	console.log(start);
//	  	console.log(end);
	    var q = TweetElement.findOne({created_at : {$gte: start, $lte : end}}).limit(1);
	    q.sort({ id: 'asc' });
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
  
}

// Tweet request
var tweetRequest = {
	'get' : function(query,callback){
	  var url = "https://api.twitter.com/1.1/search/tweets.json";
	  t.get(url, query, function(err, data) {
		  console.log(query);
	    if (typeof(data) != 'undefined' && data.statuses.length) {
	      res = data.statuses;
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
	            if(callback)
	            	callback(res);
	            else{
	            	console.log('no callback');
	            	process.exit(1);
	            }
	          }
	        });
	      });
	    }
	    else {
	      console.log('No fresh data available.');
	      process.exit(1);
	    }
	  });
	},
	'getFromLastItem': function(query,lastItemParam){
		TwitStore.getLastTweet(function(item) {
			  if (item) {
				  switch(lastItemParam){
				  	case 'until':
				  		var date = new Date(item.created_at);
				  		var until = date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate();
					    query.until = until;
					    break;
				  }
				  if(typeof(item.id_str) != 'undefined')
					    query.since_id = item.id_str;
			  }

			  // https://dev.twitter.com/docs/api/1/get/search
			  // maximum number
			  query.count = (typeof(query.count) != "undefined") ? query.count : 100; 
			  query.q = (typeof(query.q) != "undefined") ? query.q : config.twitter_harvest_search; 
			  query.result_type = (typeof(query.result_type) != "undefined") ? query.result_type : "recent"; 
			//  query.show_user = true;
			//  query.include_entities = true;
			  tweetRequest.get(query);
			});
	},
	'getWithParams' : function(callback){
		var fromLastItem = false;
		var query = {
				count : 100,
				q : config.twitter_harvest_search,
			};
		var argv = process.argv.slice(2);

		for(var i in argv){
			var arg = argv[i];
			var param = arg.split("=");
			if(param.length == 2 && tweetRequest.validParam(param[0])){
				query[param[0]] = param[1]; 
			}
			else if(tweetRequest.validParamQ(param[0])){
				query.q = query.q + " " + param[0].substr(1) + ":" + param[1];
			}
			else if(param[0] == 'getFromLastItem'){
				fromLastItem = param[1];
			}
		}
		if(fromLastItem !== false){
			this.getFromLastItem(query,fromLastItem);
		}
		else{
			this.get(query);
		}
	},
	'getAllday' : function(day){
		TwitStore.getFirstTweetOfDay(day,function(item) {
			var stack = new Error().stack
			query = {};
			if(item){
			  if(typeof(item.id) != 'undefined')
				    query.max_id = item.id-1;
			}
			else{
			  query.until = (typeof(query.until) != "undefined") ? query.until : day; 
			}
			  // https://dev.twitter.com/docs/api/1/get/search
			  // maximum number
			  query.count = (typeof(query.count) != "undefined") ? query.count : 100; 
			  query.q = (typeof(query.q) != "undefined") ? query.q : config.twitter_harvest_search; 

			  
			  var dayParts = day.split("-");
			  var d = new Date(dayParts[0],(parseInt(dayParts[1])-1),(parseInt(dayParts[2])-1));

			  var curr_date = d.getDate();
			  var curr_month = d.getMonth() + 1; //Months are zero based
			  var curr_year = d.getFullYear();

			  since = curr_year + "-" + curr_month + "-" + curr_date;
			  query.q = query.q +" since:"+since;
			  query.result_type = (typeof(query.result_type) != "undefined") ? query.result_type : "recent"; 

			//  query.show_user = true;
			//  query.include_entities = true;
			  tweetRequest.get(query,function(items){
				  console.log(items.length);
				  if(items.length)
					  tweetRequest.getAllday(day);
			  });
			});
	},
	'validParam' : function(param){
		var params = new Array(
			'q',
			'geocode',
			'lang',
			'locale',
			'result_type',
			'count',
			'until',
			'since_id',
			'max_id',
			'include_entities',
			'callback'
		);
		if(params.indexOf(param) !== -1){
			return true;
		}
		return false;
	},
	'validParamQ' : function(param){
		var params = new Array(
				'qsince',
				'quntil',
				'qfrom',
				'qto',
				'qplace:opentable',
				'qplace',
				'qsince',
				'quntil',
				'qfilter',
				'qsource'
			);
			if(params.indexOf(param) !== -1){
				return true;
			}
			return false;
	}
}
if(process.argv.length > 2){
	var argv = process.argv.slice(2);

	for(var i in argv){
		var arg = argv[i];
		var param = arg.split("=");
		if(param[0] == 'allday'){
			var allday = param[1];
			continue;
		}
	}	
	if(typeof(allday) != 'undefined'){
		var dayParts = allday.split("-");
		var d = new Date(dayParts[0],(parseInt(dayParts[1])-1),(parseInt(dayParts[2])+1));

	    var curr_date = d.getDate();
	    var curr_month = d.getMonth() + 1; //Months are zero based
	    var curr_year = d.getFullYear();

	    allday = curr_year + "-" + curr_month + "-" + curr_date;
		tweetRequest.getAllday(allday);
	}
	else{
		tweetRequest.getWithParams();
	}
}
else{
	tweetRequest.getFromLastItem({},null);
}
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

//force disconnect to avoid infinit loop
setTimeout( function () {
    mongoose.disconnect();
 }, 100000);
