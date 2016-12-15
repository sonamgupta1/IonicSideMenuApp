/**
 * Created by sonam on 13/8/15.
 */

IonicSideMenuApp.controller('AppCtrl', function($scope,$cordovaOauth, $ionicModal,$http, $timeout) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    // Form data for the login modal
    $scope.loginData = {};

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function() {
        $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function() {
        $scope.modal.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doLogin = function() {
        console.log('Doing login', $scope.loginData);

        // Simulate a login delay. Remove this and replace with your login
        // code if using a login system
        $timeout(function() {
            $scope.closeLogin();
        }, 1000);
    };
    $scope.login3 = function () {
        window.plugins.googleplus.login(
            {
                'scopes': '... ', // optional, space-separated list of scopes, If not included or empty, defaults to `profile` and `email`.
                'webClientId': '1014682315862-v2cqrlk4u9a505012ab3qbl9b4kog4j0.apps.googleusercontent.com', // optional clientId of your Web application from Credentials settings of your project - On Android, this MUST be included to get an idToken. On iOS, it is not required.
                'offline': true, // optional, but requires the webClientId - if set to true the plugin will also return a serverAuthCode, which can be used to grant offline access to a non-Google server
            },
            function (obj) {
                alert(JSON.stringify(obj)); // do something useful instead of alerting
            },
            function (msg) {
                alert('error: ' + msg);
            }
        );
    }
    $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

    var clientId = "1014682315862-v2cqrlk4u9a505012ab3qbl9b4kog4j0.apps.googleusercontent.com";
    var clientSecret = "auRYEeG-0Kwkl8oVq0bzYnaK";


    $scope.login1 = function() {
        var ref = window.open('https://accounts.google.com/o/oauth2/auth?client_id=' + clientId +
            '&redirect_uri=http://localhost/callback&scope=https://www.googleapis.com/auth/' +
            'urlshortener&approval_prompt=force&response_type=code&access_type=offline', '_blank', 'location=no');
        ref.addEventListener('loadstart', function(event) {
            console.log("result 1",JSON.stringify(event))
            if((event.url).startsWith("http://localhost/callback")) {
                requestToken = (event.url).split("code=")[1];
                alert("requestToken" +requestToken)
                console.log("result fridts",JSON.stringify(event))
                $http({method: "post", url: "https://accounts.google.com/o/oauth2/token", data: "client_id=" +
                clientId + "&client_secret=" + clientSecret + "&redirect_uri=http://localhost/callback" +
                "&grant_type=authorization_code" + "&code=" + requestToken })
                    .success(function(data) {
                        console.log("data in success",JSON.stringify(data))
                        accessToken = data.access_token;
                    })
                    .error(function(data, status,config) {
                        alert("ERROR: " + data);
                        console.log("status",status)
                        console.log("data",data)
                        console.log("config",config)
                    });
                ref.close();
            }
        });
    }

    if (typeof String.prototype.startsWith != 'function') {
        String.prototype.startsWith = function (str){
            return this.indexOf(str) == 0;
        };
    }


    $scope.googleLogin = function(){
        $cordovaOauth.google("1014682315862-v2cqrlk4u9a505012ab3qbl9b4kog4j0.apps.googleusercontent.com",
            ["https://www.googleapis.com/auth/urlshortener", "https://www.googleapis.com/auth/userinfo.email",
                "https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/plus.me"]).
        then(function(result){
            console.log("google login success");
            var accessToken;
            //$location.url('/scan');
            console.log(JSON.stringify(result));
            accessToken = JSON.stringify(result);
            console.log(result.access_token);

            //getting profile info of the user
            $http({method:"GET", url:"https://www.googleapis.com/plus/v1/people/me?access_token="+result.access_token}).
            success(function(response){
                console.log("user profile for google plus",JSON.stringify(response));
                var param = {
                    provider: 'google',
                    google: {
                        uid: response["id"],
                        provider: 'google',
                        first_name: response["name"]["givenName"],
                        last_name: response["name"]["familyName"],
                        email: response.emails[0]["value"],
                        image: response.image.url
                    }
                };
                console.log("user detail from google plus",JSON.stringify(param));
            }, function(error) {
                console.log("error to get user profile",JSON.stringify(error));
            });

        }, function(error){
            console.log("error in google plus login",JSON.stringify(error));
        });
    }

    window.cordovaOauth = $cordovaOauth;
    window.http = $http;

    $scope.demo_fb = function()
    {
        alert('called function1')
        $scope.facebookLogin(window.cordovaOauth, window.http);
    };

    $scope.facebookLogin = function($cordovaOauth, $http)
    {
        alert('called function2')
        $cordovaOauth.facebook("1614238065548930", ["email", "public_profile"],
            {redirect_uri: "http://localhost/callback"}).then(function(result){
            console.log(JSON.stringify(result))
            $scope.displayData($http,result.access_token);

        },  function(error){
            console.log("Error: " + error);
        });
    };

    $scope.displayData = function($http, access_token)
    {
        alert('Display data function')
        $http.get("https://graph.facebook.com/v2.2/me", {
            params: {
                access_token: access_token,
                fields: "email,id,name,age_range,gender,picture,location,verified",
                format: "json"
            }
        }).then(function(result) {
            var user = {
                id: result.data.id,
                email:result.data.email,
                access_token: access_token,
                name:result.data.name
            };
            console.log(JSON.stringify(result))
            alert(result.data.name)
        }, function(error) {

            alert("Error: " +JSON.stringify( error));

        });
    };




})