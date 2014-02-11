/* Controllers */

var pokerApp = angular.module('pokerApp', []);

pokerApp.factory('playerStatus', function() {

    var playerInfo = {

        // set initial blinds for big/small
        setBlinds: function($scope){
            var root = $scope.players,
            smallBlind = 25,
            bigBlind = 50;

            for(i=0; root.length > i; i++){
                if (root[i].blind == "small"){
                    root[i].bet = smallBlind;
                    root[i].currentBet = smallBlind;
                } else if (root[i].blind == "big"){
                    root[i].bet = bigBlind;
                    root[i].currentBet = bigBlind;
                }
            }
        },

        // find first to act, begin countdown timer
        currentPlayer: function($scope){
            var root = $scope.players,
            playerId = 0,
            firstToAct = 0,
            timer = 10;

            // find first to act
            for(i=0; root.length > i; i++){
                if(root[i].turn == true){
                    playerId = i;
                    firstToAct = i;
                }
            }

            for(i=0; root.length > i; i++){

                var timerId = setInterval(function() {
                    timer--;

                    if(timer == 0) {
                        root[playerId].turn = false;

                        // if at the end of the list, loop around
                        if(playerId == 9){
                            playerId = 0;
                        } else {
                            playerId = playerId + 1;
                        }

                        root[playerId].turn = true;

                        // used to update DOM on the fly.
                        $scope.$apply();

                        timer = 10;
                    }

                }, 1000);

                return;
            }
        }
    };

    return playerInfo;

});

// pokerApp.controller('PlayerListCtrl', function($scope, $http) {
//     $http.get('../players/players.json').success(function(data) {
//         $scope.players = data;
//     });
// });

pokerApp.controller('PlayerListCtrl', ['$scope','playerStatus', function($scope, status) {

    $scope.players = [
        {
            'id': 0,
            'rank': 1,
            'name': 'Player One',
            'imageUrl': 'bootstrap/img/ichigo.jpg',
            'chips': 1500,
            'button': true,
            'blind': '',
            'fold': false,
            'winner': false,
            'turn': false,
            'currentBet': 0,
            'hand': [
                {
                    'cardNum':'3',
                    'cardSuit':'heart'
                },
                {
                    'cardNum':'10',
                    'cardSuit':'diamond'
                }
            ],
            'bet': ''
        },
        {
            'id': 1,
            'rank': 2,
            'name': 'Player Two',
            'imageUrl': 'bootstrap/img/ichigo.jpg',
            'chips': 1000,
            'button': false,
            'blind': 'small',
            'fold': false,
            'winner': false,
            'turn': false,
            'currentBet': 0,
            'hand': [
                {
                    'cardNum':'J',
                    'cardSuit':'diamond'
                },
                {
                    'cardNum':'10C',
                    'cardSuit':'club'
                }
            ],
            'bet': ''
        },
        {
            'id': 2,
            'rank': 3,
            'name': 'Player Three',
            'imageUrl': 'bootstrap/img/ichigo.jpg',
            'chips': 1250,
            'button': false,
            'blind': 'big',
            'fold': false,
            'winner': false,
            'turn': false,
            'currentBet': 0,
            'hand': [
                {
                    'cardNum':'A',
                    'cardSuit':'heart'
                },
                {
                    'cardNum':'K',
                    'cardSuit':'diamond'
                }
            ],
            'bet': ''
        },
        {
            'id': 3,
            'rank': 4,
            'name': 'Player Four',
            'imageUrl': 'bootstrap/img/ichigo.jpg',
            'chips': 1000,
            'button': false,
            'blind': '',
            'fold': false,
            'winner': false,
            'turn': true,
            'currentBet': 0,
            'hand': [
                {
                    'cardNum':'2',
                    'cardSuit':'diamond'
                },
                {
                    'cardNum':'7',
                    'cardSuit':'club'
                }
            ],
            'bet': ''
        },
        {
            'id': 4,
            'rank': 5,
            'name': 'Player Five',
            'imageUrl': 'bootstrap/img/ichigo.jpg',
            'chips': 1000,
            'button': false,
            'blind': '',
            'fold': false,
            'winner': false,
            'turn': false,
            'currentBet': 0,
            'hand': [
                {
                    'cardNum':'A',
                    'cardSuit':'diamond'
                },
                {
                    'cardNum':'A',
                    'cardSuit':'club'
                }
            ],
            'bet': ''
        },
        {
            'id': 5,
            'rank': 6,
            'name': 'Player Six',
            'imageUrl': 'bootstrap/img/ichigo.jpg',
            'chips': 1000,
            'button': false,
            'blind': '',
            'fold': false,
            'winner': false,
            'turn': false,
            'currentBet': 0,
            'hand': [
                {
                    'cardNum':'5',
                    'cardSuit':'club'
                },
                {
                    'cardNum':'6',
                    'cardSuit':'club'
                }
            ],
            'bet': ''
        },
        {
            'id': 6,
            'rank': 7,
            'name': 'Player Seven',
            'imageUrl': 'bootstrap/img/ichigo.jpg',
            'chips': 1000,
            'button': false,
            'blind': '',
            'fold': false,
            'winner': false,
            'turn': false,
            'currentBet': 0,
            'hand': [
                {
                    'cardNum':'8',
                    'cardSuit':'diamond'
                },
                {
                    'cardNum':'9',
                    'cardSuit':'club'
                }
            ],
            'bet': ''
        },
        {
            'id': 7,
            'rank': 8,
            'name': 'Player Eight',
            'imageUrl': 'bootstrap/img/ichigo.jpg',
            'chips': 900,
            'button': false,
            'blind': '',
            'fold': false,
            'winner': false,
            'turn': false,
            'currentBet': 0,
            'hand': [
                {
                    'cardNum':'2',
                    'cardSuit':'spade'
                },
                {
                    'cardNum':'2',
                    'cardSuit':'diamond'
                }
            ],
            'bet': ''
        },
        {
            'id': 8,
            'rank': 9,
            'name': 'Player Nine',
            'imageUrl': 'bootstrap/img/ichigo.jpg',
            'chips': 1000,
            'button': false,
            'blind': '',
            'fold': false,
            'winner': false,
            'turn': false,
            'currentBet': 0,
            'hand': [
                {
                    'cardNum':'8',
                    'cardSuit':'club'
                },
                {
                    'cardNum':'8',
                    'cardSuit':'spade'
                }
            ],
            'bet': ''
        },
        {
            'id': 9,
            'rank': 10,
            'name': 'Player Ten',
            'imageUrl': 'bootstrap/img/ichigo.jpg',
            'chips': 800,
            'button': false,
            'blind': '',
            'fold': false,
            'winner': false,
            'turn': false,
            'currentBet': 0,
            'hand': [
                {
                    'cardNum':'J',
                    'cardSuit':'spade'
                },
                {
                    'cardNum':'J',
                    'cardSuit':'heart'
                }
            ],
            'bet': ''
        }
    ];

    status.setBlinds($scope);
    // status.currentPlayer($scope);

    $scope.orderProp = 'rank';
    $scope.myId = 4;
    $scope.myBet = $scope.players[$scope.myId].bet;
    $scope.pot = 0;
    $scope.cards = {

    }

}]);
