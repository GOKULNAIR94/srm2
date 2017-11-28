var app = angular.module('MyApp',["ngRoute"]);
app.run(function(){
    console.log("My App is Running!");
});

app.config(function($routeProvider) {    $routeProvider

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
    $location.path('\/');
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
    
    
    if( window.localStorage ){
        $http({
            method: 'POST',
            url: 'https://srmrest.herokuapp.com/checklogin',
            data:{
                "srmnewtoken" : window.localStorage.srmnewtoken,
                "srmrefreshtoken" : window.localStorage.srmrefreshtoken,
                "code" : window.localStorage.code
            }
        }).then(function (response) {
            console.log( "response : " + JSON.stringify(response));
            $scope.authurl = response.data.url;
            
            if( response.data.status == 401 ){
                //$rootScope.authurl1 = response.data.url;    
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
    
    
    $scope.startListen = function ( ) {
        console.log("Get Data");
		document.getElementById("startListen").classList.remove("active");
		document.getElementById("startListen").classList.add("disabled");
		document.getElementById("stopListen").classList.remove("disabled");
		document.getElementById("stopListen").classList.add("active");

        $http({
            method: 'POST',
            data : { "data" : window.localStorage.srmnewtoken },
            url: 'https://srmrest.herokuapp.com/getData'
            
        }).then(function (response) {
            console.log(JSON.stringify(response));
            if( response.data.status == 200 )
               $scope.messages = response.data.output.items;
            else
                alert("Error");
        });
    };
	
	$scope.stopListen = function ( ) {
		document.getElementById("stopListen").classList.remove("active");
		document.getElementById("stopListen").classList.add("disabled");
		document.getElementById("startListen").classList.remove("disabled");
		document.getElementById("startListen").classList.add("active");
	};
	
	$scope.sendAI = function ( text ) {
		document.getElementById("stopListen").classList.remove("active");
		document.getElementById("stopListen").classList.add("disabled");
		document.getElementById("startListen").classList.remove("disabled");
		document.getElementById("startListen").classList.add("active");
		
		$http({
            method: 'POST',
            data : { "data" : text.substring( 0, 249 ) },
            url: 'https://srmrest.herokuapp.com/sendAI'
            
        }).then(function (response) {
            console.log(JSON.stringify(response));
            if( response.data.status == 200 ){
				               alert("ALert : " + response.data.output.result.fulfillment.speech);
							   alert("ALert!\nBureau :" + response.data.output.result.parameters.Bureau);
			}
            else
                alert("Error");
        });
	};
    
//    var messages = "Social Relationship Management";
//    $scope.showmsg = "Test" ;
//    setTimeout(function(){
//        var i = 0;
//        var myVar = setInterval(function(){ myTimer() }, 300);
//
//        function myTimer() {
//            console.log( i + " : " + messages.charAt(i) );
//            $scope.showmsg = $scope.showmsg + messages.charAt(i);
//            console.log("$scope.showmsg : " + $scope.showmsg );
//            if( i == messages.length-1 )
//                myStopFunction();
//            else
//                i++;
//        }
//
//        function myStopFunction() {
//            clearInterval(myVar);
//        }
//    },5000);
    

});

//app.controller('loginCont', function( $scope, $rootScope ) {
//    console.log("This is Login Controller!");
//    $scope.authurl = $rootScope.authurl1;
//});

app.controller('mainCont', function($scope, $http, $location, $rootScope ) {
    console.log("This is mainCont Controller!");
});
