<?php

// see https://github.com/spaghetti-open-data/twitAntonio/issues/21
$keys = array();
$remote_csv = 'https://docs.google.com/spreadsheet/pub?key=0Aq3nVlLNTO8jdEtTVkpIaHNiUE5OWE9iUjA5RFFnbVE&output=csv';

if (($handle = fopen($remote_csv, "r")) !== FALSE) {
    $line = 0;
    $deps = array();
    while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
      if (!$line) {
        $header = $data;
      }
      else {
        $dep = array_combine($header, $data);
        $tw_url = strtolower($dep['mep_twitterUrl']);

        // NA comes from old csv files, just like a placeholder for empty twitter account
        if ($tw_url && $tw_url !== 'na') {  
          // if we already have this account, just add the new country (circoscrizione)
          if ($deps[$tw_url]) {
            $deps[$tw_url]['mep_country'][] = $dep['mep_country'];
            continue;
          }
          else {
            $dep['mep_country'] = array($dep['mep_country']);
            $deps[$tw_url] = $dep;
          }
        }
      }
      $line++;
    }
  
    // post processing data (in order to make them compatible with tymep existing data structures)
    $deps = postProcess($deps);

    // static autocomplete
    createStaticJson($deps);
    header('Content-type: application/json');
    print json_encode($deps);
    fclose($handle);
    exit;
}

/**
 * Create static JSON for autocomplete
 */
function createStaticJson($deps) {
  foreach ($deps as $dep) {
    $names[] = $dep['mep_firstName'] . ' ' . $dep['mep_lastName'];
    $party[$dep['mep_localParty']] = $dep['mep_localParty'];
    foreach ($dep['mep_country'] as $country) {
      $countries[] = trim($country);
    }
  }
  
  $party = array_values($party);
  $countries = array_values(array_unique($countries));
  file_put_contents('autocomplete/names.json', json_encode($names));
  file_put_contents('autocomplete/parties.json', json_encode($party));
  file_put_contents('autocomplete/countries.json', json_encode($countries));
}

function postProcess($deps) {
  $processed = array();
  foreach ($deps as $dep) {
    // data mapping with old MEP structure (a big pile of crap)
    // move facebook, personalwebsite and other less relevant informations to additionalProperties
    if ($dep['mep_facebookId']) {
      $dep['mep_additionalProperties']['Facebook'] = $dep['mep_facebookId'];
    }
    if ($dep['mep_personalWebsite']) {
      $dep['mep_additionalProperties']['Sito personale'] = $dep['mep_personalWebsite'];
    }
    if ($dep['mep_personalWebsite']) {
      $dep['mep_additionalProperties']['Sito personale'] = $dep['mep_personalWebsite'];
    }
    $dep['mep_additionalProperties'] = '[' . json_encode($dep['mep_additionalProperties']) . ']';
    

    $dep['mep_twitterUserName'] = $dep['mep_twitterUrl'];
    $dep['mep_userId'] = '';

    // sanitize data
    $dep['mep_lastName'] = ucwords(strtolower($dep['mep_lastName']));
    $dep['mep_firstName'] = ucwords(strtolower($dep['mep_firstName']));
    $dep['parlamento'] = ucwords(strtolower($dep['parlamento']));
    $processed[] = $dep;
  }
  return $processed;
}