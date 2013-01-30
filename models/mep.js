  /**  
  "mep_country": "PT",
    "mep_emailAddress": "ines.zuber@europarl.europa.eu",
    "mep_epFotoUrl": "http://www.europarl.europa.eu/mepphoto/111589.jpg",
    "mep_epPageUrl": "",
    "mep_facebookId": "",
    "mep_facebookPageUrl": "",
    "mep_faction": "UL",
    "mep_firstName": "Inês Cristina",
    "mep_lastName": "Zuber",
    "mep_localParty": "Partido Comunista Português",
    "mep_personalWebsite": "",
    "mep_twitterUrl": "",
    "mep_userId": "23132",
    "mep_additionalProperties": "[{\"Member\":\"European Parliament\"},{\"Vice-Chair\":\"Committee on Employment and Social Affairs\"},{\"Substitute\":\"Committee on Industry, Research and Energy\"}]",
    "mep_itemCount": 0
  */

var mepModel = function() {
  var mongoose = require('mongoose');
  var config = require('../config.js');
  var schema = mongoose.Schema;

  // Define Mep model
  var mepSchema = config.schema;

  // connect to db
  this.getModel = function() {
    // @todo handle errors
    var db = mongoose.createConnection(config.db_host, config.db_name);
    var mepModel = db.model(config.db_collection, mepSchema);
    return mepModel;
  }


  /* Execute search */
  this.search = function(op, options, callback) {
    var sort = {};
    sort[options.sort_attrib] = options.sort_type;
    var Mongo = this.getModel();
    var q = Mongo.find(op)
                 .skip(options.offset)
                 .limit(options.limit)
                 .sort(sort);
    
    q.execFind(function(err, mep) {
      if (err) {
        //@todo we urgently need a robust error handlers
        console.err('Fatal error, try again.').
        process.exit(0);
      }
      callback(mep);
    });
  }

  this.save = function(data) {
    // just a stub function
    /*var Mep = this.getModel();
    Mep.save(function (err) {
      if (err) throw err;
      console.log('User saved, thanks');
    });
    */  
  };
  
  /* ricerca in base a criteri multipli .
   * TODO: sostituire i parametri con un oggetto options modificato solo nei campi interessati...
   */
  this.findByCriteria = function(search, options, callback) {
    var op = {
	    mep_fullName:  { $regex: search.name, $options: 'i' },
      // thanks: http://stackoverflow.com/questions/10700921/case-insensitive-search-with-in
      mep_country: { $elemMatch :  { $regex : search.country, $options : 'i' } },
      mep_localParty: { $regex: search.localParty, $options: 'i' },
      parlamento:  { $regex: search.parlamento, $options: 'i' },
	    mep_twitterUrl: { $ne : ""},
    };
    if (search.faction) {
       op['mep_faction'] = search.faction;
    }
    console.log(options);
    this.search(op, options, callback);
  };
}

module.exports = new mepModel();

