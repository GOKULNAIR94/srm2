'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const restService = express();
var https = require('https');
var fs = require('fs'),
    path = require('path');
restService.use(bodyParser.urlencoded({
    extended: true
}));
restService.use(bodyParser.json());

var CheckLogin = require("./js/checklogin");
var RefreshToken = require("./js/refreshtoken");

var apiai = require('apiai');
var appSRMAI = apiai("8d83e8d3c4404af88b7436823ce27348 ");


var clientId = "d4295c794fa276402195ad7001ff65be90739d757907e5203f6785895d49e4cd";
var clientSecret = "057bc282f5a6c21c73fcfd221fd4efb300bfe5eb2fd05e0f4c3faead78c476c1";
var redirect_uri = "http://localhost:8888/callback";
var scope = "engage";

var refreshPath = "";
var refreshToken = "";
var newToken = "";
var code = "";

restService.get('/', onRequest);
restService.use(express.static(path.join(__dirname, '/public')));


function onRequest(request, response){
  response.sendFile(path.join(__dirname, '/public/index.html'));
}

restService.get('/main', onRequest);
restService.use(express.static(path.join(__dirname, '/public')));


function onRequest(request, response){
  response.sendFile(path.join(__dirname, '/public/index.html'));
}

restService.listen((process.env.PORT || 8888), function() {
  console.log("Server up and listening");
});


restService.post('/checklogin',function(request,response){
    
    newToken = request.body.srmnewtoken;
    refreshToken = request.body.srmrefreshtoken;
    code = request.body.code;
    
    console.log("newToken : " + newToken );
    console.log("refreshToken : " + refreshToken );
    console.log("code : " + code );
    
    if( newToken == "" || newToken == null ){
        response.json({
            "status" : "401",
            "url" : "https://gatekeeper.vitrue.com/oauth/authorize?client_id=" + clientId + "&client_secret=" + clientSecret + "&redirect_uri=" + redirect_uri + "&scope=" + scope + "&response_type=code" 
        });
    }
    else{
        CheckLogin( newToken, function( statusCode ) {
            
            if( statusCode == 200 ){
                response.json({
                    "status" : "200",
                    "url" : "https://gatekeeper.vitrue.com/oauth/authorize?client_id=" + clientId + "&client_secret=" + clientSecret + "&redirect_uri=" + redirect_uri + "&scope=" + scope + "&response_type=code" 
                });
            }
            else{
                if( refreshToken == "" || refreshToken == null ){
                    response.json({
                        "status" : "401",
                        "url" : "https://gatekeeper.vitrue.com/oauth/authorize?client_id=" + clientId + "&client_secret=" + clientSecret + "&redirect_uri=" + redirect_uri + "&scope=" + scope + "&response_type=code" 
                    });
                }
                else{
                    refreshPath = "/oauth/token?client_id=" +clientId + "&client_secret=" + clientSecret + "&redirect_uri=" + redirect_uri + "&code=" + code + "&refresh_token=" + refreshToken +"&grant_type=refresh_token";

                    RefreshToken( refreshPath, function( output ) {
                        if( output != "Error"){
                            console.log( "Refreshed Tokens : " + output );
                            var CacheParam = {
                                "srmnewtoken" : output.access_token,
                                "srmrefreshtoken" : output.refresh_token,
                                "code" : code
                            }
                            response.json({
                                "status" : "updateToken",
                                "CacheParam" : CacheParam,
                                "url" : "https://gatekeeper.vitrue.com/oauth/authorize?client_id=" + clientId + "&client_secret=" + clientSecret + "&redirect_uri=" + redirect_uri + "&scope=" + scope + "&response_type=code" 
                            });
                            
                        }
                        else{
                            response.json({
                                "status" : "401",
                                "url" : "https://gatekeeper.vitrue.com/oauth/authorize?client_id=" + clientId + "&client_secret=" + clientSecret + "&redirect_uri=" + redirect_uri + "&scope=" + scope + "&response_type=code" 
                            });
                        }
                    });
                }
            }
        });
    }
});

restService.get('/callback',function(request,response){
    
    code = request.query.code;
    console.log( "code WOW : " + code );
    
    var options = {
        "method": "POST",
        "hostname": "gatekeeper.vitrue.com",
        "path": "/oauth/token?client_id=" + clientId + "&client_secret=" + clientSecret + "&redirect_uri=" + redirect_uri + "&code=" + code + "&grant_type=authorization_code",
        "headers": {
            "cache-control": "no-cache"
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

            var output = JSON.parse( body.toString() );
            console.log("Get dAta");
            console.log("Access Token : " + output.access_token );
            console.log("Refresh Token : " + output.refresh_token );
            
            var CacheParam = {
                "srmnewtoken" : output.access_token,
                "srmrefreshtoken" : output.refresh_token,
                "code" : code
            }
            response.redirect("http://localhost:8888/#/main?srmnewtoken=" + output.access_token + "&srmrefreshtoken=" + output.refresh_token + "&code=" + code);
        
        });
    });

    req.end();
    
});

restService.post('/getData',function(request,response){
    console.log("Get dAta");
    newToken = request.body.data;
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
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function () {
            var body = Buffer.concat(chunks);
            console.log(body.toString());
            var output = JSON.parse(body.toString());
            if( res.statusCode == 200 )
                response.json( {"status" : 200,
                               "output" : output } );
            else
                response.json( {"status" : 401 } );
        });
    });

    req.end();

});

restService.post('/sendAI',function(request,response){
	console.log("sendAI dAta");
    var inputMsg = request.body.data;
	
	var request = appSRMAI.textRequest( inputMsg, {
		sessionId: 123456798
	});
	 
	request.on('response', function(output) {
		console.log(output);
		response.json({"status" : 200,
                               "output" : output });
	});
	 
	request.on('error', function(error) {
		console.log(error);
	});
	 
	request.end();
});