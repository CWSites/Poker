
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

            // reset all players
            for(i=0; $scope.players.length > i; i++){
                $scope.players[i].fold = false;
            }

            // TEST: make sure this works if less than 2 players
            if($scope.players.length > 1){

                playerInfo.setLivePlayers($scope);
                playerInfo.setButtonBlinds($scope);
                playerInfo.findFirstLastPlayer($scope);

            } else {

                // TEST: make sure this alert displays
                $scope.alert = "There aren't enough players. Invite your friends!"
            }
        },

        // create live players array
        setLivePlayers: function($scope){

            // Remove anyone that doesn't have chips from the table
            for(i=0; $scope.players.length > i; i++){
                if($scope.players[i].chips == 0){
                    $scope.players.splice(i, 1);
                }
            }

            $scope.livePlayers = $scope.livePlayers.concat($scope.players);

            console.log("setLivePlayers was called");
            console.log($scope.livePlayers.length + " players are live");
            console.log($scope.livePlayers);
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
        // changes saved to players.json
        setButtonBlinds: function($scope){
            var root = $scope.players,
            smallBlind = $scope.table.smallBlind,
            bigBlind = smallBlind * 2;

            for(i=0; root.length > i; i++){
                // TO-DO:
                // - If player doesn't have enough then put all-in
                // - Create all-in function
                // - Write logic to check for dead button & dead small blind

                // save button position in table array
                if(root[i].button == true){
                    $scope.buttonPosition = i;
                    $scope.buttonId = root[i].playerId;
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
            i = 0, p = 0, x = 0, y = 0, z = 0;

            $scope.firstPlayerId = 0;
            $scope.lastPlayerId = 0;

            for(i=0; players.length > i; i++){

                // find first to act if preFlop
                if($scope.table.gameStatus == 0 && root[i].firstAct == true) {

                    $scope.firstPlayerId = root[i].playerId;
                    $scope.lastPlayerId = root[i - 1].playerId;

                    // set player's turn to true
                    $scope.livePlayers[i].turn = true;
                    $scope.$apply();

                    console.log("firstActID: " + root[i].playerId);
                    console.log("lastPlayer ID: " + $scope.lastPlayerId);

                    // once found, make a call to gameTimer to activate the round & exit
                    playerInfo.gameTimer($scope);
                    return;
                }

                // find first live player after button if after Flop
                if($scope.table.gameStatus > 0) {

                    // if the button didn't fold
                    if(players[$scope.buttonPosition].fold == false){

                        // loop through live players
                        // find button position in live players array
                        for(y = 0; root.length > y; y++){

                            if(root[y].playerId == $scope.buttonId){

                                // the button is the last to act
                                // player immediately after button is first to act
                                $scope.lastPlayerId = $scope.buttonId;
                                $scope.firstPlayerId = root[y+1].playerId;

                                // set player's turn to true
                                $scope.livePlayers[y+1].turn = true;
                                $scope.$apply();

                                // once found, make a call to gameTimer to activate the round & exit
                                playerInfo.gameTimer($scope);
                                return;
                            }

                        }

                    // if the button folded
                    } else {

                        // start with button position & loop through table array
                        for(x = 0; players.length > x; x++){

                            // at end of array, loop if not done
                            if((x + $scope.buttonPosition) < players.length){
                                z = x + $scope.buttonPosition;
                            } else if(z == 0){
                                z += z;
                            } else {
                                z = 0;
                            }

                            // first live player after original button position
                            if(players[z].fold == false && $scope.firstPlayerId == 0){

                                $scope.firstPlayerId = players[z].playerId;
                                console.log("firstPlayerId: " + players[z].playerId);
                                console.log(players[z].playerId);

                                // loop through live players & find first player in live players array
                                for(y = 0; root.length > y; y++){

                                    if(root[y].playerId == $scope.firstPlayerId){

                                        $scope.livePlayers[y].turn = true;

                                        // player immediately before first player is last to act
                                        $scope.lastPlayerId = root[y-1].playerId;
                                        console.log("lastPlayerId: " + root[y-1].playerId);
                                    }
                                }

                                // once found, reset the timer & make a call to gameTimer to activate the next round & exit
                                $scope.table.countdown = $scope.table.timer + 1;
                                playerInfo.gameTimer($scope);
                                return;
                            }
                        }

                    }
                }

            }
        },

        // game timer
        gameTimer: function($scope){
            var root = $scope.livePlayers,
            currentPosition = 0,
            roundFinished = false,
            roundTotal = 0;

            // reset player timer
            $scope.table.countdown = $scope.table.timer;

            console.log("gameTimer called");

            // reset player actionTaken
            // set current position to firstPlayerId
            for(i=0; root.length > i; i++){
                $scope.players[i].actionTaken = false;
                $scope.livePlayers[i].actionTaken = false;

                if(root[i].playerId == $scope.firstPlayerId){
                    currentPosition = i;
                }
            }

            console.log("------------");
            console.log("currentPlayer ID: " + root[currentPosition].playerId);

            var roundLive = setInterval(function() {

                if($scope.table.gameStatus == 4 || root.length < 2){

                    playerInfo.findWinner($scope);

                    // stop timer & exit
                    clearInterval(roundLive);
                    return;
                }

                console.log("timer: " + $scope.table.countdown);

                // if player bets or raises then update table currentBet
                if(root[currentPosition].actionTaken == true && root[currentPosition].currentBet > $scope.table.currentBet){
                    $scope.table.currentBet = root[currentPosition].currentBet;
                }

                // when player timer is 0 || player folds || player checks, calls, bets or raises
                if($scope.table.countdown == 0 || root[currentPosition].actionTaken == true || root[currentPosition].fold == true) {

                    // checks to see if lastPlayer has taken action
                    if($scope.lastPlayerId == root[currentPosition].playerId && $scope.table.countdown == 0){

                        console.log("last player took action");

                        // if last player didn't act, they forfeit the hand, update live players
                        // has to be run here, else the game would immediately stop
                        // if(root[currentPosition].actionTaken == false || root[currentPosition].currentBet < $scope.table.currentBet){
                        if(root[currentPosition].currentBet < $scope.table.currentBet){
                            console.log("last player to act folds.");

                            root[currentPosition].fold = true;
                            $scope.livePlayers.splice(currentPosition, 1);

                            // if player folds and no more than 1 player live
                            // clear timer and call findWinner
                            if($scope.livePlayers.length < 2){

                                playerInfo.findWinner($scope);

                                // stop timer & exit
                                clearInterval(roundLive);
                                return;
                            }
                        }

                        roundFinished = true;
                    }

                    // check to see if round has finished
                    // when current player is the one right before the first player
                    if(roundFinished == true){

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
                        if(root.length > 1 && $scope.table.gameStatus != 3){

                            // update game status (preflop, flop, turn, river)
                            $scope.table.gameStatus += 1;
                            console.log("gameStatus: " + $scope.table.gameStatus);

                            // no longer player's turn
                            root[currentPosition].turn = false;

                            // At end of round, call findFirstLastPlayer again
                            playerInfo.findFirstLastPlayer($scope);

                            // stop timer & exit
                            clearInterval(roundLive);
                            return;

                        // find the winner and do things
                        } else {

                            playerInfo.findWinner($scope);

                            // stop timer & exit
                            clearInterval(roundLive);
                            return;

                        }

                    // if round hasn't finished
                    } else {

                        // no longer player's turn
                        root[currentPosition].turn = false;

                        // if player's current bet is less than table bet || player hasn't taken action
                        // they forfeit the hand, update live players
                        // if(root[currentPosition].actionTaken == false || root[currentPosition].currentBet < $scope.table.currentBet){
                        if(root[currentPosition].currentBet < $scope.table.currentBet){
                            console.log("player " + root[currentPosition].playerId + " folds.");

                            root[currentPosition].fold = true;
                            $scope.livePlayers.splice(currentPosition, 1);

                            // if player folds and no more than 1 player live
                            // clear timer and call findWinner
                            if($scope.livePlayers.length < 2){

                                playerInfo.findWinner($scope);

                                // stop timer & exit
                                clearInterval(roundLive);
                                return;
                            }

                            if(currentPosition == root.length){
                                currentPosition = 0;
                            } else {
                                currentPosition = currentPosition;
                            }

                        // if player acted
                        } else {
                            console.log("player " + root[currentPosition].playerId + " check/bet/call/raised.");

                            // if player still in hand (array) then advance to next array position
                            // if player had folded, then they are removed from array, thus position stays the same
                            // if at end of list then loop around
                            if(currentPosition+1 == root.length){
                                currentPosition = 0;
                            } else {
                                currentPosition = currentPosition + 1;
                            }
                        }

                        // next player's turn
                        root[currentPosition].turn = true;

                        console.log("------------");
                        console.log("currentPlayer ID: " + root[currentPosition].playerId);

                        // reset player timer
                        $scope.table.countdown = $scope.table.timer + 1;

                        // used to update DOM on the fly.
                        $scope.$apply();
                    }
                }

                // countdown and update for player timer alert
                $scope.table.countdown--;
                $scope.$apply();

            }, 1000);

            return;
        },

        // when hand is finished and more than 1 player live, find the winner
        findWinner: function($scope){
            var root = $scope.livePlayers,
            roundTotal = 0;

            // reset player turn
            for(i=0; root.length > i; i++){
                $scope.players[i].turn = false;
                $scope.livePlayers[i].turn = false;
            }

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

            console.log("findWinner was called");

            if(root.length < 2){
                for(i=0; root.length > i; i++){
                    if(root[i].fold == false){
                        $scope.livePlayers[i].winner = true;
                        $scope.livePlayers[i].chips += $scope.table.pot;
                        $scope.table.pot = 0;
                        $scope.winner = root[i];
                        $scope.alert = root[i].name + " wins this hand!";
                        $scope.$apply();
                    }
                }
            } else {

                // determine winning hand

                $scope.livePlayers[0].winner = true;
                $scope.livePlayers[0].chips += $scope.table.pot;
                $scope.table.pot = 0;
                $scope.alert = root[i].name + " wins this hand!";
                $scope.$apply();
            }

            return;

            // move button & blinds
            // playerInfo.moveButtonBlinds($scope);
        }
    };

    return playerInfo;

});

