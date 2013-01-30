// credits here: http://stackoverflow.com/questions/2450954/how-to-randomize-a-javascript-array
function fisherYates ( myArray ) {
  var i = myArray.length, j, tempi, tempj;
  if ( i == 0 ) return false;
  while ( --i ) {
     j = Math.floor( Math.random() * ( i + 1 ) );
     tempi = myArray[i];
     tempj = myArray[j];
     myArray[i] = tempj;
     myArray[j] = tempi;
   }
}

var render = {
  formatAdditional: function(meps,sort) {
    //return meps;
    for (var i = 0; i < meps.length; i++) {
      var output = ''; 
      additionalProperties = eval(meps[i].mep_additionalProperties);

      if (typeof additionalProperties !== 'undefined') {
        output += '<dl>';
        output += '<dt> Lista </dt> <dd> <a href="?mep_name=&mep_country=&mep_faction=&mep_localParty='+ meps[i].mep_localParty + '">'+ meps[i].mep_localParty +' </a> </dd>';

        // specific for #twitantonio
        circoscrizioni = meps[i].mep_country;
        output += '<dt> Circoscrizioni </dt>';
        output += '<dd><ul>'
        circoscrizioni.forEach(function(item) {
          output += '<li><a href="?mep_country='+ item +'">' + item + '</a></li>';
        });
        output += '</ul></dd>';

        for (var j = 0; j < additionalProperties.length; j++) {
          for (prop in additionalProperties[j]) {
            output += '<dt>' + prop + '</dt>';
            if (!additionalProperties[j][prop].indexOf("http")) {
              output += '<dd> <a href="' + additionalProperties[j][prop] + '" target="_blank">' + prop + '</a> </dd>';
            }
            else {
              output += '<dd>' + additionalProperties[j][prop] + '</dd>';
            }
          }
        }
        output += '</dl>';
        meps[i].formatted_properties = output;
      }
    }
    if( !sort ) fisherYates( meps );
    return meps;
  }

}
module.exports = render;
