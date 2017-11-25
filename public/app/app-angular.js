var app = angular.module('MyApp',["ngRoute"]);
app.run(function(){
    console.log("My App is Running!");
});

app.config(function($routeProvider) {    $routeProvider
//.when("/", {
//        templateUrl : "main.html",
//        controller: 'mainCont'
//    })
.when("/", {
        templateUrl : "wait.html"
    })
.when("/main", {
        templateUrl : "main.html"
    })
.when("/login", {
        templateUrl : "login.html"
    });
});


app.controller('indexCont', function($scope, $http, $location, $rootScope ) {
    console.log("This is index Controller!");
    console.log("srmnewtoken : " + window.localStorage.srmnewtoken);
    console.log("srmrefreshtoken : " + window.localStorage.srmrefreshtoken);
    console.log("code : " + window.localStorage.code);
    
    if( $location.search().srmnewtoken != "" && $location.search().srmnewtoken != null ){
        console.log("Search token: " + $location.search().srmnewtoken );
        window.localStorage.srmnewtoken = $location.search().srmnewtoken;
    }
        
    
    if( $location.search().srmrefreshtoken != "" && $location.search().srmrefreshtoken != null){
        console.log("Search rf: " +  $location.search().srmrefreshtoken);
        window.localStorage.srmrefreshtoken = $location.search().srmrefreshtoken;
    }
    
    if( $location.search().code != "" && $location.search().code != null){
        console.log("Search code : " + $location.search().code );
        window.localStorage.code = $location.search().code;
    }
    
    //$location.path('\main');
    
    if( window.localStorage ){
        $http({
            method: 'POST',
            url: 'https://localhost:8888/checklogin',
            data:{
                "srmnewtoken" : window.localStorage.srmnewtoken,
                "srmrefreshtoken" : window.localStorage.srmrefreshtoken,
                "code" : window.localStorage.code
            }
        }).then(function (response) {
            console.log( "response : " + JSON.stringify(response));
            
            if( response.data.status == 401 ){
                //$rootScope.authurl1 = response.data.url;
                $scope.authurl = response.data.url;
                $location.path('\login');
            }
            
            if( response.data.status == 200 ){
                $location.path('\main');
            }
            
            if( response.data.status == "updateToken" ){
                console.log("YAY");
                
                if( response.data.CacheParam.srmnewtoken != "" && response.data.CacheParam.srmnewtoken != null )
                    window.localStorage.srmnewtoken = response.data.CacheParam.srmnewtoken;
                
                $location.path('\main');
            }
        });
    }
    else{
        alert("Browser Error!")
    }
});

//app.controller('loginCont', function( $scope, $rootScope ) {
//    console.log("This is Login Controller!");
//    $scope.authurl = $rootScope.authurl1;
//});

app.controller('mainCont', function($scope, $http, $location, $rootScope ) {
    console.log("This is mainCont Controller!");
});
