
/* Controllers */

var pokerApp = angular.module('pokerApp', []);

pokerApp.factory('playerStatus', function() {

    var gameInfo = {

        // TO-DO: Write logic for random seating and empty seats

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
                gameInfo.moveButtonBlinds($scope);
                gameInfo.setButtonBlinds($scope);
                gameInfo.findFirstLastPlayer($scope);

            } else {

                // TEST: make sure this alert displays
                // currently doesn't work, need a minimum of 2 players
                $scope.alert = "There aren't enough players. Invite your friends!"
            }
        },

        // move button position & blinds for big/small
        moveButtonBlinds: function($scope){
            var players = $scope.livePlayers,
            length = players.length,
            buttonMoved = false,
            blindsMoved = false,
            firstActMoved = false,
            buttonPosition = 0,
            smallPosition = 0,
            bigPosition = 0,
            i = 0, x = 0;

            console.log("-- moveButtonBlinds was called --");

            // TO-DO: Change to WHILE loop and stop loop once all three are found
            while(i<length){

                if(players[i].button == true && buttonMoved == false){
                    x = 0;
                    $scope.livePlayers[i].button = false;

                    // loops to beginning of array if "i" is end of array
                    if(i+1 == length){
                        x = 0;
                    } else {
                        x = i+1;
                    }

                    $scope.livePlayers[x].button = true;
                    buttonMoved = true;
                    console.log("button moved");
                }

                if(players[i].blind == "small" && blindsMoved == false){
                    $scope.livePlayers[i].blind = "";

                    // loops to beginning of array if "i" is end of array
                    if(i+1 == length){
                        smallPosition = 0;
                    } else {
                        smallPosition = i+1;
                    }

                    $scope.livePlayers[smallPosition].blind = "small";
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
                    while(bigPosition < length && blindsMoved == false){
                        if(players[bigPosition].dead == false){
                            $scope.livePlayers[bigPosition].blind = "big";
                            blindsMoved = true;
                            console.log("big blind moved");
                        }
                    }
                }

                if(players[i].firstAct == true && firstActMoved == false){
                    x = 0;
                    $scope.livePlayers[i].firstAct = false;

                    // loops to beginning of array if "i" is end of array
                    if(i+1 == length){
                        x = 0;
                    } else {
                        x = i+1;
                    }

                    $scope.livePlayers[x].firstAct = true;
                    firstActMoved = true;
                    console.log("first to act moved");
                }

                // increment while loop
                i++;
            }

            // start next hand once button and blinds have moved
            if(buttonMoved == true && blindsMoved == true && firstActMoved == true){
                return;
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
            seats = $scope.table.seats,
            lastPosition = 0,
            buttonPosition = $scope.buttonPosition,
            x = 0, i = 0;

            $scope.firstPlayerId = 0;
            $scope.lastPlayerId = 0;

            console.log("-- findFirstLastPlayer was called --");

            // PRE FLOP ------
            if($scope.table.gameStatus == 0){

                // loop through players to find first to act preflop
                for(i=0; i < players.length; i++){

                    // find first to act if preFlop
                    if(players[i].firstAct == true) {

                        $scope.firstPlayerId = players[i].playerId;
                        $scope.livePlayers[i].turn = true;

                        console.log("firstActID: " + $scope.firstPlayerId);
                    }

                    // find last to act if preFlop
                    if(players[i].blind == 'big') {

                        $scope.lastPlayerId = players[i].playerId;

                        console.log("lastPlayerId: " + $scope.lastPlayerId);
                    }
                }

            // POST FLOP ------
            } else {

                i=0;

                // loop through and find the button
                while(i < seats.length && $scope.firstPlayerId == 0 && $scope.lastPlayerId == 0){

                    // BUTTON FOUND
                    if(seats[i].playerId == $scope.buttonId){
                        x = 0;

                        // loop if at end of array
                        if(i+1 == seats.length){
                            x = 0;
                        } else {
                            x = i+1;
                        }

                        // start at button position and find first live player
                        while (x <= seats.length && $scope.firstPlayerId == 0){

                            if(seats[x].dead == false && seats[x].fold == false){
                                $scope.firstPlayerId = seats[x].playerId;
                                console.log("firstActID: " + $scope.firstPlayerId);
                            }

                            // loop to the beginning of the array if at the end.
                            if(x+1 == seats.length){
                                x = 0;
                            } else {
                                x++;
                            }

                        }

                        // if button not dead and didn't fold, then set as last position
                        if(seats[i].dead == false && seats[i].fold == false){
                            $scope.lastPlayerId = seats[i].playerId;
                            console.log("lastPlayer ID: " + $scope.lastPlayerId);

                        // if button dead or folded, then start at button position and count backwards
                        } else {

                            // -1 so that first/last can't be same
                            x = seats.length-1;

                            while(x > 0 && $scope.lastPlayerId == 0){

                                // count backwards through array, loop if reach beginning
                                if(i == 0){
                                    i = seats.length-1;
                                } else {
                                    i--;
                                }

                                if(seats[i].dead == false && seats[i].fold == false){
                                    $scope.lastPlayerId = seats[i].playerId;
                                    console.log("lastPlayerId: " + $scope.lastPlayerId);
                                }

                                x--;
                            }
                        }
                    }

                    i++;
                }
            }

            // once found, reset the timer & make a call to gameTimer to activate the next round & exit
            $scope.table.countdown = $scope.table.timer + 1;
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
            for(i=0; i < length; i++){

                // Remove the player from the array if they aren't the button
                if(players[i].dead == true && players[i].button == false){
                    $scope.livePlayers.splice(i, 1);
                }

                $scope.livePlayers[i].actionTaken = false;

                if(players[i].playerId == $scope.firstPlayerId){
                    currentPosition = i;
                    $scope.livePlayers[i].turn = true;
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

                            // if player folds && only 1 live player - clear timer and call findWinner
                            if($scope.livePlayers.length < 2){

                                gameInfo.findWinner($scope);

                                // stop timer & exit
                                clearInterval(roundLive);
                                return;
                            }
                        }

                        roundFinished = true;
                    }

                    // check to see if round has finished -- when current position is last player
                    if(roundFinished == true){

                        console.log("Round Finished");
                        console.log("------------");

                        // add up bets
                        if($scope.table.currentBet != 0){
                            for(i=0; $scope.table.seats.length > i; i++){

                                if($scope.table.seats[i].currentBet != 0 && $scope.table.seats[i].dead == false){
                                    roundTotal += $scope.table.seats[i].currentBet;
                                    $scope.table.seats[i].currentBet = 0;
                                    $scope.table.seats[i].bet = 0;
                                }
                                $scope.$apply();
                            }
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
                            if(currentPosition == $scope.livePlayers.length){
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

                            if(currentPosition+1 == length){
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
            var players = $scope.livePlayers,
            roundTotal = 0;

            console.log("-- findWinner was called --");

            // reset player turn
            for(i=0; i < players.length; i++){
                $scope.table.seats[i].turn = false;
                $scope.livePlayers[i].turn = false;
            }

            // add up bets
            for(i=0; $scope.table.seats.length > i; i++){
                if($scope.table.seats[i].currentBet != 0 && $scope.table.seats[i].dead == false){
                    roundTotal += $scope.table.seats[i].currentBet;
                    $scope.table.seats[i].currentBet = 0;
                    $scope.table.seats[i].bet = 0;
                }
            }

            $scope.$apply();

            // update pot
            $scope.table.pot = $scope.table.pot + roundTotal;
            $scope.table.currentBet = 0;
            roundTotal = 0;

            if(players.length < 2){
                for(i=0; players.length > i; i++){
                    if(players[i].fold == false){
                        $scope.livePlayers[i].winner = true;
                        $scope.livePlayers[i].chips += $scope.table.pot;
                        $scope.table.pot = 0;
                        $scope.winner = players[i];
                        $scope.alert = players[i].name + " wins this hand! 3 seconds until the next hand.";
                        $scope.$apply();
                    }
                }
            } else {

                gameInfo.bestHand($scope);

                $scope.table.gameStatus = 4;
                $scope.table.pot = 0;
                $scope.alert = players[0].name + " wins this hand! 3 seconds until the next hand.";
                $scope.$apply();
            }

            setTimeout(function(){

                // reset game status & table for next hand
                $scope.table.gameStatus = 0;
                gameInfo.resetTable($scope);
                return;

            }, 3000);
        },

        bestHand: function($scope){
            var players = $scope.livePlayers,
            i = 0, x = 0, winnerPosition = 0, winnerId = 0;

            console.log("-- bestHand was called --");

            for(i=0; i < players.length; i++){
                var playerInfo = {}, handCombined = [], handCombinedNum = [], handCombinedSuit = []

                // combine player hand & board
                handCombined = $scope.table.cards.concat(players[i].hand);

                for(x=0; x < handCombined.length; x++){
                    handCombinedNum.push(handCombined[x].cardNum);
                    handCombinedSuit.push(handCombined[x].cardSuit);
                }

                // save info to playerInfo object
                playerInfo = {
                    'playerId': players[i].playerId,
                    'handValue': 0,
                    'handName': '',
                    'handCombinedNum': handCombinedNum,
                    'handCombinedSuit': handCombinedSuit
                }

                // add object to array of all live players
                $scope.playerHands.push(playerInfo);
            }

            // LOOP THROUGH THE PLAYERS
            for(i=0; i < players.length; i++){
                var x = 0, cardSuit = '';

                // loop through cards and set number of times it's found
                while(x < 13){
                    var cardFound = 0, z = 0;

                    // loop through player hand
                    while(z < 7){

                        cardFound = $scope.playerHands[i].handCombinedNum[z].indexOf($scope.cardNumbers[x].cardNum);
                        cardSuit = $scope.playerHands[i].handCombinedSuit[z];
                        if(cardFound == 0){
                            $scope.cardNumbers[x].times++;
                            $scope.cardNumbers[x].suits.push(cardSuit);
                        }

                        z++;
                    }
                    x++;
                }

                console.log("------------------------");

                // ROYAL FLUSH, STRAIGHT FLUSH, FLUSH, STRAIGHT
                if($scope.playerHands[i].handValue <= 10){
                    var heart = 0, diamond = 0, spade = 0, club = 0, z = 0, x = 0, s = 0, straight = false, flush = false;

                    // loop through cards and find if 5 of them are in order
                    while(x < 13){

                        // check for ROYAL FLUSH, (10-A)
                        if(x == 8 && $scope.cardNumbers[x].times > 0){
                            var cardSuit = '', cardSuitOne = 0, cardSuitTwo = 0, cardSuitThree = 0, cardSuitFour = 0, cardSuitFive = 0;

                            // if the card that comes immediately after is found, check the four following to see if they are also found
                            if($scope.cardNumbers[x+1].times > 0 && $scope.cardNumbers[x+2].times > 0 && $scope.cardNumbers[x+3].times > 0 && $scope.cardNumbers[x+4].times > 0){
                                straight = true, s = x;

                                // loops through and finds which card only has one suit available starting with x
                                while(s < 13 && cardSuit == ''){
                                    if($scope.cardNumbers[s].suits.length == 1){
                                        cardSuit = $scope.cardNumbers[s].suits[0];
                                    }
                                    s++;
                                }

                                cardSuitOne = $scope.cardNumbers[x].suits.indexOf(cardSuit);
                                cardSuitTwo = $scope.cardNumbers[x+1].suits.indexOf(cardSuit);
                                cardSuitThree = $scope.cardNumbers[x+2].suits.indexOf(cardSuit);
                                cardSuitFour = $scope.cardNumbers[x+3].suits.indexOf(cardSuit);
                                cardSuitFive = $scope.cardNumbers[x+4].suits.indexOf(cardSuit);

                                if(cardSuitOne != -1 && cardSuitTwo != -1 && cardSuitThree != -1 && cardSuitFour != -1 && cardSuitFive != -1){
                                    $scope.playerHands[i].handValue = 10;
                                    $scope.playerHands[i].handName = "Royal Flush";
                                    console.log($scope.playerHands[i].handName);
                                }
                            }

                        // check for STRAIGHT, first card must be smaller than 10
                        } else if(x < 8 && $scope.cardNumbers[x].times > 0 && $scope.playerHands[i].handValue < 10){
                            var cardSuit = '', cardSuitOne = 0, cardSuitTwo = 0, cardSuitThree = 0, cardSuitFour = 0, cardSuitFive = 0;

                            // if the card that comes immediately after is found, check the four following to see if they are also found
                            if($scope.cardNumbers[x+1].times > 0 && $scope.cardNumbers[x+2].times > 0 && $scope.cardNumbers[x+3].times > 0 && $scope.cardNumbers[x+4].times > 0){
                                straight = true, s = 0;

                                // loops through and finds which card only has one suit available
                                while(s < 13 && cardSuit == ''){
                                    if($scope.cardNumbers[s].suits.length == 1){
                                        cardSuit = $scope.cardNumbers[s].suits[0];
                                    }
                                    s++;
                                }

                                cardSuitOne = $scope.cardNumbers[x].suits.indexOf(cardSuit);
                                cardSuitTwo = $scope.cardNumbers[x+1].suits.indexOf(cardSuit);
                                cardSuitThree = $scope.cardNumbers[x+2].suits.indexOf(cardSuit);
                                cardSuitFour = $scope.cardNumbers[x+3].suits.indexOf(cardSuit);
                                cardSuitFive = $scope.cardNumbers[x+4].suits.indexOf(cardSuit);

                                if(cardSuitOne != -1 && cardSuitTwo != -1 && cardSuitThree != -1 && cardSuitFour != -1 && cardSuitFive != -1){
                                    $scope.playerHands[i].handValue = 9;
                                    $scope.playerHands[i].handName = "Straight Flush";
                                    console.log($scope.playerHands[i].handName);
                                }
                            }

                        // check for STRAIGHT (A-5)
                        } else if(x == 12 && $scope.cardNumbers[x].times > 0 && $scope.playerHands[i].handValue < 10){
                            var cardSuit = '', cardSuitOne = 0, cardSuitTwo = 0, cardSuitThree = 0, cardSuitFour = 0, cardSuitFive = 0;

                            if($scope.cardNumbers[0].times > 0 && $scope.cardNumbers[1].times > 0 && $scope.cardNumbers[2].times > 0 && $scope.cardNumbers[3].times > 0){
                                straight = true, s = 0;

                                // loops through and finds which card only has one suit available
                                while(s < 13 && cardSuit == ''){
                                    if($scope.cardNumbers[s].suits.length == 1){
                                        cardSuit = $scope.cardNumbers[s].suits[0];
                                    }
                                    s++;
                                }

                                cardSuitOne = $scope.cardNumbers[x].suits.indexOf(cardSuit);
                                cardSuitTwo = $scope.cardNumbers[0].suits.indexOf(cardSuit);
                                cardSuitThree = $scope.cardNumbers[1].suits.indexOf(cardSuit);
                                cardSuitFour = $scope.cardNumbers[2].suits.indexOf(cardSuit);
                                cardSuitFive = $scope.cardNumbers[3].suits.indexOf(cardSuit);

                                if(cardSuitOne != -1 && cardSuitTwo != -1 && cardSuitThree != -1 && cardSuitFour != -1 && cardSuitFive != -1){
                                    $scope.playerHands[i].handValue = 9;
                                    $scope.playerHands[i].handName = "Straight Flush";
                                    console.log($scope.playerHands[i].handName);
                                }
                            }
                        }
                        x++;
                    }

                    // loop through and find how many times each suit is available
                    while(z < 7){

                        $scope.playerHands[i].handCombinedSuit[z] == "heart" && heart++;
                        $scope.playerHands[i].handCombinedSuit[z] == "diamond" && diamond++;
                        $scope.playerHands[i].handCombinedSuit[z] == "spade" && spade++;
                        $scope.playerHands[i].handCombinedSuit[z] == "club" && club++;

                        z++;
                    }

                    // if any 5 cards have the same suit
                    if((heart > 4 || diamond > 4 || spade > 4 || club > 4) && $scope.playerHands[i].handValue < 6){
                        $scope.playerHands[i].handValue = 6;
                        $scope.playerHands[i].handName = "Flush";
                        console.log($scope.playerHands[i].handName);
                    } else if(straight == true && $scope.playerHands[i].handValue < 6){
                        $scope.playerHands[i].handValue = 5;
                        $scope.playerHands[i].handName = "Straight";
                        console.log($scope.playerHands[i].handName);
                    }
                }

                // FOUR OF A KIND, FULL HOUSE, THREE OF A KIND, TWO PAIR, ONE PAIR
                if($scope.playerHands[i].handValue < 8){
                    var x = 0, four = 0, set = 0, pair = 0;

                    // Loop through and find what cards are found more than once
                    while(x < 13){
                        if($scope.cardNumbers[x].times > 3 && $scope.playerHands[i].handValue < 8){
                            four++;
                            $scope.playerHands[i].handValue = 8;
                            $scope.playerHands[i].handName = "Four of a Kind";
                            console.log($scope.playerHands[i].handName);
                        } else if($scope.cardNumbers[x].times > 2){
                            set++;
                        } else if($scope.cardNumbers[x].times > 1){
                            pair++;
                        }

                        if(set >= 1 && (pair >= 1 || set == 2) && $scope.playerHands[i].handValue < 7){
                            $scope.playerHands[i].handValue = 7;
                            $scope.playerHands[i].handName = "Full House";
                            console.log($scope.playerHands[i].handName);
                        } else if($scope.playerHands[i].handValue < 4 && set > 0){
                            $scope.playerHands[i].handValue = 4;
                            $scope.playerHands[i].handName = "Three of a Kind";
                            console.log($scope.playerHands[i].handName);
                        } else if($scope.playerHands[i].handValue < 3 && pair > 1){
                            $scope.playerHands[i].handValue = 3;
                            $scope.playerHands[i].handName = "Two Pair";
                            console.log($scope.playerHands[i].handName);
                        } else if($scope.playerHands[i].handValue < 2 && pair == 1){
                            $scope.playerHands[i].handValue = 2;
                            $scope.playerHands[i].handName = "One Pair";
                            console.log($scope.playerHands[i].handName);
                        }
                        x++;
                    }
                }

                // HIGH CARD
                if($scope.playerHands[i].handValue == 0){
                    $scope.playerHands[i].handValue = 1;
                }

                // reset card count to 0 for next player
                x = 0;
                while(x < $scope.cardNumbers.length){
                    $scope.cardNumbers[x].times = 0;
                    $scope.cardNumbers[x].suits = [];
                    x++;
                }

                // for each player check
                console.log($scope.playerHands[i]);
                console.log("Player #" + i + " has a hand score of: " + $scope.playerHands[i].handValue);
            }

            // loop through player hands and set player ID of the winner
            for(i=0; i < $scope.playerHands.length; i++){

                // if not first player and hand greater than next player
                if(i == 0){
                    winnerPosition = i;
                    winnerId = $scope.playerHands[i].playerId;
                } else if($scope.playerHands[i].handValue >= $scope.playerHands[winnerPosition].handValue){
                    winnerPosition = i;
                    winnerId = $scope.playerHands[i].playerId;

                    // TO-DO: Write logic to determine which of the players have the better hand
                    if($scope.playerHands[i].handValue == $scope.playerHands[winnerPosition].handValue){
                        //
                    }
                }
            }

            for(i=0; i < $scope.livePlayers.length; i++){
                if(winnerId == $scope.livePlayers[i].playerId){

                    // assign winner && reward chips
                    $scope.livePlayers[i].winner = true;
                    $scope.livePlayers[i].chips += $scope.table.pot;
                    $scope.alert = $scope.livePlayers[i].name + " wins the hand with a " + $scope.playerHands[i].handName + "!";
                }
            }

            console.log("Winner Position: " + winnerPosition);
            console.log("Winner ID: " + winnerId);

            return;
        }
    };

    return gameInfo;

});

pokerApp.controller('PlayerListCtrl', ['$scope','playerStatus', function($scope, status) {

    $scope.orderProp = 'rank';
    $scope.cardNumbers = [
        {
            'cardNum': "2",
            'times': 0,
            'suits': []
        },
        {
            'cardNum': "3",
            'times': 0,
            'suits': []
        },
        {
            'cardNum': "4",
            'times': 0,
            'suits': []
        },
        {
            'cardNum': "5",
            'times': 0,
            'suits': []
        },
        {
            'cardNum': "6",
            'times': 0,
            'suits': []
        },
        {
            'cardNum': "7",
            'times': 0,
            'suits': []
        },
        {
            'cardNum': "8",
            'times': 0,
            'suits': []
        },
        {
            'cardNum': "9",
            'times': 0,
            'suits': []
        },
        {
            'cardNum': "10",
            'times': 0,
            'suits': []
        },
        {
            'cardNum': "J",
            'times': 0,
            'suits': []
        },
        {
            'cardNum': "Q",
            'times': 0,
            'suits': []
        },
        {
            'cardNum': "K",
            'times': 0,
            'suits': []
        },
        {
            'cardNum': "A",
            'times': 0,
            'suits': []
        },
    ],
    $scope.table = {
        'pot': 0,
        'currentBet': 0,
        'timer': 3,
        'countdown': 3,
        'smallBlind': 25,
        'gameStatus': 0,
        'cards': [
            {
                'cardNum':'9',
                'cardSuit':'spade'
            },
            {
                'cardNum':'Q',
                'cardSuit':'heart'
            },
            {
                'cardNum':'Q',
                'cardSuit':'spade'
            },
            {
                'cardNum':'J',
                'cardSuit':'spade'
            },
            {
                'cardNum':'K',
                'cardSuit':'spade'
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
                        'cardNum':'9',
                        'cardSuit':'heart'
                    },
                    {
                        'cardNum':'9',
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
                        'cardNum':'A',
                        'cardSuit':'spade'
                    },
                    {
                        'cardNum':'10',
                        'cardSuit':'spade'
                    }
                ]
            },
            {
                'dead': false,
                'playerId': 1984,
                'rank': 2,
                'name': 'Player Two',
                'imageUrl': 'bootstrap/img/ichigo.jpg',
                'chips': 200,
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
                        'cardSuit':'diamond'
                    },
                    {
                        'cardNum':'6',
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
                        'cardNum':'7',
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
                        'cardNum':'Q',
                        'cardSuit':'diamond'
                    },
                    {
                        'cardNum':'5',
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
                        'cardNum':'10',
                        'cardSuit':'diamond'
                    },
                    {
                        'cardNum':'8',
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
                        'cardNum':'3',
                        'cardSuit':'spade'
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
                        'cardNum':'Q',
                        'cardSuit':'club'
                    },
                    {
                        'cardNum':'Q',
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
                        'cardNum':'10',
                        'cardSuit':'spade'
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
    $scope.playerHands = [];
    $scope.myBet = $scope.table.seats[$scope.myPosition].bet;

    // status.resetTable($scope);
    status.setLivePlayers($scope);
    status.bestHand($scope);

}]);
