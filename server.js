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

var clientId = "00ad9b505220aab0cb9d1a02163609435355d3fc191f7d7c8519e41a164bfdb8";
var clientSecret = "1351dfa8fe11d28dc6750f99e559b3347647d0d5236efdfdf454ef9df7f83495";
var redirect_uri = "http://srmrest.herokuapp.com/callback";
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
                    "url" : "http://localhost:8888/main"
                });//response.redirect('http://localhost:8888/main');
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
//                    refreshPath = "/oauth/token?client_id=" + clientId + "&client_secret=" + clientSecret + "&redirect_uri=" + redirect_uri + "&refresh_token=" + refreshToken + "&grant_type=refresh_token";
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
                                "url" : "http://localhost:8888/main"
                            });
                            //response.redirect('http://localhost:8888/');
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
//        "path": "/oauth/token?client_id=91643e161d13ccbdcfc1681ce81da56c18ac44ec98558b07da6980e6426bfd32&client_secret=0242617904b60702b5701d874cf928de74066ba5f3a9221de3720407da913152&redirect_uri=https://www.getpostman.com/oauth2/callback&code=" + code + "&grant_type=authorization_code",
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
//            response.json({
//                "status" : "updateToken",
//                "CacheParam" : CacheParam,
//                "url" : "http://localhost:8888/main"
//            });
            response.redirect("http://srmrest.herokuapp.com/#/main?srmnewtoken=" + output.access_token + "&srmrefreshtoken=" + output.refresh_token + "&code=" + code);
        
        });
    });

    req.end();
    
});