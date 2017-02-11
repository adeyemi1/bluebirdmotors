angular.module('contact.controller', []).controller('contactController', ['$scope', '$http', '$location', function($scope, $http, $location) {
    $scope.services;


    // Grab the locals 
    $scope.me = window.SAILS_LOCALS.me;
    $scope.contact = {};

    getSubjects();

    function getSubjects() {

        $http({
                url: '/subject',
                method: 'GET'
            })
            .then(function(result) {
                $scope.subjects = result.data;
            })
            .catch(function onError(sailsResponse) {
                // Otherwise, this is some weird unexpected server error. 
                // Or maybe your WIFI just went out.
                console.error('sailsResponse: ', sailsResponse);
            })
            .finally(function eitherWay() {});
    }

    $scope.sendMessage = function(contactForm) {
        let message = angular.copy(contactForm);
        $scope.contact = {};
        message.subject = parseInt(message.subject);

        $http({
                url: '/contact/saveMessage',
                method: 'POST',
                data: message

            })
            .then(function(result) {
                $scope.id = result.data;
            })
            .catch(function onError(sailsResponse) {
                // Otherwise, this is some weird unexpected server error. 
                // Or maybe your WIFI just went out.
                console.error('sailsResponse: ', sailsResponse);
            })
            .finally(function eitherWay() {});
    }

}]);