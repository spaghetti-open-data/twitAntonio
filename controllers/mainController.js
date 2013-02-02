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

       // sorting methods:
       sorting = (req.query.sorting ? req.query.sorting : '');
       sorting_order = (req.query.sorting_order ? req.query.sorting_order : '');

       // update options object to match the sort type (use defaults values)
       switch (sorting) {
        case 'name': 
          options['sort_attrib'] = 'mep_lastName';
          options['sort_type'] = 'asc';
          break;
        case 'party': 
          options['sort_attrib'] = 'mep_localParty';
          options['sort_type'] = 'asc';
          break;
        case 'country':
          options['sort_attrib'] = 'mep_country';
          options['sort_type'] = 'asc';
          break;
        case 'tweets': 
          options['sort_attrib'] = 'mep_tweet_count';
          options['sort_type'] = 'desc';
          break;
        case 'followers': 
          options['sort_attrib'] = 'mep_follower_count';
          options['sort_type'] = 'desc';
          break;
        case 'lastTweet': 
          options['sort_attrib'] = 'mep_last_tweet';
          options['sort_type'] = 'desc';
          break;
        default: 
         var rndMethods = ['mep_lastName','mep_firstName','mep_localParty','mep_country'];
         var idx = Math.floor( Math.random() * ( rndMethods.length ) );
         var ascdesc = !! Math.round(Math.random() * 1);
         options['sort_attrib'] = rndMethods[idx];
         options['sort_type'] = (ascdesc ? 'asc' : 'desc');
       }

       // search object
       var search = {'name': name, 
                     'localParty': localParty, 
                     'country': country, 
                     'parlamento': parlamento,
                     'faction': faction,
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
    },
    videoAction: function (req, res) {
      res.render('video', { config: config, req: req});
    },
  };
  return self;
}

