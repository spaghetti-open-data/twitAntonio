/*
 * Struttura della risposta delle twitter API
 * 
{ id: 85769942,
  time_zone: null,
  profile_use_background_image: true,
  entities: { description: { urls: [] } },
  profile_text_color: '333333',
  id_str: '85769942',
  geo_enabled: false,
  listed_count: 0,
  is_translator: false,
  profile_sidebar_border_color: 'C0DEED',
  utc_offset: null,
  name: 'Francesco T',
  lang: 'en',
  follow_request_sent: false,
  profile_background_tile: false,
  followers_count: 41,
  created_at: 'Wed Oct 28 08:12:38 +0000 2009',
  protected: false,
  profile_sidebar_fill_color: 'DDEEF6',
  default_profile_image: false,
  profile_image_url_https: 'https://twimg0-a.akamaihd.net/profile_images/1673873900/image_normal.jpg',
  url: null,
  friends_count: 96,
  favourites_count: 9,
  statuses_count: 54,
  profile_background_color: 'C0DEED',
  verified: false,
  following: false,
  notifications: false,
  profile_image_url: 'http://a0.twimg.com/profile_images/1673873900/image_normal.jpg',
  profile_background_image_url_https: 'https://twimg0-a.akamaihd.net/images/themes/theme1/bg.png',
  profile_background_image_url: 'http://a0.twimg.com/images/themes/theme1/bg.png',
  profile_link_color: '0084B4',
  location: null,
  status: 
   { entities: { urls: [], hashtags: [Object], user_mentions: [Object] },
     place: null,
     favorited: false,
     created_at: 'Wed Jan 30 11:47:25 +0000 2013',
     in_reply_to_status_id_str: null,
     geo: null,
     in_reply_to_user_id_str: null,
     contributors: null,
     retweet_count: 5,
     retweeted_status: 
      { entities: [Object],
        place: null,
        favorited: false,
        created_at: 'Wed Jan 30 10:08:58 +0000 2013',
        in_reply_to_status_id_str: null,
        geo: null,
        in_reply_to_user_id_str: null,
        contributors: null,
        retweet_count: 5,
        retweeted: false,
        text: 'Memoria corta? Pastiglia N.2\n\n#Alfano: "Il lavoro al primo posto!Parleremo anche di accesso al credito. Ok agenda Monti.Ci sarò"\n\n12/03/2012',
        id_str: '296560628825481216',
        source: '<a href="http://itunes.apple.com/us/app/twitter/id409789998?mt=12" rel="nofollow">Twitter for Mac</a>',
        coordinates: null,
        in_reply_to_screen_name: null,
        in_reply_to_user_id: null,
        in_reply_to_status_id: null,
        id: 296560628825481200,
        truncated: false },
     retweeted: false,
     text: 'RT @carlo_secchi: Memoria corta? Pastiglia N.2\n\n#Alfano: "Il lavoro al primo posto!Parleremo anche di accesso al credito. Ok agenda Mont ...',
     id_str: '296585406223376384',
     source: '<a href="http://twitter.com/#!/download/ipad" rel="nofollow">Twitter for iPad</a>',
     coordinates: null,
     in_reply_to_screen_name: null,
     in_reply_to_user_id: null,
     in_reply_to_status_id: null,
     id: 296585406223376400,
     truncated: false },
  screen_name: 'francescocomo',
  default_profile: true,
  description: null,
  contributors_enabled: false }

 * 
 */


var config = require('../config.js');
var mongoose = require('mongoose');
var twitter = require('ntwitter');
var credentials = require('../config_twitter.js');

mongoose.set('debug', config.db_debug)

console.log("opening connection with " + config.db_name + "@" + config.db_host );
var db = mongoose.createConnection(config.db_host, config.db_name);

var t = new twitter({
    consumer_key: credentials.twit_consumer_key,
    consumer_secret: credentials.twit_consumer_secret,
    access_token_key: credentials.twit_access_token,
    access_token_secret: credentials.twit_token_secret
});

// if you have problems here change ulimit "ulimit -n [how-much-you-want]"
process.setMaxListeners(0);
db.once('open', function() {
    function saveExtraInfo(info, usr, callback){
        usr.mep_follower_count = info.mep_follower_count;
        usr.mep_last_tweet_time = info.mep_last_tweet_time;
        usr.mep_last_tweet = info.mep_last_tweet;
        usr.mep_tweet_count = info.mep_tweet_count;
        usr.save(function(err, type){
            if (err) {
                console.error('Saving user ' + usr.mep_firstName + ' problem.');
                process.exit(0);
              }
            callback();
        });
        // nome generico
    }

    var mepSchema = config.schema
    var MepModel = db.model(config.db_collection, mepSchema);
    
    // avatar importer async version
    var counter = 0;
    var counterInGroup = 0;
    var group = 0;
    var counterResponse = 0;
    var countResponseDiff = 0;
    MepModel.find({/*"mep_follower_count" :  { $ne: "" }*/}, function(err, meps) { 
      count = meps.length;
      mep_twitterUrls = new Array();
      meps.forEach(function(i) {
    	mep_twitterUrls[group] = i.mep_twitterUrl;
      	group++;
    	counterInGroup++;
		if(group == 99 || meps.length-counterInGroup == 0){
			console.log("group: " + group);
			console.log("remains: " + (meps.length-counterInGroup));
	    	var params = {screen_name : mep_twitterUrls.join(',')};
		      mep_twitterUrls = new Array();
	        var url = "https://api.twitter.com/1.1/users/lookup.json";

	        t.get(url, params, function(err, data) {
	            if (err) {
	                console.log(err);
		            counter = counter+100; 
	              }
	            else{
            		counterResponse += data.length;
            		countResponseDiff = countResponseDiff+(group-data.length);
	            	data.forEach(function(user) {
	    	              MepModel.findOneAndUpdate({"mep_twitterUrl" :  user.screen_name }, {
	 	            		   "mep_follower_count" : user.followers_count,
	 	           		       "mep_last_tweet_time" : (typeof(user.status) != "undefined" && typeof(user.status.created_at) !== "undefined") ? user.status.created_at : null,
	 	        		       "mep_last_tweet" : (typeof(user.status) != "undefined" && typeof(user.status.text) !== "undefined") ? user.status.text : null,
	 	        		       "mep_tweet_count" : user.statuses_count
	 	            		},
	 	            		function(err) {
			    	            counter++; 
			    	            if (counter == meps.length || meps.length-counterResponse-countResponseDiff == 0) {
			    	              console.log('Imported: ' + counterResponse + ' extra info.');
			    	              mongoose.disconnect(); 
			    	              process.exit();
			    	            }
			    	          });
	 	            		}
	 	            	);
	            	
/*
*/			
	            }
	        });
			group = 0;
		}
      });
    });
});
