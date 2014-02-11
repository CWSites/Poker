
/* Controllers */

var pokerApp = angular.module('pokerApp', []);

pokerApp.factory('playerStatus', function() {

    var playerInfo = {

        // set initial blinds for big/small
        setBlinds: function($scope){
            var root = $scope.players,
            smallBlind = $scope.table.smallBlind,
            bigBlind = smallBlind * 2;

            for(i=0; root.length > i; i++){
                if (root[i].blind == "small"){
                    root[i].bet = smallBlind;
                    root[i].currentBet = smallBlind;
                } else if (root[i].blind == "big"){
                    root[i].bet = bigBlind;
                    root[i].currentBet = bigBlind;
                }
            }

            $scope.table.currentBet = bigBlind;
        },

        // find first to act, or first live player after button
        findFirstPlayer: function($scope){
            var root = $scope.players,
            livePlayers = root.length,
            firstPlayer = $scope.firstPlayer,
            i = 0, p = 0;

            for(i=0; livePlayers > i; i++){

                // find first to act
                if($scope.table.gameStatus == 0 && root[i].firstAct == true) {

                    console.log("firstAct: " + i);
                    $scope.firstPlayer = i;

                // find first live player after button
                } else if($scope.table.gameStatus > 0) {

                    for(p=0; livePlayers > p; p++){
                        if(root[p].fold == false){
                            console.log("firstPlayer: " + p);
                            $scope.firstPlayer = p;
                        }
                    }
                }
            }
        },

        // game timer
        gameTimer: function($scope){
            var root = $scope.players,
            livePlayers = root.length,
            currentPlayer = $scope.firstPlayer,
            roundTotal = 0;

            // game timer
            var roundLive = setInterval(function() {

                // check to see if round has finished
                if(($scope.firstPlayer - 1 == currentPlayer) && $scope.table.countdown == 0){

                    // update game status (preflop, flop, turn, river)
                    $scope.table.gameStatus += 1;

                    // stop timer
                    clearInterval(roundLive);

                    // add up bets
                    for(i=0; root.length > i; i++){
                        roundTotal += root[i].currentBet;
                        root[i].currentBet = 0;
                    }

                    // update pot
                    $scope.table.pot = $scope.table.pot + roundTotal;
                }

                console.log("countdown: " + $scope.table.countdown);

                // when player timer is 0
                if($scope.table.countdown == 0) {

                    console.log(root[currentPlayer]);

                    // no longer player's turn
                    root[currentPlayer].turn = false;

                    // if player didn't act, they forfeit the hand
                    if(root[currentPlayer].currentBet == 0 || root[currentPlayer].currentBet < $scope.table.currentBet){
                        root[currentPlayer].fold = true;
                        livePlayers--;
                    }

                    // if at the end of the list, loop around
                    if(currentPlayer == 9){
                        currentPlayer = 0;
                    } else {
                        currentPlayer = currentPlayer + 1;
                    }

                    // next player's turn
                    root[currentPlayer].turn = true;

                    // reset player timer
                    $scope.table.countdown = $scope.table.timer;

                    // used to update DOM on the fly.
                    $scope.$apply();
                }

                // countdown and update for player timer alert
                $scope.table.countdown--;
                $scope.$apply();

            }, 1000);

            return;
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

    $scope.orderProp = 'rank';
    $scope.table = {
        'pot': 0,
        'currentBet': 0,
        'timer': 3,
        'countdown': 3,
        'smallBlind': 25,
        'gameStatus': 0,
        'livePlayers': 0,
        'cards': [
            {
                'cardNum':'A',
                'cardSuit':'spade'
            },
            {
                'cardNum':'K',
                'cardSuit':'heart'
            },
            {
                'cardNum':'Q',
                'cardSuit':'diamond'
            },
            {
                'cardNum':'J',
                'cardSuit':'club'
            },
            {
                'cardNum':'10',
                'cardSuit':'heart'
            }
        ]
    }

    $scope.players = [
        {
            'id': 0,
            'rank': 1,
            'name': 'Player One',
            'imageUrl': 'bootstrap/img/ichigo.jpg',
            'chips': 1500,
            'button': true,
            'blind': '',
            'firstAct': false,
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
            'firstAct': false,
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
            'firstAct': false,
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
            'firstAct': true,
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
            'firstAct': false,
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
            'firstAct': false,
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
            'firstAct': false,
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
            'firstAct': false,
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
            'firstAct': false,
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
            'firstAct': false,
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

    $scope.firstPlayer = 0;
    $scope.myId = 4;
    $scope.myBet = $scope.players[$scope.myId].bet;
    $scope.table.livePlayers = $scope.players.length;

    status.setBlinds($scope);
    status.findFirstPlayer($scope);
    status.gameTimer($scope);

}]);
