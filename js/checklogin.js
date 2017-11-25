module.exports = function( newToken, callback ) {
    var https = require('https');
    
    var options = {
            "method": "GET",
            "hostname": "public-api.vitrue.com",
            "port": null,
            "path": "/engage/v1/messages?bundleId=34442",
            "headers": {
                "authorization": "Bearer " + newToken,
                "cache-control": "no-cache"
            }
        };

        var req = https.request(options, function (res) {
            res.on("data", function (chunk) {

            });
            res.on("end", function () {
                console.log("Check Login: Status : " + res.statusCode );
                return callback( res.statusCode );
            });
        });
        req.end();
}