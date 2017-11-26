module.exports = function( refreshPath, callback ) {
    var https = require('https');

    var options = {
        "method": "POST",
        "hostname": "gatekeeper.vitrue.com",
        "path": refreshPath,
        "headers": {
            "cache-control": "no-cache",
        }
    };
    console.log( "path : " + options.path );
    var req = https.request(options, function (res) {
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function () {
            var body = Buffer.concat(chunks);
            console.log(body.toString());
            console.log("Refresh : Status : " + res.statusCode );
            var output = JSON.parse( body.toString() );
            if( res.statusCode == 200 )
                return callback( output );
            else
                return callback( "Error" );
        });
    });

//    req.write(JSON.stringify(  ));
    req.end();
}