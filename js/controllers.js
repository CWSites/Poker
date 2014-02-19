
/* Controllers */

var pokerApp = angular.module('pokerApp', []);

pokerApp.factory('playerStatus', function() {

    var playerInfo = {

        // TO-DO: Write logic for random seating and empty seats

        // moveButtonBlinds has already run
        // reseting variables for next hand
        // calling functions asyncronously
        resetTable: function($scope){
            $scope.placeBet = false;
            $scope.firstPlayerId = 0;
            $scope.lastPlayerId = 0;
            $scope.winner = {}
            $scope.livePlayers = [];

            // TEST: make sure this works if less than 2 players
            if($scope.players.length > 1){

                playerInfo.setLivePlayers($scope);
                playerInfo.setButtonBlinds($scope);
                playerInfo.findFirstLastPlayer($scope);
                playerInfo.gameTimer($scope);

            } else {

                // TEST: make sure this alert displays
                $scope.alert = "There aren't enough players. Invite your friends!"
            }
        },

        // create live players array
        setLivePlayers: function($scope){
            var root = $scope.livePlayers;
            $scope.livePlayers = $scope.livePlayers.concat($scope.players);

            console.log("setLivePlayers was called");
            console.log($scope.livePlayers.length + " players are live");

            // Remove anyone that doesn't have chips from the table
            for(i=0; $scope.players.length > i; i++){
                if($scope.players[i].chips == 0){
                    console.log("player #" + $scope.players[i].playerId + " has " + $scope.players[i].chips);
                    $scope.players.splice(i, 1);
                }
            }
        },

        // move button position & blinds for big/small
        // makes changes to players json
        moveButtonBlinds: function($scope){
            var root = $scope.players,
            buttonMoved = false,
            blindsMoved = false;

            for(i=0; root.length > i; i++){

                if(root[i].button == true && buttonMoved == false){
                    root[i].button = false;
                    root[i+1].button = true;
                    buttonMoved = true;
                }

                if (root[i].blind == "small" && blindsMoved == false){
                    root[i].blind = "";
                    root[i+1].blind = "small";
                    root[i+2].blind = "big";
                    blindsMoved = true;
                }
            }

            // start next hand once button and blinds have moved
            if(buttonMoved == true && blindsMoved == true){
                playerInfo.resetTable($scope);
            }
        },

        // set button position & blinds for big/small
        setButtonBlinds: function($scope){
            var root = $scope.livePlayers,
            smallBlind = $scope.table.smallBlind,
            bigBlind = smallBlind * 2;

            for(i=0; root.length > i; i++){
                // TO-DO:
                // - If player doesn't have enough then put all-in
                // - Create all-in function
                // - Write logic to check for dead button & dead small blind

                // save button position in table array
                if(root[i].button == true){
                    $scope.buttonId = i;
                }

                if (root[i].blind == "small"){
                    root[i].chips -= smallBlind;
                    root[i].bet = smallBlind;
                    root[i].currentBet = smallBlind;
                }

                if (root[i].blind == "big"){
                    root[i].chips -= bigBlind;
                    root[i].bet = bigBlind;
                    root[i].currentBet = bigBlind;
                }
            }

            $scope.table.currentBet = bigBlind;
        },

        // find first to act, or first live player after button
        findFirstLastPlayer: function($scope){
            var root = $scope.livePlayers,
            players = $scope.players,
            i = 0, p = 0;

            for(i=0; players.length > i; i++){

                // find first to act if preFlop
                if($scope.table.gameStatus == 0 && root[i].firstAct == true) {

                    $scope.firstPlayerId = root[i].playerId;
                    $scope.lastPlayerId = root[i - 1].playerId;

                    console.log("firstActID: " + root[i].playerId);
                    console.log("lastPlayer ID: " + $scope.lastPlayerId);

                    return;
                }

                // find first live player after button if after Flop
                if($scope.table.gameStatus > 0) {

                    // start with button position
                    // loop through table array
                    for(y=$scope.buttonId; players.length > y; y++){

                        // is the player in a position after the original button
                        if(root[y].fold == false){

                            $scope.firstPlayerId = root[y].playerId;
                            console.log("firstPlayerId: " + root[y].playerId);

                            return;
                        }
                    }

                    // start with first player position
                    // loop backwards through table array
                    for(x=$scope.firstPlayerId; players.length > x; x--){

                        // is the player in a position after the original button
                        if(root[x].fold == false){

                            $scope.lastPlayerId = root[x].playerId;
                            console.log("lastPlayerId: " + root[x].playerId);

                            return;
                        }
                    }

                    $scope.table.countdown = $scope.table.timer;

                    // once found, make a call to gameTimer to activate the next round
                    playerInfo.gameTimer($scope);
                }
            }
        },

        // game timer
        gameTimer: function($scope){
            var root = $scope.livePlayers,
            currentPosition = 0,
            roundFinished = false,
            roundTotal = 0;

            // find position in live player array for first player
            for(i=0; root.length > i; i++){
                if(root[i].playerId == $scope.firstPlayerId){
                    currentPosition = i;
                }
            }

            console.log("livePlayers");
            console.log($scope.livePlayers);

            var roundLive = setInterval(function() {

                // if player bets or raises then update table currentBet
                if(root[currentPosition].callBetRaise == true && root[currentPosition].currentBet > $scope.table.currentBet){
                    $scope.table.currentBet = root[currentPosition].currentBet;
                }

                // only 1 player left || when player timer is 0 || player folds || player calls, bets or raises
                if(root.length < 2 || $scope.table.countdown == 0 || root[currentPosition].callBetRaise == true || root[currentPosition].fold == true) {

                    console.log("------------");
                    console.log("currentPlayer ID: " + root[currentPosition].playerId);

                    if($scope.lastPlayerId == root[currentPosition].playerId && $scope.table.countdown == 0){

                        // if last player didn't act, they forfeit the hand, update live players
                        // has to be run here, else the game would immediately stop
                        if(root[currentPosition].currentBet < $scope.table.currentBet){
                            console.log("last player to act folds.");

                            root[currentPosition].fold = true;
                            $scope.livePlayers.splice(currentPosition, 1);
                        }

                        roundFinished = true;
                    }

                    // check to see if round has finished
                    // when current player is the one right before the first player
                    if(root.length < 2 || roundFinished == true){

                        console.log("Round Finished");
                        console.log("------------");

                        // add up bets
                        for(i=0; $scope.players.length > i; i++){
                            roundTotal += +$scope.players[i].currentBet;
                            $scope.players[i].currentBet = 0;
                            $scope.players[i].bet = 0;
                            $scope.$apply();
                        }

                        // update pot
                        $scope.table.pot = $scope.table.pot + roundTotal;
                        $scope.table.currentBet = 0;
                        roundTotal = 0;

                        // check to see if more than 1 player live
                        if(root.length > 1){

                            // update game status (preflop, flop, turn, river)
                            $scope.table.gameStatus += 1;
                            console.log("gameStatus: " + $scope.table.gameStatus);

                            // At end of round, call findFirstLastPlayer again
                            playerInfo.findFirstLastPlayer($scope);

                        // find the winner and do things
                        } else {

                            $scope.table.gameStatus = 4;

                            for(i=0; root.length > i; i++){
                                if(root[i].fold == false){
                                    $scope.livePlayers[i].winner = true;
                                    $scope.livePlayers[i].chips += $scope.table.pot;
                                    $scope.table.pot = 0;
                                    $scope.winner = root[i];

                                    // TEST: Make sure this displays properly
                                    $scope.alert = root[i].name + " wins this hand!";

                                    $scope.$apply();

                                    // if more than 1 player at table with chips
                                    // move button, blinds, reset everything and start new hand.
                                    // playerInfo.findFirstLastPlayer($scope);
                                }
                            }

                            // stop timer
                            clearInterval(roundLive);

                            // move button & blinds
                            playerInfo.moveButtonBlinds($scope);

                        }

                    } else {

                        // no longer player's turn
                        root[currentPosition].turn = false;

                        // if player didn't act, they forfeit the hand, update live players
                        if(root[currentPosition].currentBet < $scope.table.currentBet){
                            console.log("player " + root[currentPosition].playerId + " folds.");

                            root[currentPosition].fold = true;
                            $scope.livePlayers.splice(currentPosition, 1);

                            if(currentPosition == root.length){
                                currentPosition = 0;
                            } else {
                                currentPosition = currentPosition;
                            }

                        } else {

                            // if player still in hand (array) then advance to next array position
                            // if player had folded, then they are removed from array, thus position stays the same
                            // if at end of list then loop around
                            if(currentPosition == root.length){
                                currentPosition = 0;
                            } else {
                                currentPosition = currentPosition + 1;
                            }
                        }

                        // next player's turn
                        root[currentPosition].turn = true;

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
            'playerId': 132,
            'rank': 1,
            'name': 'Player Zero',
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
            'playerId': 7734,
            'rank': 2,
            'name': 'Player One',
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
            'playerId': 25,
            'rank': 3,
            'name': 'Player Two',
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
            'playerId': 17,
            'rank': 4,
            'name': 'Player Three',
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
            'playerId': 24,
            'rank': 5,
            'name': 'Player Four',
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
            'playerId': 60,
            'rank': 6,
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
            'playerId': 69,
            'rank': 7,
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
            'playerId': 101,
            'rank': 8,
            'name': 'Player Seven',
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
            'playerId': 941,
            'rank': 9,
            'name': 'Player Eight',
            'imageUrl': 'bootstrap/img/ichigo.jpg',
            'chips': 0,
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
            'playerId': 82,
            'rank': 10,
            'name': 'Player Nine',
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
    $scope.firstPlayerId = 0;
    $scope.lastPlayerId = 0;
    $scope.buttonId = 0;
    $scope.myId = 6;
    $scope.alert = "";
    $scope.winner = {}
    $scope.livePlayers = [];
    $scope.myBet = $scope.players[$scope.myId].bet;

    status.resetTable($scope);

}]);
