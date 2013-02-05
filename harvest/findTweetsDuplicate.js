var mongoose = require('mongoose');
var config = require('../config.js');

//mapped 1-1 to Twitter object
var twschema = new mongoose.Schema(config.tw_harvest_schema_1_1, {autoindex: true});


//connect to dataabse
var db = mongoose.createConnection(config.db_host, config.db_name);
db.on('error', console.error.bind(console, 'connection error:'));


//Tweet Model object
var TweetElement = db.model(config.db_collection_twitter_1_1, twschema);
var totaltweets = new Array();
var total = 0;
var totalRemoved = 0;
var totaltweetsLength = 0;
var totaltweetsDuplicatedLength = 0;
TweetElement.find({},function(err, tweets) {
	var tweetsTot = tweets.length;
	if(tweetsTot == 0){
		console.log('No tweet founded');
		process.exit(1);
	}
	for(var i in tweets){
		if(typeof(totaltweets[tweets[i].id]) == 'undefined'){
			totaltweets[tweets[i].id] = 1;
			totaltweetsLength++;
		}
		else{
			totaltweetsDuplicatedLength++;
			totaltweets[tweets[i].id]++;
		}
	}
	if(totaltweetsDuplicatedLength == 0){
		console.log('No tweet duplicated founded');
		process.exit(1);
	}
	for(var idtweet in totaltweets){
		if(totaltweets[idtweet] > 1){
			console.log(idtweet + " : " + totaltweets[idtweet]);
			/*
			TweetElement.findOneAndRemove({id : idtweet},{},function(err,items){
				totalRemoved++;
				if(totalRemoved+total == totaltweetsLength){
					console.log(totalRemoved + " duplicated tweet removed");
					process.exit(1);
				}
			});
			*/
		}
		else{
			total++
		}
	}
});
