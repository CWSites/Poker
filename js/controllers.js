
/* Controllers */

var pokerApp = angular.module('pokerApp', []);

pokerApp.factory('playerStatus', function() {

    var gameInfo = {

        // TO-DO: Write logic for random seating and empty seats

        // move button position & blinds for big/small
        moveButtonBlinds: function($scope){
            var players = $scope.livePlayers,
            length = players.length,
            buttonMoved = false,
            blindsMoved = false,
            firstActMoved = false,
            buttonPosition = 0,
            smallPosition = 0,
            i = 0, x = 0;

            console.log("-- moveButtonBlinds was called --");

            for(; i<length; i++){

                if(players[i].button == true && buttonMoved == false){
                    x = 0;
                    players[i].button = false;

                    // loops to beginning of array if "i" is end of array
                    if(i+1 == length){
                        x = 0;
                    } else {
                        x = i+1;
                    }

                    players[x].button = true;
                    buttonMoved = true;
                    console.log("button moved");
                }

                if(players[i].blind == "small" && blindsMoved == false){
                    players[i].blind = "";

                    // loops to beginning of array if "i" is end of array
                    if(i+1 == length){
                        smallPosition = 0;
                    } else {
                        smallPosition = i+1;
                    }

                    players[smallPosition].blind = "small";
                    console.log("small blind moved");

                    // loops to beginning of array if "i" is end of array
                    if(i+2 == length){
                        bigPosition = 0;
                    } else if(i+2 > length){
                        bigPosition = 1;
                    } else {
                        bigPosition = i+2;
                    }

                    // make sure that big blind isn't dead
                    for(x=bigPosition; x<length; x++){
                        if(players[x].dead == false){
                            players[x].blind = "big";
                            blindsMoved = true;
                            console.log("big blind moved");
                        }
                    }
                }

                if(players[i].firstAct == true && firstActMoved == false){
                    x = 0;
                    players[i].firstAct = false;

                    // loops to beginning of array if "i" is end of array
                    if(i+1 == length){
                        x = 0;
                    } else {
                        x = i+1;
                    }

                    players[x].firstAct = true;
                    firstActMoved = true;
                    console.log("first to act moved");
                }
            }

            // start next hand once button and blinds have moved
            if(buttonMoved == true && blindsMoved == true && firstActMoved == true){
                gameInfo.resetTable($scope);
            }
        },

        // reseting variables for next hand
        // calling functions asyncronously
        resetTable: function($scope){
            $scope.placeBet = false;
            $scope.firstPlayerId = 0;
            $scope.lastPlayerId = 0;
            $scope.winner = {}
            $scope.livePlayers = [];

            console.log("-- resetTable was called --");

            // reset all players
            for(i=0; $scope.table.seats.length > i; i++){
                $scope.table.seats[i].fold = false;
                $scope.table.seats[i].turn = false;
                $scope.table.seats[i].winner = false;
                $scope.alert = '';
            }

            // TEST: make sure this works if less than 2 players
            if($scope.table.seats.length > 1){

                gameInfo.setLivePlayers($scope);
                gameInfo.setButtonBlinds($scope);
                gameInfo.findFirstLastPlayer($scope);

            } else {

                // TEST: make sure this alert displays
                // currently doesn't work, need a minimum of 2 players
                $scope.alert = "There aren't enough players. Invite your friends!"
            }
        },

        // create live players array
        setLivePlayers: function($scope){
            var seats = $scope.table.seats,
            players = $scope.livePlayers;

            console.log("-- setLivePlayers was called --");

            // Remove anyone that doesn't have chips from the table
            for(i=0; i < seats.length; i++){
                if(seats[i].chips == 0){
                    $scope.table.seats[i].dead = true;

                    // removes player and adds object with dead: true, keeps button and blind status
                    $scope.table.seats.splice(i, 1, {
                        "dead": true,
                        "button": seats[i].button,
                        "blind": seats[i].blind
                    });
                }
            }

            $scope.livePlayers = players.concat(seats);
            players = $scope.livePlayers;

            // Initially remove dead players from live players
            for(i=0; i < players.length; i++){
                if(players[i].dead == true){

                    // Remove the player from the array if they weren't a blind or a button
                    if(players[i].blind == '' && players[i].button == false){
                        $scope.livePlayers.splice(i, 1);
                    }
                }

                console.log("-- checking for dead seats --");
                console.log($scope.livePlayers.length + " players are live");
                console.log($scope.livePlayers);

            }

            console.log($scope.livePlayers.length + " players are live");
            console.log($scope.livePlayers);
        },

        // set button position & blinds for big/small
        // changes saved to players.json
        setButtonBlinds: function($scope){
            var players = $scope.livePlayers,
            smallBlind = $scope.table.smallBlind,
            bigBlind = smallBlind * 2;

            console.log("-- setButtonBlinds was called --");

            for(i=0; i < players.length; i++){
                // TO-DO:
                // - If player doesn't have enough then put all-in
                // - Create all-in function
                // - Write logic to check for dead button & dead small blind

                // save button position in table array
                if(players[i].button == true){
                    $scope.buttonPosition = i;
                    $scope.buttonId = players[i].playerId;
                }

                if (players[i].blind == "small"){
                    $scope.livePlayers[i].chips -= smallBlind;
                    $scope.livePlayers[i].bet = smallBlind;
                    $scope.livePlayers[i].currentBet = smallBlind;
                }

                if (players[i].blind == "big"){
                    $scope.livePlayers[i].chips -= bigBlind;
                    $scope.livePlayers[i].bet = bigBlind;
                    $scope.livePlayers[i].currentBet = bigBlind;
                }
            }

            $scope.table.currentBet = bigBlind;
        },

        // find first to act, or first live player after button
        findFirstLastPlayer: function($scope){
            var players = $scope.livePlayers,
            lastPosition = 0,
            buttonPosition = $scope.buttonPosition,
            x = 0;

            $scope.firstPlayerId = 0;
            $scope.lastPlayerId = 0;

            console.log("-- findFirstLastPlayer was called --");

            // find first to act
            if($scope.table.gameStatus == 0){

                // loop through players to find first to act preflop
                for(i=0; i < players.length; i++){

                    // find first to act if preFlop
                    if(players[i].firstAct == true) {

                        $scope.firstPlayerId = players[i].playerId;
                        $scope.livePlayers[i].turn = true;
                        $scope.$apply();

                        console.log("firstActID: " + players[i].playerId);
                    }
                }

            } else {

                // AFTER FLOP THIS CAN BE USED TO FIND FIRST PLAYER
                // start at button position and find first live player
                if(buttonPosition+1 == players.length){
                    x = 0;
                } else {
                    x = buttonPosition+1;
                }

                $scope.firstAct = true;
                $scope.firstPlayerId == players[x].playerId;

            }

            // USED TO FIND LAST POSITION REGUARDLESS OF PRE/POST FLOP
            // if button not dead and didn't fold, then set as last position
            if(players[buttonPosition].dead == false && players[buttonPosition].fold == false){
                $scope.lastPlayerId == players[buttonPosition].playerId;

            // if button dead or folded, then -1 and set to last position
            } else {

                if(buttonPosition == 0){
                    x = players.length-1;
                } else {
                    x = buttonPosition-1;
                }

                $scope.lastPlayerId == players[x].playerId;
                console.log("lastPlayer ID: " + $scope.lastPlayerId);
            }


            // once found, reset the timer & make a call to gameTimer to activate the next round & exit
            $scope.table.countdown = $scope.table.timer + 1;
            // once found, make a call to gameTimer to activate the round & exit
            gameInfo.gameTimer($scope);
            return;
        },

        // game timer
        gameTimer: function($scope){
            var players = $scope.livePlayers,
            length = players.length,
            currentPosition = 0,
            roundFinished = false,
            roundTotal = 0,
            i = 0;

            // reset player timer
            $scope.table.countdown = $scope.table.timer;

            console.log("-- gameTimer called --");

            // reset player actionTaken
            // set current position to firstPlayerId
            for(i=0; i < $scope.livePlayers.length; i++){

                // Remove the player from the array if they aren't the button
                if(players[i].dead == true && players[i].button == false){
                    $scope.livePlayers.splice(i, 1);
                }

                $scope.livePlayers[i].actionTaken = false;

                if(players[i].playerId == $scope.firstPlayerId){
                    currentPosition = i;
                }
            }

            console.log("------------");
            console.log("currentPlayer ID: " + players[currentPosition].playerId);

            var roundLive = setInterval(function() {

                // if hand finished or less than 2 players live
                if($scope.table.gameStatus == 4 || $scope.livePlayers.length < 2){

                    gameInfo.findWinner($scope);

                    // stop timer & exit
                    clearInterval(roundLive);
                    return;
                }

                console.log("timer: " + $scope.table.countdown);

                // if player bets or raises then update table currentBet
                if(players[currentPosition].actionTaken == true && players[currentPosition].currentBet > $scope.table.currentBet){
                    $scope.table.currentBet = players[currentPosition].currentBet;
                }

                // when player timer is 0 || player folds || player is dead || player checks, calls, bets or raises
                if($scope.table.countdown == 0 || players[currentPosition].dead == true || players[currentPosition].actionTaken == true || players[currentPosition].fold == true) {

                    // checks to see if lastPlayer has taken action
                    if($scope.lastPlayerId == players[currentPosition].playerId && $scope.table.countdown == 0){

                        console.log("last player took action");

                        // if last player didn't act, they forfeit the hand, update live players
                        // has to be run here, else the game would immediately stop
                        // if(players[currentPosition].actionTaken == false || players[currentPosition].currentBet < $scope.table.currentBet){
                        if(players[currentPosition].currentBet < $scope.table.currentBet){
                            console.log("last player to act folds.");

                            players[currentPosition].fold = true;
                            $scope.livePlayers.splice(currentPosition, 1);

                            // if player folds and no more than 1 player live
                            // clear timer and call findWinner
                            if($scope.livePlayers.length < 2){

                                gameInfo.findWinner($scope);

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
                        for(i=0; $scope.table.seats.length > i; i++){
                            roundTotal += +$scope.table.seats[i].currentBet;
                            $scope.table.seats[i].currentBet = 0;
                            $scope.table.seats[i].bet = 0;
                            $scope.$apply();
                        }

                        // update pot
                        $scope.table.pot = $scope.table.pot + roundTotal;
                        $scope.table.currentBet = 0;
                        roundTotal = 0;

                        // check to see if more than 1 player live
                        if($scope.livePlayers.length > 1 && $scope.table.gameStatus != 3){

                            // update game status (preflop, flop, turn, river)
                            $scope.table.gameStatus += 1;
                            console.log("gameStatus: " + $scope.table.gameStatus);

                            // no longer player's turn
                            players[currentPosition].turn = false;

                            // At end of round, call findFirstLastPlayer again
                            gameInfo.findFirstLastPlayer($scope);

                            // stop timer & exit
                            clearInterval(roundLive);
                            return;

                        // find the winner and do things
                        } else {

                            gameInfo.findWinner($scope);

                            // stop timer & exit
                            clearInterval(roundLive);
                            return;

                        }

                    // if round hasn't finished
                    } else {

                        // no longer player's turn
                        players[currentPosition].turn = false;

                        // if player's current bet is less than table bet || player hasn't taken action
                        // they forfeit the hand, update live players
                        // if(players[currentPosition].actionTaken == false || players[currentPosition].currentBet < $scope.table.currentBet){

                        // TO-DO: Add logic to check if player all-in
                        if(players[currentPosition].currentBet < $scope.table.currentBet){
                            console.log("player " + players[currentPosition].playerId + " folds.");

                            players[currentPosition].fold = true;
                            $scope.livePlayers.splice(currentPosition, 1);

                            // if player folds and no more than 1 player live
                            // clear timer and call findWinner
                            if($scope.livePlayers.length < 2){

                                gameInfo.findWinner($scope);

                                // stop timer & exit
                                clearInterval(roundLive);
                                return;
                            }

                            // if at the end of the array, then loop
                            if(currentPosition+1 == $scope.livePlayers.length){
                                currentPosition = 0;
                            } else {
                                currentPosition = currentPosition;
                            }

                        // if player acted
                        } else {
                            console.log("player " + players[currentPosition].playerId + " check/bet/call/raised.");

                            // if player still in hand (array) then advance to next array position
                            // if player had folded, then they are removed from array, thus position stays the same
                            // if at end of list then loop around

                            if(currentPosition+1 == $scope.livePlayers.length){
                                currentPosition = 0;
                            } else {
                                currentPosition = currentPosition + 1;
                            }
                        }

                        // next player's turn, check to see if next player is dead
                        if(players[currentPosition].dead == false){
                            players[currentPosition].turn = true;
                        } else {
                            console.log("this player is dead!!");
                        }

                        console.log("------------");
                        console.log("currentPlayer ID: " + players[currentPosition].playerId);

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

            console.log("-- findWinner was called --");

            // reset player turn
            for(i=0; root.length > i; i++){
                $scope.table.seats[i].turn = false;
                $scope.livePlayers[i].turn = false;
            }

            // add up bets
            for(i=0; $scope.table.seats.length > i; i++){
                roundTotal += +$scope.table.seats[i].currentBet;
                $scope.table.seats[i].currentBet = 0;
                $scope.table.seats[i].bet = 0;
                $scope.$apply();
            }

            // update pot
            $scope.table.pot = $scope.table.pot + roundTotal;
            $scope.table.currentBet = 0;
            roundTotal = 0;

            if(root.length < 2){
                for(i=0; root.length > i; i++){
                    if(root[i].fold == false){
                        $scope.livePlayers[i].winner = true;
                        $scope.livePlayers[i].chips += $scope.table.pot;
                        $scope.table.pot = 0;
                        $scope.winner = root[i];
                        $scope.alert = root[i].name + " wins this hand! 3 seconds until the next hand.";
                        $scope.$apply();
                    }
                }
            } else {

                // determine winning hand
                // right now is defaulted so I win each hand.
                $scope.livePlayers[0].winner = true;
                $scope.livePlayers[0].chips += $scope.table.pot;
                $scope.table.gameStatus = 4;

                $scope.table.pot = 0;
                $scope.alert = root[0].name + " wins this hand! 3 seconds until the next hand.";
                $scope.$apply();
            }

            setTimeout(function(){

                // reset game status
                $scope.table.gameStatus = 0;

                // move button & blinds
                gameInfo.moveButtonBlinds($scope);
                return;

            }, 3000);
        }
    };

    return gameInfo;

});

pokerApp.controller('PlayerListCtrl', ['$scope','playerStatus', function($scope, status) {

    $scope.orderProp = 'rank';
    $scope.table = {
        'pot': 0,
        'currentBet': 0,
        'timer': 5,
        'countdown': 5,
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
        ],
        'seats': [
            {
                'dead': false,
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
                'dead': false,
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
                'dead': false,
                'playerId': 7734,
                'rank': 2,
                'name': 'Player Two',
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
                'dead': false,
                'playerId': 17,
                'rank': 4,
                'name': 'Player Three',
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
                'dead': false,
                'playerId': 24,
                'rank': 5,
                'name': 'Player Four',
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
                'dead': false,
                'playerId': 60,
                'rank': 6,
                'name': 'Player Five',
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
                'dead': false,
                'playerId': 69,
                'rank': 7,
                'name': 'Player Six',
                'imageUrl': 'bootstrap/img/ichigo.jpg',
                'chips': 1000,
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
                'dead': false,
                'playerId': 101,
                'rank': 8,
                'name': 'Player Seven',
                'imageUrl': 'bootstrap/img/ichigo.jpg',
                'chips': 900,
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
                        'cardSuit':'spade'
                    },
                    {
                        'cardNum':'2',
                        'cardSuit':'diamond'
                    }
                ]
            },
            {
                'dead': false,
                'playerId': 941,
                'rank': 9,
                'name': 'Player Eight',
                'imageUrl': 'bootstrap/img/ichigo.jpg',
                'chips': 200,
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
                'dead': false,
                'playerId': 82,
                'rank': 10,
                'name': 'Player Nine',
                'imageUrl': 'bootstrap/img/ichigo.jpg',
                'chips': 800,
                'button': false,
                'blind': '',
                'firstAct': true,
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
        ]
    }

    $scope.placeBet = false;
    $scope.firstPlayerId = 0;
    $scope.lastPlayerId = 0;
    $scope.buttonPosition = 0;
    $scope.buttonId = 0;
    $scope.myPosition = 1;
    $scope.alert = "";
    $scope.winner = {}
    $scope.livePlayers = [];
    $scope.myBet = $scope.table.seats[$scope.myPosition].bet;

    status.resetTable($scope);

}]);
