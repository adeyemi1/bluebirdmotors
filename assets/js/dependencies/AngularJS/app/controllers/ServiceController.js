angular.module('service.controller', []).controller('serviceController', ['$scope', '$http', '$location', function($scope, $http, $location) {
    $scope.services;


    // Grab the locals 
    $scope.me = window.SAILS_LOCALS.me;

    $http({
            url: '/service',
            method: 'GET'

        })
        .then(function(result) {
            $scope.services = result.data;
        })
        .catch(function onError(sailsResponse) {

            // Otherwise, this is some weird unexpected server error. 
            // Or maybe your WIFI just went out.
            console.error('sailsResponse: ', sailsResponse);
        })
        .finally(function eitherWay() {

        });

}]);