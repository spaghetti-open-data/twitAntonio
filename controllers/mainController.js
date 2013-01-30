//indexController.js
module.exports = function() {
  var config = require('../config.js');
  var model = require('../models/mep.js');
  var render = require("../lib/mepsRenderer.js");
  var fs = require('fs');

  // @todo hardcoded number just for test, this needs to be refactored to support pagination

  // internal request handler
  var internal = {
    filter: function(req, res, callback) {
       if (config.app_debug){
         console.log("-------------------------------------------------------")
         console.log(req.query)
         console.log("-------------------------------------------------------")          
       } 

      options = { 
         'limit': (req.query.limit ? req.query.limit : 2000),
         'offset': (req.query.offset ? req.query.offset : 0),
         'sort_attrib': 'mep_lastName',
         'sort_type': 'asc'
       };
        
       // get request parameters
       name = (req.query.mep_name ? req.query.mep_name : '');
       localParty = (req.query.mep_localParty ? req.query.mep_localParty : '');
       country = (req.query.mep_country ? req.query.mep_country : '');
       faction = (req.query.faction ? req.query.faction : '');

       // specific for #twitantonio
       parlamento = (req.query.parlamento ? req.query.parlamento : '');

       // search object
       var search = {'name': name, 
                     'localParty': localParty, 
                     'country': country, 
                     'parlamento': parlamento,
                     'faction': faction
                     };
       
       // TODO: sostituire i parametri con un oggetto options modificato solo sui valori interessati
       meps = model.findByCriteria(search, options, function(meps) {
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

	  cos_eAction: function (req, res) {
      res.render('cos_e', { config: config, req: req});
    },

	  creditsAction: function (req, res) {
      res.render('credits', { config: config, req: req});
    },

    helpAction: function (req, res) {
      res.render('help', { config: config, req: req});
    }
  };
  return self;
}

