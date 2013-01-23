TwitAntonio
============

TwitAntonio



### installazione

Software prerequisiti: nodejs, npm, mongodb
( per convertire i dati serve installare anche php )

Su Ubuntu/Debian, dovrebbe bastare:

`sudo apt-get install nodejs npm mongodb php`

[ nota, su Ubuntu il comando per node.js è "nodejs", non solo "node" ]

Successivamente, i seguenti comandi:

    $ npm install
    $ cp config.js.development config.js
    $ cd import
    $ php -f convertCsvtoJson.php > ./data.json
    $ node import-deps.js data.json
    $ cd ..
    $ node app
