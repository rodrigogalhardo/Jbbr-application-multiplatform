﻿/// <reference path="../angular.js" />
/// <reference path="../angular-resource.js" />

// Ensure calls to console.log don't break IE
if (typeof console === "undefined" || typeof console.log === "undefined") {
    console = {};
    console.log = function () { };
}

var app = angular.module('jabbrApp', [
    'ngRoute',
    'ngResource',
    'ngSanitize'
])
.config(function ($routeProvider) {
    $routeProvider.when('/rooms/lobby', {
        templateUrl: 'areas/rooms/lobby.html',
        title: 'Lobby',
        controller: 'LobbyController'
    });
})
.controller('LobbyController', ['$scope', '$sanitize', '$window', function ($scope, $sanitize, $window) {
    var connection = $window.jQuery.connection;
    var chat = connection.chat;
    var ui = $window.chat.ui;
    var $ui = $(ui);

    $scope.title = 'Lobby';
    $scope.rooms = [];
    $scope.roomSearchText = '';
    $scope.showClosedRooms = false;
    $scope.pageSize = 100;
    $scope.pagesShown = 1;

    $scope.itemsLimit = function () {
        return $scope.pageSize * $scope.pagesShown;
    };

    $scope.showMoreItems = function () {
        $scope.pagesShown++;
    }

    $scope.joinRoom = function (event, room) {
        console.log('Joining room: ' + room.Name);
        $ui.trigger(ui.events.openRoom, [room.Name]);
    };

    connection.hub.stateChanged(function (change) {
        console.log(change.newState);
        if (change.newState === connection.connectionState.connected) {
            console.log('Connected')
            chat.server.getRooms()
                .done(function (rooms) {
                    console.log('getRooms');
                    console.log(rooms.length);
                    angular.forEach(rooms, function (value, key) {
                        console.log(value);
                        value.getUserCount = function () {
                            if (this.Count === 0)
                                return $window.chat.utility.getLanguageResource('Client_OccupantsZero');
                            else
                                return (this.Count === 1 ? $window.chat.utility.getLanguageResource('Client_OccupantsOne') : this.Count + ' ' + $window.chat.utility.getLanguageResource('Client_OccupantsMany'));
                        }
                        $scope.rooms.push(value);
                        $scope.$apply();
                    });
                })
                .fail(function (e) {
                    console.log('getRooms failed: ' + e);
                });
        }
    });
}])
.controller('LobbyPublicRoomsController', ['$scope', '$window', '$filter', function($scope, $window, $filter) {
    $scope.isPrivate = false;
    $scope.title = $window.chat.utility.getLanguageResource('Client_OtherRooms');
    $scope.loadMoreTitle = $window.chat.utility.getLanguageResource('Client_LoadMore');
    $scope.hasMoreItems = function () {
        return $scope.pagesShown < ($scope.rooms.length / $scope.pageSize);
    };
}])
.controller('LobbyPrivateRoomsController', ['$scope', '$window', '$filter', function ($scope, $window, $filter) {
    $scope.isPrivate = true;
    $scope.title = $window.chat.utility.getLanguageResource('Client_Rooms');
    $scope.itemsLimit = function () {
        return $scope.rooms.length;
    };
}])
.directive('jabbrLobby', function () {
    return {
        restrict: 'A',
        templateUrl: 'Scripts/app/areas/rooms/lobby.html'
    };
})
.directive('jabbrLobbyRooms', function () {
    return {
        restrict: 'A',
        templateUrl: 'Scripts/app/areas/rooms/lobby-rooms.html',
    }
});