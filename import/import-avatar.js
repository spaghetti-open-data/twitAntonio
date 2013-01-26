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

DIRNAME="avatars";
if (!fs.existsSync("../public/"+DIRNAME)) {
    fs.mkdirSync("../public/"+DIRNAME);
}


db.once('open', function() {

    function saveurl(url,usr){
        // nome generico
        var localurl = DIRNAME + "/"+usr._id+ ".photo";//.jpeg";
        request(url, function(error,response,body){
            if(!error && response.statusCode == 200 ){
                usr.mep_epFotoUrl = config.base_path + localurl;
                usr.save();
            }
        } ).pipe( fs.createWriteStream("../public/"+localurl) );
        return localurl;
    }

    var mepSchema = config.schema
    var MepModel = db.model(config.db_collection, mepSchema);

    MepModel.find( function(err,mep){
        mep.forEach( function(i){
            var url = "http://api.twitter.com/1/users/profile_image?screen_name="+ i.mep_twitterUrl + "&size=bigger";
            console.log("now handle: "+url);
            saveurl(url,i);
        });
    });


    // very end, need to give enough time to finish all async stuff.
    setTimeout( function () {
     mongoose.disconnect();
    }, 10000);
});
