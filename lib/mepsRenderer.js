var render = {
  formatAdditional: function(meps) {
    return meps;
    for (var i = 0; i < meps.length; i++) {
      var output = '';
      if (!meps[i].mep_additionalProperties) {
        meps[i].mep_additionalProperties = ['test'];
      }
      additionalProperties = eval(meps[i].mep_additionalProperties);
      //console.log(additionalProperties); process.exit(1);
      output += '<dl>';
      output += '<dt>Local Party</dt> <dd> <a href="?mep_name=&mep_country=&mep_faction=&mep_localParty='+ meps[i].mep_localParty + '">'+ meps[i].mep_localParty +' </a> </dd>';
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
    return meps;
  }

}
module.exports = render;