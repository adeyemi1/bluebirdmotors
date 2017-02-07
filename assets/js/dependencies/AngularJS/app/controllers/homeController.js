angular.module('home.controller', []).controller('homeController', ['$scope', '$http','$location', function($scope, $http,$location) {
    $scope.services;


    // Grab the locals 
    $scope.me = window.SAILS_LOCALS.me;

    $http({
            url: '/service',
            method: 'GET'

        })
        .then(function(result) {
            $scope.chunkServices = chunk(result.data.filter(function(service) {
                return !(service.name === 'Pre MOT' || service.name === 'car mechanic');
            }), 6);

        })
        .catch(function onError(sailsResponse) {

            // Otherwise, this is some weird unexpected server error. 
            // Or maybe your WIFI just went out.
            console.error('sailsResponse: ', sailsResponse);
        })
        .finally(function eitherWay() {

        });

    function chunk(arr, size) {
        var newArr = [];
        for (var i = 0; i < arr.length; i += size) {
            newArr.push(arr.slice(i, i + size));
        }
        return newArr;
    }

   $scope.isActive = function(viewLocation){ 
     let active = ('http://localhost:1337' +viewLocation === $location.absUrl());
     return active;
    }

}]);