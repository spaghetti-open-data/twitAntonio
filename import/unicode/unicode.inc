<?php

function utf8_strtolower($text) {
  return mb_strtolower($text);
}

/* ucfirst and strtolower */
function utf8_ucwords_lower_trim($text) {
  $text = utf8_strtolower($text);
  return ucwords(trim($text));
}

function _unicode_caseflip($matches) {
  return $matches[0][0] . chr(ord($matches[0][1]) ^ 32);
}

?>