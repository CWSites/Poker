
/* Controllers */

var pokerApp=angular.module('pokerApp', []);

pokerApp.factory('playerStatus', function() {

    var gameInfo={

        // TO-DO: Write logic for random seating

        // reseting variables for next hand
        // calling functions asyncronously
        resetTable: function($scope){
            $scope.placeBet=false;
            $scope.firstPlayerId=0;
            $scope.lastPlayerId=0;
            $scope.winner={}
            $scope.livePlayers=[];

            console.log("-- resetTable was called --");

            // reset all players
            for(i=0; $scope.table.seats.length > i; i++){
                $scope.table.seats[i].fold=false;
                $scope.table.seats[i].turn=false;
                $scope.table.seats[i].winner=false;
                $scope.alert='';
            }

            // TEST: make sure this works if less than 2 players
            if($scope.table.seats.length > 1){
                gameInfo.setLivePlayers($scope);
                gameInfo.moveButtonBlinds($scope);
                gameInfo.setButtonBlinds($scope);
                gameInfo.findFirstLastPlayer($scope);
            } else {
                // TEST: make sure this alert displays
                $scope.alert="There aren't enough players. Invite your friends!"
            }
        },

        // move button position & blinds for big/small
        moveButtonBlinds: function($scope){
            var players=$scope.livePlayers, buttonMoved=false, blindsMoved=false, firstActMoved=false, smallPosition=0, bigPosition=0, i=0, x=0;

            while(i<players.length){

                if(players[i].button == true && buttonMoved == false){
                    $scope.livePlayers[i].button=false;

                    // loops to beginning of array if "i" is end of array
                    i+1 == players.length ? x=0 : x=i+1;

                    $scope.livePlayers[x].button=true;
                    buttonMoved=true;
                }

                if(players[i].blind == "small" && blindsMoved == false){
                    $scope.livePlayers[i].blind="";

                    // loops to beginning of array if "i" is end of array
                    i+1 == players.length ? smallPosition=0 : smallPosition=i+1;

                    $scope.livePlayers[smallPosition].blind="small";

                    // loops to beginning of array if "i" is end of array
                    if(i+2 == players.length){
                        bigPosition=0;
                    } else if(i+2 > players.length){
                        bigPosition=1;
                    } else {
                        bigPosition=i+2;
                    }

                    // make sure that big blind isn't dead
                    while(bigPosition < players.length && blindsMoved == false){
                        if(players[bigPosition].dead == false){
                            $scope.livePlayers[bigPosition].blind="big";
                            blindsMoved=true;
                        }
                    }
                }

                if(players[i].firstAct == true && firstActMoved == false){
                    $scope.livePlayers[i].firstAct=false;
                    x=0;

                    // loops to beginning of array if "i" is end of array
                    i+1 == players.length ? x=0 : x=i+1;

                    $scope.livePlayers[x].firstAct=true;
                    firstActMoved=true;
                }
                i++;
            }

            // start next hand once button and blinds have moved
            if(buttonMoved == true && blindsMoved == true && firstActMoved == true){
                return;
            }
        },

        // create live players array
        setLivePlayers: function($scope){
            var seats=$scope.table.seats, players=$scope.livePlayers, i=0;

            // Remove anyone that doesn't have chips from the table
            for(i=0; i < seats.length; i++){
                if(seats[i].chips == 0){
                    $scope.table.seats[i].dead=true;

                    // removes player and adds object with dead: true, keeps button and blind status
                    $scope.table.seats.splice(i, 1, {
                        "dead": true,
                        "button": seats[i].button,
                        "blind": seats[i].blind
                    });
                }
            }

            $scope.livePlayers=players.concat(seats);
            players=$scope.livePlayers;

            // Initially remove dead players from live players if they weren't a blind or a button
            for(i=0; i < players.length; i++){
                if(players[i].dead == true && players[i].blind == '' && players[i].button == false){
                    $scope.livePlayers.splice(i, 1);
                }
            }
        },

        // set button position & blinds for big/small
        // changes saved to players.json
        setButtonBlinds: function($scope){
            var players=$scope.livePlayers, smallBlind=$scope.table.smallBlind, bigBlind=smallBlind * 2;

            for(i=0; i < players.length; i++){
                // TO-DO:
                // - If player doesn't have enough then put all-in
                // - Create all-in function
                // - Write logic to check for dead button & dead small blind

                // save button position in table array
                if(players[i].button == true){
                    $scope.buttonPosition=i;
                    $scope.buttonId=players[i].playerId;
                }

                if (players[i].blind == "small"){
                    $scope.livePlayers[i].chips -= smallBlind;
                    $scope.livePlayers[i].bet=smallBlind;
                    $scope.livePlayers[i].currentBet=smallBlind;
                }

                if (players[i].blind == "big"){
                    $scope.livePlayers[i].chips -= bigBlind;
                    $scope.livePlayers[i].bet=bigBlind;
                    $scope.livePlayers[i].currentBet=bigBlind;
                }
            }

            $scope.table.currentBet=bigBlind;
        },

        // find first to act, or first live player after button
        findFirstLastPlayer: function($scope){
            var players=$scope.livePlayers, seats=$scope.table.seats, x=0, i=0;
            $scope.firstPlayerId=0;
            $scope.lastPlayerId=0;

            // PRE FLOP
            if($scope.table.gameStatus == 0){

                // loop through players to find first to act preflop
                for(i=0; i < players.length; i++){

                    // find first to act if preFlop
                    if(players[i].firstAct == true){
                        $scope.firstPlayerId=players[i].playerId;
                        $scope.livePlayers[i].turn=true;
                    }

                    // find last to act if preFlop
                    if(players[i].blind == 'big'){
                        $scope.lastPlayerId=players[i].playerId;
                    }
                }

            // POST FLOP
            } else {
                i=0;

                // loop through and find the button
                while(i < seats.length && $scope.firstPlayerId == 0 && $scope.lastPlayerId == 0){

                    // BUTTON FOUND
                    if(seats[i].playerId == $scope.buttonId){
                        x=0;

                        // loop if at end of array
                        i+1 == seats.length ? x=0 : x=i+1;

                        // start at button position and find first live player
                        while(x <= seats.length && $scope.firstPlayerId == 0){

                            if(seats[x].dead == false && seats[x].fold == false){
                                $scope.firstPlayerId=seats[x].playerId;
                            }

                            // loop to the beginning of the array if at the end.
                            x+1 == seats.length ? x=0 : x++;
                        }

                        // if button not dead and didn't fold, then set as last position
                        if(seats[i].dead == false && seats[i].fold == false){
                            $scope.lastPlayerId=seats[i].playerId;

                        // if button dead or folded, then start at button position and count backwards
                        } else {
                            // -1 so that first/last can't be same
                            x=seats.length-1;

                            while(x > 0 && $scope.lastPlayerId == 0){
                                // count backwards through array, loop if reach beginning
                                i == 0 ? i=seats.length-1 : i--;

                                if(seats[i].dead == false && seats[i].fold == false){
                                    $scope.lastPlayerId=seats[i].playerId;
                                }
                                x--;
                            }
                        }
                    }
                    i++;
                }
            }

            // once found, reset the timer & make a call to gameTimer to activate the next round & exit
            $scope.table.countdown=$scope.table.timer + 1;
            gameInfo.gameTimer($scope);
            return;
        },

        // game timer
        gameTimer: function($scope){
            var players=$scope.livePlayers, currentPosition=0, roundFinished=false, roundTotal=0, i=0;

            // reset player timer
            $scope.table.countdown=$scope.table.timer;

            // reset player actionTaken
            // set current position to firstPlayerId
            for(i=0; i < players.length; i++){

                // Remove the player from the array if they aren't the button
                if(players[i].dead == true && players[i].button == false){
                    $scope.livePlayers.splice(i, 1);
                }

                $scope.livePlayers[i].actionTaken=false;

                if(players[i].playerId == $scope.firstPlayerId){
                    currentPosition=i;
                    $scope.livePlayers[i].turn=true;
                }
            }

            // START COUNTER
            var roundLive=setInterval(function() {

                // if hand finished or only one player live
                if($scope.table.gameStatus == 4 || $scope.livePlayers.length == 1){
                    gameInfo.findWinner($scope);
                    clearInterval(roundLive);
                    return;
                }

                // if player bets or raises then update table currentBet
                if(players[currentPosition].actionTaken == true && players[currentPosition].currentBet > $scope.table.currentBet){
                    $scope.table.currentBet=players[currentPosition].currentBet;
                }

                // when player timer is 0 || player folds || player is dead || player checks, calls, bets or raises
                if($scope.table.countdown == 0 || players[currentPosition].dead == true || players[currentPosition].actionTaken == true || players[currentPosition].fold == true){

                    // checks to see if lastPlayer has taken action
                    if($scope.lastPlayerId == players[currentPosition].playerId && ($scope.table.countdown == 0 || players[currentPosition].actionTaken == true)){

                        // if last player didn't act, they forfeit the hand, update live players
                        // TO-DO: Uncomment this line when using live players, this is to keep the big blind in the game
                        // if(players[currentPosition].actionTaken == false || players[currentPosition].currentBet < $scope.table.currentBet){
                        if(players[currentPosition].currentBet < $scope.table.currentBet){
                            players[currentPosition].fold=true;
                            $scope.livePlayers.splice(currentPosition, 1);

                            // if player folds && only 1 live player - clear timer and call findWinner
                            if($scope.livePlayers.length == 1){
                                gameInfo.findWinner($scope);
                                clearInterval(roundLive);
                                return;
                            }
                        }
                        roundFinished=true;
                    }

                    // check to see if round has finished -- when current position is last player
                    if(roundFinished == true){

                        // add up bets
                        if($scope.table.currentBet != 0){
                            for(i=0; $scope.table.seats.length > i; i++){
                                if($scope.table.seats[i].currentBet != 0 && $scope.table.seats[i].dead == false){
                                    roundTotal += $scope.table.seats[i].currentBet;
                                    $scope.table.seats[i].currentBet=0;
                                    $scope.table.seats[i].bet=0;
                                }
                                $scope.$apply();
                            }
                        }

                        // update pot
                        $scope.table.pot=$scope.table.pot + roundTotal;
                        $scope.table.currentBet=0;
                        roundTotal=0;

                        // check to see if more than 1 player live
                        if($scope.livePlayers.length > 1 && $scope.table.gameStatus != 3){
                            // update game status (preflop, flop, turn, river)
                            $scope.table.gameStatus += 1;
                            players[currentPosition].turn=false;
                            gameInfo.findFirstLastPlayer($scope);
                            clearInterval(roundLive);
                            return;
                        } else {
                            gameInfo.findWinner($scope);
                            clearInterval(roundLive);
                            return;
                        }

                    // if round hasn't finished
                    } else {

                        players[currentPosition].turn=false;

                        // if player's current bet is less than table bet || player hasn't taken action
                        // if(players[currentPosition].actionTaken == false || players[currentPosition].currentBet < $scope.table.currentBet){

                        // TO-DO: Add logic to check if player all-in
                        if(players[currentPosition].currentBet < $scope.table.currentBet){
                            players[currentPosition].fold=true;
                            $scope.livePlayers.splice(currentPosition, 1);

                            // if player folds and no more than 1 player live
                            // clear timer and call findWinner
                            if($scope.livePlayers.length < 2){
                                gameInfo.findWinner($scope);
                                clearInterval(roundLive);
                                return;
                            }

                            // if at the end of the array, then loop
                            currentPosition == $scope.livePlayers.length ? currentPosition=0 : currentPosition=currentPosition;

                        // if player acted
                        } else {
                            // if player still in hand (array) then advance to next array position
                            // if player had folded, then they are removed from array, thus position stays the same
                            // if at end of list then loop around
                            currentPosition+1 == $scope.livePlayers.length ? currentPosition=0 : currentPosition=currentPosition+1;
                        }

                        // next player's turn, check to see if next player is dead
                        if(players[currentPosition].dead == false){
                            players[currentPosition].turn=true;
                        }

                        // reset player timer
                        $scope.table.countdown=$scope.table.timer + 1;
                        $scope.$apply();
                    }
                }
                $scope.table.countdown--;
                $scope.$apply();
            }, 1000);
            return;
        },

        // when hand is finished and more than 1 player live, find the winner
        findWinner: function($scope){
            var players=$scope.livePlayers, roundTotal=0;

            // reset player turn
            for(i=0; i < players.length; i++){
                $scope.table.seats[i].turn=false;
                $scope.livePlayers[i].turn=false;
            }

            // add up bets
            for(i=0; $scope.table.seats.length > i; i++){
                if($scope.table.seats[i].currentBet != 0 && $scope.table.seats[i].dead == false){
                    roundTotal += $scope.table.seats[i].currentBet;
                    $scope.table.seats[i].currentBet=0;
                    $scope.table.seats[i].bet=0;
                }
            }

            $scope.$apply();

            // update pot
            $scope.table.pot=$scope.table.pot+roundTotal;
            $scope.table.currentBet=0;
            roundTotal=0;

            if(players.length == 1){
                while(i < players.length && $scope.winner == {}){
                    if(players[i].fold == false){
                        $scope.livePlayers[i].winner=true;
                        $scope.livePlayers[i].chips += $scope.table.pot;
                        $scope.table.pot=0;
                        $scope.winner=players[i];
                        $scope.alert=players[i].name + " wins this hand! 3 seconds until the next hand.";
                        $scope.$apply();
                    }
                    i++;
                }
            } else {
                gameInfo.handStrength($scope);
                $scope.table.gameStatus=4;
                $scope.table.pot=0;
                $scope.$apply();
            }

            // 3 second timeout until next game
            setTimeout(function(){
                $scope.table.gameStatus=0;
                gameInfo.resetTable($scope);
                return;
            }, 3000);
        },

        handStrength: function($scope){
            var players=$scope.livePlayers, cardNumbers=$scope.cardNumbers, playerHands=$scope.playerHands, i=0, x=0, w=0, winnerIds=[];

            for(i=0; i < players.length; i++){
                var playerInfo={}, handCombined=[], handCombinedNum=[], handCombinedSuit=[], highCard=0;

                // combine player hand & board
                handCombined=$scope.table.cards.concat(players[i].hand);

                for(x=0; x < handCombined.length; x++){
                    handCombinedNum.push(handCombined[x].cardNum);
                    handCombinedSuit.push(handCombined[x].cardSuit);
                }

                // save info to playerInfo object
                playerInfo={
                    'playerId': players[i].playerId,
                    'handValue': 0,
                    'highCard': 0,
                    'kicker': [],
                    'handName': '',
                    'handCombinedNum': handCombinedNum,
                    'handCombinedSuit': handCombinedSuit
                }

                // add object to array of all live players
                $scope.playerHands.push(playerInfo);
            }

            // LOOP THROUGH THE PLAYERS
            for(i=0; i < players.length; i++){
                var x=0, cardSuit='', curPlayer=playerHands[i];

                // loop through cards and set number of times it's found
                while(x < 13){
                    var cardFound=0, z=0;

                    // loop through player hand
                    while(z < 7){
                        cardFound=curPlayer.handCombinedNum[z].indexOf(cardNumbers[x].cardNum);
                        cardSuit=curPlayer.handCombinedSuit[z];
                        if(cardFound == 0){
                            $scope.cardNumbers[x].times++;
                            $scope.cardNumbers[x].suits.push(cardSuit);
                        }
                        z++;
                    }
                    x++;
                }

                // ROYAL FLUSH, STRAIGHT FLUSH, FLUSH, STRAIGHT
                if(curPlayer.handValue <= 10){
                    var heart=0, diamond=0, spade=0, club=0, z=0, x=0, straight=false, flushSuit='';

                    // loop through and find how many times each suit is available
                    while(z < 7){
                        curPlayer.handCombinedSuit[z] == 'heart' && heart++;
                        curPlayer.handCombinedSuit[z] == 'diamond' && diamond++;
                        curPlayer.handCombinedSuit[z] == 'spade' && spade++;
                        curPlayer.handCombinedSuit[z] == 'club' && club++;
                        z++;
                    }

                    // figure out which suit is the flush
                    if(heart >= 5 || diamond >= 5 || spade >= 5 || club >= 5){
                        if(heart >= 5){flushSuit='heart';}
                        if(diamond >= 5){flushSuit='diamond';}
                        if(spade >= 5){flushSuit='spade';}
                        if(club >= 5){flushSuit='club';}
                    }

                    // loop through cards and find if 5 of them are in order
                    while(x < 13){

                        // check for ROYAL FLUSH, (10-A)
                        if(x == 8 && cardNumbers[x].times > 0){

                            // if the card that comes immediately after is found, check the four following to see if they are also found
                            if(cardNumbers[x+1].times > 0 && cardNumbers[x+2].times > 0 && cardNumbers[x+3].times > 0 && cardNumbers[x+4].times > 0){
                                straight=true, $scope.playerHands[i].highCard=x+4;

                                if((cardNumbers[x].suits.indexOf(flushSuit) != -1) && (cardNumbers[x+1].suits.indexOf(flushSuit) != -1) && (cardNumbers[x+2].suits.indexOf(flushSuit) != -1) && (cardNumbers[x+3].suits.indexOf(flushSuit) != -1) && (cardNumbers[x+4].suits.indexOf(flushSuit) != -1)){
                                    $scope.playerHands[i].handValue=10;
                                    $scope.playerHands[i].handName='Royal Flush';
                                }
                            }

                        // check for STRAIGHT, first card must be smaller than 10
                        } else if(x < 8 && cardNumbers[x].times > 0 && curPlayer.handValue < 10){

                            // if the card that comes immediately after is found, check the four following to see if they are also found
                            if(cardNumbers[x+1].times > 0 && cardNumbers[x+2].times > 0 && cardNumbers[x+3].times > 0 && cardNumbers[x+4].times > 0){
                                straight=true, $scope.playerHands[i].highCard=x+4;

                                if((cardNumbers[x].suits.indexOf(flushSuit) != -1) && (cardNumbers[x+1].suits.indexOf(flushSuit) != -1) && (cardNumbers[x+2].suits.indexOf(flushSuit) != -1) && (cardNumbers[x+3].suits.indexOf(flushSuit) != -1) && (cardNumbers[x+4].suits.indexOf(flushSuit) != -1)){
                                    $scope.playerHands[i].handValue=9;
                                    $scope.playerHands[i].handName='Straight Flush';
                                }
                            }

                        // check for STRAIGHT (A-5)
                        } else if(x == 12 && cardNumbers[x].times > 0 && curPlayer.handValue < 10){

                            if(cardNumbers[0].times > 0 && cardNumbers[1].times > 0 && cardNumbers[2].times > 0 && cardNumbers[3].times > 0){
                                straight=true, $scope.playerHands[i].highCard=3;

                                if((cardNumbers[0].suits.indexOf(flushSuit) != -1) && (cardNumbers[1].suits.indexOf(flushSuit) != -1) && (cardNumbers[2].suits.indexOf(flushSuit) != -1) && (cardNumbers[3].suits.indexOf(flushSuit) != -1) && (cardNumbers[12].suits.indexOf(flushSuit) != -1)){
                                    $scope.playerHands[i].handValue=9;
                                    $scope.playerHands[i].handName='Straight Flush';
                                }
                            }
                        }
                        x++;
                    }

                    // if any 5 cards have the same suit
                    if(flushSuit != '' && curPlayer.handValue < 6){
                        var x=12, highCardFound=false;
                        $scope.playerHands[i].handValue=6;
                        $scope.playerHands[i].handName='Flush';

                        while(x > 0 && highCardFound == false){
                            if(cardNumbers[x].times > 0 && (cardNumbers[x].suits.indexOf(flushSuit) != -1)){
                                $scope.playerHands[i].highCard=x;
                                highCardFound=true;
                            }
                            x--;
                        }
                    } else if(straight == true && curPlayer.handValue < 6){
                        $scope.playerHands[i].handValue=5;
                        $scope.playerHands[i].handName='Straight';
                    }
                }

                // FOUR OF A KIND, FULL HOUSE, THREE OF A KIND, TWO PAIR, ONE PAIR, HIGH CARD
                if(curPlayer.handValue < 8){
                    var x=0, four=0, set=0, pair=0;

                    // Loop through and find what cards are found more than once
                    while(x < 13){
                        if(cardNumbers[x].times > 3 && curPlayer.handValue < 8){
                            four++;
                            $scope.playerHands[i].handValue=8;
                            $scope.playerHands[i].handName='Four of a Kind';
                            $scope.playerHands[i].highCard=x;
                        } else if(cardNumbers[x].times > 2){
                            set++;
                            if(set > 1 && curPlayer.handValue < 7){
                                $scope.playerHands[i].highCard=x;
                            } else if(curPlayer.handValue < 6){
                                $scope.playerHands[i].highCard=x;
                            }
                        } else if(cardNumbers[x].times > 1 && curPlayer.handValue < 3){
                            pair++;
                            $scope.playerHands[i].highCard=x;
                        } else if(cardNumbers[x].times == 1){

                            // ADD TO KICKER ARRAY
                            $scope.playerHands[i].kicker.push(x);

                            if(curPlayer.handValue == 0){
                                $scope.playerHands[i].highCard=x;
                            }
                        }

                        if(set >= 1 && (pair >= 1 || set == 2) && curPlayer.handValue < 7){
                            $scope.playerHands[i].handValue=7;
                            $scope.playerHands[i].handName='Full House';
                        } else if(curPlayer.handValue < 4 && set > 0){
                            $scope.playerHands[i].handValue=4;
                            $scope.playerHands[i].handName='Three of a Kind';
                        } else if(curPlayer.handValue < 3 && pair > 1){
                            $scope.playerHands[i].handValue=3;
                            $scope.playerHands[i].handName='Two Pair';
                        } else if(curPlayer.handValue < 2 && pair == 1){
                            $scope.playerHands[i].handValue=2;
                            $scope.playerHands[i].handName='One Pair';
                        }
                        x++;
                    }
                }

                if(curPlayer.handValue==0){
                    $scope.playerHands[i].handValue=1;
                    $scope.playerHands[i].handName='High Card';
                }

                // reset card count to 0 for next player
                x=0;
                while(x < cardNumbers.length){
                    $scope.cardNumbers[x].times=0;
                    $scope.cardNumbers[x].suits=[];
                    x++;
                }
            }

            // loop through player hands and set player ID of the winner
            for(i=0; i < $scope.playerHands.length; i++){

                if(i == 0){
                    w=i, winnerIds=[playerHands[i].playerId];
                } else if(playerHands[i].handValue > playerHands[w].handValue){
                    w=i, winnerIds=[playerHands[i].playerId];
                } else if(playerHands[i].handValue == playerHands[w].handValue){

                    if(playerHands[i].highCard > playerHands[w].highCard){
                        w=i, winnerIds=[playerHands[i].playerId];
                    } else if(playerHands[i].highCard == playerHands[w].highCard){
                        var curKick=playerHands[i].kicker, winKick=playerHands[w].kicker;

                        // If Kicker isn't allowed
                        if(playerHands[i].handValue == 10 || playerHands[i].handValue == 9 || playerHands[i].handValue == 7 || playerHands[i].handValue == 6 || playerHands[i].handValue == 5){

                            for(i=0; i < players.length; i++){
                                 winnerIds.push(playerHands[i].playerId);
                            }

                        // 1 Kicker Allowed
                        } else if(playerHands[i].handValue == 8 || playerHands[i].handValue == 3){

                            if(curKick[curKick.length-1] > winKick[winKick.length-1]){
                                w=i, winnerIds=[playerHands[i].playerId];
                            } else if(curKick[curKick.length-1] == winKick[winKick.length-1]){
                                winnerIds.push(playerHands[i].playerId);
                            }

                        // 2 Kickers Allowed
                        } else if(playerHands[i].handValue == 4){

                            if(curKick[curKick.length-1] > winKick[winKick.length-1]){
                                w=i, winnerIds=[playerHands[i].playerId];
                            } else if(curKick[curKick.length-2] > winKick[winKick.length-2]){
                                w=i, winnerIds=[playerHands[i].playerId];
                            } else if(curKick[curKick.length-2] == winKick[winKick.length-2]){
                                winnerIds.push(playerHands[i].playerId);
                            }

                        // 3 Kickers Allowed
                        } else if(playerHands[i].handValue == 2){

                            if(curKick[curKick.length-1] > winKick[winKick.length-1]){
                                w=i, winnerIds=[playerHands[i].playerId];
                            } else if(curKick[curKick.length-2] > winKick[winKick.length-2]){
                                w=i, winnerIds=[playerHands[i].playerId];
                            } else if(curKick[curKick.length-3] > winKick[winKick.length-3]){
                                w=i, winnerIds=[playerHands[i].playerId];
                            } else if(curKick[curKick.length-3] == winKick[winKick.length-3]){
                                winnerIds.push(playerHands[i].playerId);
                            }

                        // 5 Kickers Allowed
                        } else {

                            if(curKick[curKick.length-1] > winKick[winKick.length-1]){
                                w=i, winnerIds=[playerHands[i].playerId];
                            } else if(curKick[curKick.length-2] > winKick[winKick.length-2]){
                                w=i, winnerIds=[playerHands[i].playerId];
                            } else if(curKick[curKick.length-3] > winKick[winKick.length-3]){
                                w=i, winnerIds=[playerHands[i].playerId];
                            } else if(curKick[curKick.length-4] > winKick[winKick.length-4]){
                                w=i, winnerIds=[playerHands[i].playerId];
                            } else if(curKick[curKick.length-5] > winKick[winKick.length-5]){
                                w=i, winnerIds=[playerHands[i].playerId];
                            } else if(curKick[curKick.length-5] == winKick[winKick.length-5]){
                                winnerIds.push(playerHands[i].playerId);
                            }
                        }
                    }
                }
            }

            for(i=0; i < players.length; i++){
                if(winnerIds.indexOf(players[i].playerId) != -1){
                    $scope.livePlayers[i].winner=true;
                    if(winnerIds.length == 1){
                        $scope.livePlayers[i].chips += $scope.table.pot;
                        $scope.alert=players[i].name + ' wins the hand with a ' + playerHands[i].handName + '!';
                    } else if(winnerIds.length > 1){
                        $scope.livePlayers[i].chips += ($scope.table.pot / winnerIds.length);
                        $scope.alert='Players split the pot with ' + playerHands[i].handName + '!';
                    }
                }
            }

            console.log('Winner ID(s): ' + winnerIds);

            return;
        }
    };
    return gameInfo;
});

