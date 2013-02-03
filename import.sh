#!/bin/bash
php -f import/convertCsvtoJson.php > ./data.json
node import/import-deps.js data.json
rm data.json
node import/import-avatar.js
node import/import-extra-info.js
php import/convertCsvtoJson.php autocomplete > import/autocomplete/autocomplete.json
