<?php

// thanks DRUPAL
include_once('unicode/unicode.inc');

// see https://github.com/spaghetti-open-data/twitAntonio/issues/21
$keys = array();
$remote_csv = 'https://docs.google.com/spreadsheet/pub?key=0Ajp5_Nr0sKLIdFlpRkl2QzNORlZidnBFdklHWjlLTkE&output=csv';
mb_internal_encoding('UTF-8');

/* Set internal character encoding to UTF-8 */
if (($handle = fopen($remote_csv, "r")) !== FALSE) {
    $line = 0;
    $deps = array();
    while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
      if (!$line) {
        $header = $data;
      }
      else {
        $dep = array_combine($header, $data);
        $tw_url = utf8_strtolower($dep['mep_twitterUrl']);

        // NA comes from old csv files, just like a placeholder for empty twitter account
        if ($tw_url && $tw_url !== 'na') {  
          // if we already have this account, just add the new country (circoscrizione)
          if (isset($deps[$tw_url])) {
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

    // return static autocomplete structures (utf8)
    header('Content-type: application/json;');

    // get autocomplete json files
    if ((isset($argv[1])) && ($argv[1] == 'autocomplete')) {
      $autocomplete = createAutocompleteStaticJson($deps);
      $json = json_encode($autocomplete);
      print $json;
      exit;
    }

    print json_encode($deps);
    fclose($handle);
    exit;
}

/**
 * Create static JSON for autocomplete
 */
function createAutocompleteStaticJson($deps) {
  foreach ($deps as $dep) {
    $name = utf8_ucwords_lower_trim($dep['mep_firstName']) . ' ' . utf8_ucwords_lower_trim($dep['mep_lastName']);
    if ($name) {
      $names[] = $name;
    }   
    $party[$dep['mep_localParty']] = $dep['mep_localParty'];
    foreach ($dep['mep_country'] as $country) {
      $countries[] = trim($country);
    }
  }

  //$names = array_values(array_unique($names));
  $party = array_values($party);
  $countries = array_values(array_unique($countries));
  return array('party' => $party, 'countries' => $countries, 'names' => $names);
}

/**
 * Preprocess deps (this is specific just for this kind of application, needs to be adapted)
 */
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
    $dep['mep_lastName'] = utf8_ucwords_lower_trim($dep['mep_lastName']);
    $dep['mep_firstName'] = utf8_ucwords_lower_trim($dep['mep_firstName']);
    $dep['mep_faction'] = utf8_strtolower(trim($dep['mep_faction']));

    // remove strange chars (now just parenthesis)
    $dep['mep_firstName'] = str_replace(array('(', ')'), array(''), $dep['mep_firstName']);

    $dep['parlamento'] = utf8_strtolower($dep['parlamento']);
    $processed[] = $dep;
  }
  return $processed;
}