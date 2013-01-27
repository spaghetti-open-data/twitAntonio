#!/bin/bash
php -f import/convertCsvtoJson.php > ./data.json
node import/import-deps.js data.json
rm data.json
node import/import-avatar.js
php import/convertCsvtoJson.php autocomplete > import/autocomplete/autocomplete.json
