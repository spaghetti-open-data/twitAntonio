var config = require('../config.js');
var request = require('request');
var mongoose = require('mongoose');
var fs = require('fs')

// hack per fs
fs.exists = fs.exists || require('path').exists;
fs.existsSync = fs.existsSync || require('path').existsSync;

mongoose.set('debug', config.db_debug)

console.log("opening connection with " + config.db_name + "@" + config.db_host );
var db = mongoose.createConnection(config.db_host, config.db_name);

if (!fs.existsSync('imgs/users/')) {
    fs.mkdirSync("imgs");
    fs.mkdirSync("imgs/users/");
}

function saveurl(url,user){
    var localurl = "imgs/users/"+user._id+".asdasd";//".jpeg";
    //request(url, function(error,response,body){
    //    if(!error && response.statusCode == 200 ){
    //        console.log("ok");
    //        user.mep_epFotoUrl = config.base_path + localurl;
    //        user.save();
    //    }
    //} ).pipe( fs.createWriteStream(localurl) );
    request(url ).pipe( fs.createWriteStream(localurl) );
    user.mep_epFotoUrl = config.base_path + localurl;
    user.save();
    return localurl;
}

db.once('open', function() {

    var mepSchema = config.schema
    var MepModel = db.model(config.db_collection, mepSchema);

    MepModel.find( function(err,mep){
        mep.forEach( function(i){
            var url = "http://api.twitter.com/1/users/profile_image?screen_name="+ i.mep_twitterUrl + "&size=bigger";
            console.log("now handle: "+url);
            saveurl(url,i);
        });
    });


    // very end:
    setTimeout( function () {
     mongoose.disconnect();
    }, 1000);
});