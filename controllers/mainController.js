//indexController.js
module.exports = function() {
  var config = require('../config.js');
  var model = require('../models/mep.js');
  var render = require("../lib/mepsRenderer.js");
  var fs = require('fs');

  // @todo hardcoded number just for test, this needs to be refactored to support pagination
  options = { 
      'limit': 800,
      'offset': 0,
      'sort_attrib': 'mep_lastName',
      'sort_type': 'asc'
  };

  // internal request handler
  var internal = {
    filter: function(req, res, callback) {
       var limit = (req.query.limit) ? config.limit : 800;
       var offset = (req.query.offset) ? config.offset : 0;  

       if (config.app_debug){
         console.log("-------------------------------------------------------")
         console.log(req.query)
         console.log("-------------------------------------------------------")          
       } 
        
       // get request parameters
       name = (req.query.mep_name ? req.query.mep_name : '');
       localParty = (req.query.mep_localParty ? req.query.mep_localParty : '');
       country = (req.query.mep_country ? req.query.mep_country : '');
       faction = (req.query.mep_faction ? req.query.mep_faction : '');
       
       // TODO: sostituire i parametri con un oggetto options modificato solo sui valori interessati
       meps = model.findByCriteria(name, localParty, country, faction, options.limit, options.offset, options, function(meps) {
         meps = render.formatAdditional(meps);
         callback(meps);
       });
    }
  }

  // controller 
  var self = { 
    // api object
    apiAction: {
      get: function(req, res) {
        internal.filter(req, res, function(meps) {
           meps = render.formatAdditional(meps);
           res.writeHead(200, {
                 "Content-Type": "application/json",
                 "Access-Control-Allow-Origin": "*"
           });
           res.end(JSON.stringify(meps));
        })
      },
      autocomplete: function(req, res) {
        type = req.params.type;
        fs.readFile('./import/autocomplete/autocomplete.json', 'utf8', function (err, data) {
          var names = data;
          res.writeHead(200, {
                 "Content-Type": "application/json",
                 "Access-Control-Allow-Origin": "*"
          });
          res.end(data);
        });
      }
    },

    // general requests
    indexAction : function (req, res) {
      var user = false;
      // check if twitter auth is active, if active pass the entire user object (if present)
      if (config.twitter_auth) {
        var loggedIn = req.loggedIn;
        if (loggedIn) {
          user = req.user.twit;
        }
      }
      internal.filter(req, res, function(meps) {
        res.render('index', { config: config, meps: meps, req: req, user: user});
      });
    },

    mapAction: function (req, res) {
      res.render('mappa', { config: config, req: req});
    },

    importerAction: function (req, res) {
      //res.render('importer', config);
    }
  };
  return self;
}

