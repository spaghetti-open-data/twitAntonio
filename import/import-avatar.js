var config = require('../config.js');
var request = require('request');
var mongoose = require('mongoose');
var fs = require('fs')
var async = require('async');
var http = require('http');

// hack per fs
fs.exists = fs.exists || require('path').exists;
fs.existsSync = fs.existsSync || require('path').existsSync;

mongoose.set('debug', config.db_debug)

console.log("opening connection with " + config.db_name + "@" + config.db_host );
var db = mongoose.createConnection(config.db_host, config.db_name);

DIRNAME="avatars";
if (!fs.existsSync("./public/"+DIRNAME)) {
    fs.mkdirSync("./public/"+DIRNAME);
}

process.setMaxListeners(0);
db.once('open', function() {
    function saveurl(url, usr, callback){
        // nome generico
        var localurl = DIRNAME + "/" + usr._id + ".photo";//.jpeg";
        var r = request(url, function(error, response, body){
            if(!error && response.statusCode == 200 ){
                usr.mep_epFotoUrl = config.base_path + localurl;
                usr.save();
            };
            //id = fs.writeFile("./public/" + localurl, body);
        }).pipe(fs.createWriteStream("./public/" + localurl));        

        // fire on close
        r.on('close', function () { 
          callback();
        });
    }

    var mepSchema = config.schema
    var MepModel = db.model(config.db_collection, mepSchema);
    
    // avatar importer async version
    var counter = 0;
    MepModel.find({}, function(err, meps) { 
      count = meps.length;
      meps.forEach(function(i) {
        var url = "http://api.twitter.com/1/users/profile_image?screen_name="+ i.mep_twitterUrl + "&size=bigger";
        saveurl(url, i, function() {
          counter++; 
          if (counter == meps.length) {
            console.log('Imported: ' + counter + ' avatars.');
            mongoose.disconnect(); 
            process.exit();
          }
        });
      });
    });
});
