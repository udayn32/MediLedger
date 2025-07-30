var app = angular.module('farmToPlateApp', ['ngRoute']);

app.config(function($routeProvider) {
    $routeProvider
        .when('/home', {
            templateUrl: 'home.html',
            controller: 'HomeController'
        })
        .when('/vision', {
            templateUrl: 'vision.html',
            controller: 'VisionController'
        })
        .when('/about', {
            templateUrl: 'about.html',
            controller: 'AboutController'
        })
        .when('/team', {
            templateUrl: 'team.html',
            controller: 'TeamController'
        })
        .when('/farmer-login', {
            templateUrl: 'farmer-login.html',
            controller: 'FarmerLoginController'
        })
        .otherwise({
            redirectTo: '/home'
        });
});

app.controller('MainController', function($scope) {
    $scope.translations = {
        en: {
            home: "Home",
            vision: "Our Vision",
            about: "About Us",
            team: "Meet the Team",
            login: "Login",
            farmer: "Farmer",
            manufacturer: "Manufacturer",
            inspector: "Inspector",
            customer: "Customer"
        },
        hi: {
            home: "घर",
            vision: "हमारा उद्देश्य",
            about: "हमारे बारे में",
            team: "टीम से मिलें",
            login: "लॉग इन करें",
            farmer: "किसान",
            manufacturer: "निर्माता",
            inspector: "निरीक्षक",
            customer: "ग्राहक"
        },
        mr: {
            home: "घर",
            vision: "आपले ध्येय",
            about: "आमच्याविषयी",
            team: "टीम ओळखा",
            login: "लॉगिन",
            farmer: "शेतकरी",
            manufacturer: "उत्पादक",
            inspector: "निरीक्षक",
            customer: "ग्राहक"
        }
    };

    $scope.selectedLanguage = 'en';
    $scope.changeLanguage = function(lang) {
        $scope.translations = $scope.translations[lang];
    };

    $scope.translations = $scope.translations[$scope.selectedLanguage];
});
