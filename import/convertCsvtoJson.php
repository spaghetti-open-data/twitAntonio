<?php


if (($handle = fopen("https://docs.google.com/spreadsheet/pub?key=0AvZ1J8kmKfi7dEdPY2JtaEdlaHQ5anFxMkQ2RWN2Y1E&single=true&gid=11&output=csv", "r")) !== FALSE) {
    $num = 0;
    $line = 0;
    $deps = array();
    while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
      if ($line) {
        $deps[] = mapLinetoObject($data);
      }
      $line++;
    }
    print json_encode($deps);
    fclose($handle);
    exit;
}

function mapLinetoObject($data) {
  // mapping 1-1 to csv (to be refactored)
  $keys = array(
    'mep_lastName',  
    'mep_firstName',
    'mep_twitterUrl',
    'mep_country', 
    'mep_localParty',  
    'mep_faction',
    'parlamento', 
    'mep_epFotoUrl',
    'mep_emailAddress',
    'mep_epPageUrl',
    'mep_facebookId',
    'mep_facebookPageUrl',
    'mep_personalWebsite',
    'mep_userId',
    'mep_additionalProperties',
    'mep_itemCount'
  );
  $count = 0;
  foreach ($keys as $val) {
    $dep[$val] = $data[$count];
    $count++;
  }

  // sanitize NA
  if (strtolower($dep['mep_twitterUrl']) == 'na') {
    $dep['mep_twitterUrl'] = '';
  }

  // data mapping with old MEP structure (a big pile of crap)

  // move facebook, personalwebsite to additionalProperties
  $dep['mep_facebookId'] = 'http://facebook.com/paolomainardi';
  if ($dep['mep_facebookId']) {
    $dep['mep_additionalProperties']['facebook'] = $dep['mep_facebookId'];
  }
  $dep['mep_additionalProperties'] = '[' . json_encode($dep['mep_additionalProperties']) . ']';
  

  $dep['mep_twitterUserName'] = $dep['mep_twitterUrl'];
  $dep['mep_userId'] = '';

  // sanitize data
  $dep['mep_lastName'] = ucwords(strtolower($dep['mep_lastName']));
  $dep['mep_firstName'] = ucwords(strtolower($dep['mep_firstName']));
  $dep['parlamento'] = ucwords(strtolower($dep['parlamento']));

  //var_dump($dep); die;
  //var_dump($dep); die;
  return $dep;
}