pokerApp.controller('PlayerListCtrl', ['$scope','playerStatus', function($scope, status) {

    $scope.orderProp = 'rank';
    $scope.table = {
        'pot': 0,
        'currentBet': 0,
        'timer': 3,
        'countdown': 3,
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
            'name': 'Player X',
            'imageUrl': 'bootstrap/img/ichigo.jpg',
            'chips': 1500,
            'button': false,
            'blind': '',
            'firstAct': false,
            'fold': false,
            'actionTaken': false,
            'winner': false,
            'turn': false,
            'currentBet': 0,
            'bet': '',
            'hand': [
                {
                    'cardNum':'3',
                    'cardSuit':'heart'
                },
                {
                    'cardNum':'10',
                    'cardSuit':'diamond'
                }
            ]
        },
        {
            'playerId': 7734,
            'rank': 2,
            'name': 'Player One',
            'imageUrl': 'bootstrap/img/ichigo.jpg',
            'chips': 1000,
            'button': false,
            'blind': '',
            'firstAct': false,
            'fold': false,
            'actionTaken': false,
            'winner': false,
            'turn': false,
            'currentBet': 0,
            'bet': '',
            'hand': [
                {
                    'cardNum':'J',
                    'cardSuit':'diamond'
                },
                {
                    'cardNum':'10',
                    'cardSuit':'club'
                }
            ]
        },
        {
            'playerId': 25,
            'rank': 3,
            'name': 'Player Two',
            'imageUrl': 'bootstrap/img/ichigo.jpg',
            'chips': 1250,
            'button': true,
            'blind': '',
            'firstAct': false,
            'fold': false,
            'actionTaken': false,
            'winner': false,
            'turn': false,
            'currentBet': 0,
            'bet': '',
            'hand': [
                {
                    'cardNum':'A',
                    'cardSuit':'heart'
                },
                {
                    'cardNum':'K',
                    'cardSuit':'diamond'
                }
            ]
        },
        {
            'playerId': 17,
            'rank': 4,
            'name': 'Player Three',
            'imageUrl': 'bootstrap/img/ichigo.jpg',
            'chips': 1000,
            'button': false,
            'blind': 'small',
            'firstAct': false,
            'fold': false,
            'actionTaken': false,
            'winner': false,
            'turn': false,
            'currentBet': 0,
            'bet': '',
            'hand': [
                {
                    'cardNum':'2',
                    'cardSuit':'diamond'
                },
                {
                    'cardNum':'7',
                    'cardSuit':'club'
                }
            ]
        },
        {
            'playerId': 24,
            'rank': 5,
            'name': 'Player Four',
            'imageUrl': 'bootstrap/img/ichigo.jpg',
            'chips': 1000,
            'button': false,
            'blind': 'big',
            'firstAct': false,
            'fold': false,
            'actionTaken': false,
            'winner': false,
            'turn': false,
            'currentBet': 0,
            'bet': '',
            'hand': [
                {
                    'cardNum':'A',
                    'cardSuit':'diamond'
                },
                {
                    'cardNum':'A',
                    'cardSuit':'club'
                }
            ]
        },
        {
            'playerId': 60,
            'rank': 6,
            'name': 'Player Five',
            'imageUrl': 'bootstrap/img/ichigo.jpg',
            'chips': 1000,
            'button': false,
            'blind': '',
            'firstAct': true,
            'fold': false,
            'actionTaken': false,
            'winner': false,
            'turn': true,
            'currentBet': 0,
            'bet': '',
            'hand': [
                {
                    'cardNum':'5',
                    'cardSuit':'club'
                },
                {
                    'cardNum':'6',
                    'cardSuit':'club'
                }
            ]
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
            'actionTaken': false,
            'winner': false,
            'turn': false,
            'currentBet': 0,
            'bet': '',
            'hand': [
                {
                    'cardNum':'8',
                    'cardSuit':'diamond'
                },
                {
                    'cardNum':'9',
                    'cardSuit':'club'
                }
            ]
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
            'actionTaken': false,
            'winner': false,
            'turn': false,
            'currentBet': 0,
            'bet': '',
            'hand': [
                {
                    'cardNum':'2',
                    'cardSuit':'spade'
                },
                {
                    'cardNum':'2',
                    'cardSuit':'diamond'
                }
            ]
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
            'actionTaken': false,
            'winner': false,
            'turn': false,
            'currentBet': 0,
            'bet': '',
            'hand': [
                {
                    'cardNum':'8',
                    'cardSuit':'club'
                },
                {
                    'cardNum':'8',
                    'cardSuit':'spade'
                }
            ]
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
            'actionTaken': false,
            'winner': false,
            'turn': false,
            'currentBet': 0,
            'bet': '',
            'hand': [
                {
                    'cardNum':'J',
                    'cardSuit':'spade'
                },
                {
                    'cardNum':'J',
                    'cardSuit':'heart'
                }
            ]
        }
    ];

    $scope.placeBet = false;
    $scope.firstPlayerId = 0;
    $scope.lastPlayerId = 0;
    $scope.buttonPosition = 0;
    $scope.buttonId = 0;
    $scope.myPosition = 1;
    $scope.alert = "";
    $scope.winner = {}
    $scope.livePlayers = [];
    $scope.myBet = $scope.players[$scope.myPosition].bet;

    status.resetTable($scope);

}]);