pokerApp.controller('PlayerListCtrl', ['$scope','playerStatus', function($scope, status) {

    $scope.orderProp='rank';
    $scope.cardNumbers=[
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
    $scope.table={
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
                'cardNum':'10',
                'cardSuit':'club'
            },
            {
                'cardNum':'4',
                'cardSuit':'spade'
            },
            {
                'cardNum':'J',
                'cardSuit':'diamond'
            },
            {
                'cardNum':'7',
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
                        'cardNum':'Q',
                        'cardSuit':'heart'
                    },
                    {
                        'cardNum':'K',
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
                        'cardNum':'7',
                        'cardSuit':'spade'
                    },
                    {
                        'cardNum':'A',
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
                        'cardNum':'K',
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
                        'cardNum':'6',
                        'cardSuit':'diamond'
                    },
                    {
                        'cardNum':'J',
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
                        'cardNum':'8',
                        'cardSuit':'diamond'
                    },
                    {
                        'cardNum':'2',
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
                        'cardNum':'K',
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
                        'cardNum':'K',
                        'cardSuit':'spade'
                    },
                    {
                        'cardNum':'J',
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
                        'cardNum':'K',
                        'cardSuit':'club'
                    },
                    {
                        'cardNum':'4',
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
                        'cardNum':'9',
                        'cardSuit':'club'
                    },
                    {
                        'cardNum':'3',
                        'cardSuit':'club'
                    }
                ]
            }
        ]
    }

    $scope.placeBet=false;
    $scope.firstPlayerId=0;
    $scope.lastPlayerId=0;
    $scope.buttonPosition=0;
    $scope.buttonId=0;
    $scope.myPosition=1;
    $scope.alert='';
    $scope.winner={}
    $scope.livePlayers=[];
    $scope.playerHands=[];
    $scope.myBet=$scope.table.seats[$scope.myPosition].bet;

    // TO TEST HAND STRENGTH, CARDS DEALT COMMENT THE FOLLOWING
    // --------------------------------------------------------
    // status.resetTable($scope);

    // TO TEST HAND STRENGTH, CARDS DEALT UNCOMMENT THE FOLLOWING
    // ----------------------------------------------------------
    status.setLivePlayers($scope);
    status.handStrength($scope);

}]);
