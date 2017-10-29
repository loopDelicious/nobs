### For development

Start webpack watcher

    $ webpack -w  // then reload unpacked extension at chrome://extensions
    
Run server

    $ nodemon src/js/server.js
    
To access database, start Postgres and:

    $ psql nobs_db
    
Start Redis client

    $ redis-server

### Upload extension (.zip) file

From parent directory:

    $ zip -r truthometer.zip nobs2 --exclude=*.DS_Store* --exclude=*.git* --exclude=*node_modules* --exclude=*.idea*
