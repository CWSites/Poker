
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
                    root[i].chips -= smallBlind;
                    root[i].bet = smallBlind;
                    root[i].currentBet = smallBlind;
                } else if (root[i].blind == "big"){
                    root[i].chips -= bigBlind;
                    root[i].bet = bigBlind;
                    root[i].currentBet = bigBlind;
                }
            }

            $scope.table.currentBet = bigBlind;
        },

        // find first to act, or first live player after button
        findFirstPlayer: function($scope){
            var root = $scope.players,
            firstPlayer = $scope.firstPlayer,
            i = 0, p = 0;

            for(i=0; root.length > i; i++){

                // find first to act
                if($scope.table.gameStatus == 0 && root[i].firstAct == true) {

                    console.log("firstAct: " + i);
                    $scope.firstPlayer = i;

                // find first live player after button
                } else if($scope.table.gameStatus > 0) {

                    for(p=0; root.length > p; p++){
                        if(root[p].fold == false){
                            console.log("firstPlayer: " + p);
                            $scope.firstPlayer = p;

                            // call gameTimer again
                            playerInfo.gameTimer($scope);

                            return;
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

            console.log("gameTimer called");

            var roundLive = setInterval(function() {

                console.log("timer: " + $scope.table.countdown);

                // when player timer is 0, player folds, player calls, bets or raises
                if($scope.table.countdown == 0 || root[currentPlayer].callBetRaise == true || root[currentPlayer].fold == true) {

                    // check to see if round has finished
                    if($scope.firstPlayer - 1 == currentPlayer && $scope.table.countdown == 0){

                        // if button / big blind didn't act, they forfeit the hand, update live players
                        if(root[$scope.firstPlayer - 1].currentBet < $scope.table.currentBet){
                            console.log("button / bigBlind folds");
                            root[$scope.firstPlayer -1].fold = true;
                            livePlayers--;
                            $scope.table.livePlayers = livePlayers;
                        }

                        // add up bets
                        for(i=0; root.length > i; i++){
                            roundTotal += +root[i].currentBet;
                            root[i].currentBet = 0;
                            root[i].bet = 0;
                            $scope.$apply();
                        }

                        // update pot
                        $scope.table.pot = $scope.table.pot + roundTotal;
                        roundTotal = 0;

                        // check to see if more than 1 player live
                        if($scope.table.livePlayers > 1){

                            // update game status (preflop, flop, turn, river)
                            $scope.table.gameStatus += 1;

                            // At end of round, call findFirstPlayer again
                            playerInfo.findFirstPlayer($scope);

                        // find the winner and do things
                        } else {

                            $scope.table.gameStatus = 4;
                            for(i=0; root.length > i; i++){
                                if(root[i].fold == false){
                                    $scope.players[i].winner = true;
                                    $scope.players[i].chips += $scope.table.pot;
                                    $scope.table.pot = 0;

                                    console.log("winner!");
                                    console.log($scope.players[i]);

                                    // if more than 1 player at table with chips
                                    // call find blinds and start new hand
                                }
                            }

                            // stop timer
                            clearInterval(roundLive);
                        }

                    } else {

                        // no longer player's turn
                        root[currentPlayer].turn = false;

                        console.log("table bet: " + $scope.table.currentBet);
                        console.log("player current bet: " + root[currentPlayer].currentBet);

                        // if player didn't act, they forfeit the hand, update live players
                        if(root[currentPlayer].currentBet == 0 || root[currentPlayer].currentBet < $scope.table.currentBet){
                            console.log("player folds");
                            root[currentPlayer].fold = true;
                            livePlayers--;
                            $scope.table.livePlayers = livePlayers;
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

pokerApp.controller('PlayerListCtrl', ['$scope','playerStatus', function($scope, status) {

    $scope.orderProp = 'rank';
    $scope.table = {
        'pot': 0,
        'currentBet': 0,
        'timer': 2,
        'countdown': 2,
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
            'callBetRaise': false,
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
            'callBetRaise': false,
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
            'callBetRaise': false,
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
            'callBetRaise': false,
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
            'callBetRaise': false,
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
            'callBetRaise': false,
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
            'callBetRaise': false,
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
            'callBetRaise': false,
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
            'callBetRaise': false,
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
            'callBetRaise': false,
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

    $scope.placeBet = false;
    $scope.firstPlayer = 0;
    $scope.myId = 6;
    $scope.myBet = $scope.players[$scope.myId].bet;
    $scope.table.livePlayers = $scope.players.length;

    status.setBlinds($scope);
    status.findFirstPlayer($scope);
    status.gameTimer($scope);

}]);
