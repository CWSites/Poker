
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
            $scope.playerHands=[];

            // reset all players
            for(i=0; $scope.table.seats.length > i; i++){
                $scope.table.seats[i].fold=false;
                $scope.table.seats[i].turn=false;
                $scope.table.seats[i].winner=false;
                $scope.table.seats[i].hand=[];
                $scope.alert='';
            }

            // TEST: make sure this works if less than 2 players
            if($scope.table.seats.length > 1){
                gameInfo.setLivePlayers($scope);
                gameInfo.moveButtonBlinds($scope);
                gameInfo.setButtonBlinds($scope);
                gameInfo.dealCards($scope);
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

        dealCards: function($scope){
            $scope.table.cards=[];
            $scope.table.burnCards=[];
            // TO TEST HAND STRENGTH, CARDS DEALT COMMENT $scope.playerHands=[];
            // --------------------------------------------------------
            // $scope.playerHands=[];
            $scope.deck=[];
            var cards=$scope.cardNumbers, players=$scope.livePlayers, deck=$scope.deck, cardSuit='', card={}, i=0, smallFound=false, arrayPos=0;

            // loop through suit assignment
            for(s=0; s<4; s++){
                switch(s){
                    case 0:
                        cardSuit='spade';
                        break;
                    case 1:
                        cardSuit='club';
                        break;
                    case 2:
                        cardSuit='heart';
                        break;
                    case 3:
                        cardSuit='diamond';
                        break;
                }

                // loop through card number assignment
                for(i=0; i<cards.length; i++){
                    card={
                        'cardNum': cards[i].cardNum,
                        'cardSuit': cardSuit
                    }

                    // add card object to the deck array
                    deck.push(card);
                }
            }

            // shuffle the deck - Randomize array element order in-place. Using Fisher-Yates shuffle algorithm.
            for(var i=deck.length-1; i > 0; i--){
                var j=Math.floor(Math.random() * (i + 1));
                var temp=deck[i];
                deck[i]=deck[j];
                deck[j]=temp;
            }

            i=0;
            // deal the cards to the players
            while(i < players.length && smallFound == false){
                card={};

                if (players[i].blind == "small"){
                    smallFound=true;
                    players[i].dead == false ? x=i : x=i+1;
                    arrayPos=x;

                    // loop through players 2x to deal cards
                    for(x=0; x < players.length*2; x++){

                        // if at end of players array, loop to begining
                        if(arrayPos == players.length){
                            arrayPos=0;
                        }

                        $scope.livePlayers[arrayPos].hand.push(deck.shift(0,1));
                        arrayPos++;
                    }
                }
                i++;
            }

            $scope.deck=deck;
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

        burnTurn: function($scope){

            // TO TEST HAND STRENGTH, CARDS DEALT UNCOMMENT THE FOLLOWING
            // ----------------------------------------------------------
            // $scope.table.burnCards.push($scope.deck.shift(0,1));
            // $scope.table.cards.push($scope.deck.shift(0,1));
            // $scope.table.cards.push($scope.deck.shift(0,1));
            // $scope.table.cards.push($scope.deck.shift(0,1));
            // $scope.table.burnCards.push($scope.deck.shift(0,1));
            // $scope.table.cards.push($scope.deck.shift(0,1));
            // $scope.table.burnCards.push($scope.deck.shift(0,1));
            // $scope.table.cards.push($scope.deck.shift(0,1));

            // TO TEST HAND STRENGTH, CARDS DEALT COMMENT THE FOLLOWING
            // --------------------------------------------------------
            switch($scope.table.gameStatus){
                case 1:
                    // burn 1 turn 3
                    $scope.table.burnCards.push($scope.deck.shift(0,1));
                    $scope.table.cards.push($scope.deck.shift(0,1));
                    $scope.table.cards.push($scope.deck.shift(0,1));
                    $scope.table.cards.push($scope.deck.shift(0,1));
                    break;
                case 2:
                    // burn 1 turn 1
                    $scope.table.burnCards.push($scope.deck.shift(0,1));
                    $scope.table.cards.push($scope.deck.shift(0,1));
                    break;
                case 3:
                    // burn 1 turn 1
                    $scope.table.burnCards.push($scope.deck.shift(0,1));
                    $scope.table.cards.push($scope.deck.shift(0,1));
                    break;
            }
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

            // BURN & TURN
            gameInfo.burnTurn($scope);

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

            // TO-DO: Fix bug where this doesn't work properly
            if(players.length == 1){
                while(i < players.length && $scope.winner == {}){
                    if(players[i].fold == false){
                        $scope.livePlayers[i].winner=true;
                        $scope.livePlayers[i].chips += $scope.table.pot;
                        $scope.table.pot=0;
                        $scope.winner=players[i];
                        $scope.alert=players[i].name + " wins this hand! 5 seconds until the next hand.";
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

            // 5 second timeout until next game
            setTimeout(function(){
                $scope.table.gameStatus=0;
                gameInfo.resetTable($scope);
                return;
            }, 5000);
        },

        handStrength: function($scope){
            var players=$scope.livePlayers, cardNumbers=$scope.cardNumbers, i=0, x=0, w=0, winnerIds=[];

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

            var playerHands = $scope.playerHands;

            // LOOP THROUGH THE PLAYERS
            for(i=0; i < players.length; i++){
                $scope.playerHands[i].kicker=[];
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
                if($scope.playerHands[i].handValue <= 10){
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
                        } else if(x < 8 && cardNumbers[x].times > 0 && $scope.playerHands[i].handValue < 10){

                            // if the card that comes immediately after is found, check the four following to see if they are also found
                            if(cardNumbers[x+1].times > 0 && cardNumbers[x+2].times > 0 && cardNumbers[x+3].times > 0 && cardNumbers[x+4].times > 0){
                                straight=true, $scope.playerHands[i].highCard=x+4;

                                if((cardNumbers[x].suits.indexOf(flushSuit) != -1) && (cardNumbers[x+1].suits.indexOf(flushSuit) != -1) && (cardNumbers[x+2].suits.indexOf(flushSuit) != -1) && (cardNumbers[x+3].suits.indexOf(flushSuit) != -1) && (cardNumbers[x+4].suits.indexOf(flushSuit) != -1)){
                                    $scope.playerHands[i].handValue=9;
                                    $scope.playerHands[i].handName='Straight Flush';
                                }
                            }

                        // check for STRAIGHT (A-5)
                        } else if(x == 12 && cardNumbers[x].times > 0 && $scope.playerHands[i].handValue < 10){

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
                    if(flushSuit != '' && $scope.playerHands[i].handValue < 6){
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
                    } else if(straight == true && $scope.playerHands[i].handValue < 6){
                        $scope.playerHands[i].handValue=5;
                        $scope.playerHands[i].handName='Straight';
                    }
                }

                // FOUR OF A KIND, FULL HOUSE, THREE OF A KIND, TWO PAIR, ONE PAIR, HIGH CARD
                if($scope.playerHands[i].handValue < 8){
                    var four=0, set=0, pair=0, fullHouseKicker=[], pairKicker=[];

                    // Loop through and find what cards are found more than once
                    for(x=0; x < 13; x++){

                        if(cardNumbers[x].times == 4 && $scope.playerHands[i].handValue < 8){
                            four++;
                            $scope.playerHands[i].handValue=8;
                            $scope.playerHands[i].handName='Four of a Kind';
                            $scope.playerHands[i].highCard=x;
                        } else if(cardNumbers[x].times == 3){
                            set++;
                            $scope.playerHands[i].highCard=x;
                            if(set ==2){
                                $scope.playerHands[i].kicker.push(x);
                            }
                        } else if(cardNumbers[x].times == 2){
                            pair++;
                            pairKicker.push(x);
                            if($scope.playerHands[i].handValue < 4){
                                $scope.playerHands[i].highCard=x;
                            }
                        } else if(cardNumbers[x].times == 1){
                            $scope.playerHands[i].kicker.push(x);
                        }

                        if(((set >= 1 && pair >= 1) || set == 2) && $scope.playerHands[i].handValue < 7){
                            $scope.playerHands[i].handValue=7;
                            $scope.playerHands[i].handName='Full House';
                            $scope.playerHands[i].kicker=fullHouseKicker.slice(0);
                        } else if($scope.playerHands[i].handValue < 4 && set == 1){
                            $scope.playerHands[i].handValue=4;
                            $scope.playerHands[i].handName='Three of a Kind';
                        } else if($scope.playerHands[i].handValue < 3 && pair >= 2){
                            $scope.playerHands[i].handValue=3;
                            $scope.playerHands[i].handName='Two Pair';
                            $scope.playerHands[i].kicker=pairKicker.slice(1);
                        } else if($scope.playerHands[i].handValue < 2 && pair == 1){
                            $scope.playerHands[i].handValue=2;
                            $scope.playerHands[i].handName='One Pair';
                        } else if(cardNumbers[x].times == 1 && $scope.playerHands[i].handValue == 0){
                            $scope.playerHands[i].highCard=x;
                            $scope.playerHands[i].handValue=1;
                            $scope.playerHands[i].handName='High Card';
                        }
                    }
                }

                // reset card count to 0 for next player
                for(x=0; x < cardNumbers.length; x++){
                    $scope.cardNumbers[x].times=0;
                    $scope.cardNumbers[x].suits=[];
                }
            }

            // loop through player hands and set player ID of the winner
            for(i=0; i < $scope.playerHands.length; i++){
                console.log("-----------------------");
                console.log($scope.playerHands[i]);

                if(i == 0){
                    w=i, winnerIds=[playerHands[i].playerId];
                } else if(playerHands[i].handValue > playerHands[w].handValue){
                    w=i, winnerIds=[playerHands[i].playerId];
                } else if(playerHands[i].handValue == playerHands[w].handValue){

                    if(playerHands[i].highCard > playerHands[w].highCard){
                        w=i, winnerIds=[playerHands[i].playerId];
                    } else if(playerHands[i].highCard == playerHands[w].highCard){
                        var curKick=playerHands[i].kicker, winKick=playerHands[w].kicker;

                        // CLEAN UP: Combine 8, 7, 3 together
                        switch(playerHands[i].handValue){
                            case 8: // 1 Kicker allowed
                                if(curKick[curKick.length-1] > winKick[winKick.length-1]){
                                    w=i, winnerIds=[playerHands[i].playerId];
                                } else if(curKick[curKick.length-1] == winKick[winKick.length-1]){
                                    winnerIds.push(playerHands[i].playerId);
                                }
                            case 7: // 1 Kicker allowed
                                if(curKick[curKick.length-1] > winKick[winKick.length-1]){
                                    w=i, winnerIds=[playerHands[i].playerId];
                                } else if(curKick[curKick.length-1] == winKick[winKick.length-1]){
                                    winnerIds.push(playerHands[i].playerId);
                                }
                                break;
                            case 6: // 4 Kickers allowed
                                if(curKick[curKick.length-1] > winKick[winKick.length-1]){
                                    w=i, winnerIds=[playerHands[i].playerId];
                                } else if(curKick[curKick.length-2] > winKick[winKick.length-2]){
                                    w=i, winnerIds=[playerHands[i].playerId];
                                } else if(curKick[curKick.length-3] > winKick[winKick.length-3]){
                                    w=i, winnerIds=[playerHands[i].playerId];
                                } else if(curKick[curKick.length-4] > winKick[winKick.length-4]){
                                    w=i, winnerIds=[playerHands[i].playerId];
                                } else if(curKick[curKick.length-4] == winKick[winKick.length-4]){
                                    winnerIds.push(playerHands[i].playerId);
                                }
                                break;
                            case 4: // 2 Kickers allowed
                                if(curKick[curKick.length-1] > winKick[winKick.length-1]){
                                    w=i, winnerIds=[playerHands[i].playerId];
                                } else if(curKick[curKick.length-2] > winKick[winKick.length-2]){
                                    w=i, winnerIds=[playerHands[i].playerId];
                                } else if(curKick[curKick.length-2] == winKick[winKick.length-2]){
                                    winnerIds.push(playerHands[i].playerId);
                                }
                                break;
                            case 3: // 2 Kicker allowed
                                if(curKick[curKick.length-1] > winKick[winKick.length-1]){
                                    w=i, winnerIds=[playerHands[i].playerId];
                                } else if(curKick[curKick.length-2] > winKick[winKick.length-2]){
                                    w=i, winnerIds=[playerHands[i].playerId];
                                } else if(curKick[curKick.length-2] == winKick[winKick.length-2]){
                                    winnerIds.push(playerHands[i].playerId);
                                }
                                break;
                            case 2: // 3 Kickers allowed
                                if(curKick[curKick.length-1] > winKick[winKick.length-1]){
                                    w=i, winnerIds=[playerHands[i].playerId];
                                } else if(curKick[curKick.length-2] > winKick[winKick.length-2]){
                                    w=i, winnerIds=[playerHands[i].playerId];
                                } else if(curKick[curKick.length-3] > winKick[winKick.length-3]){
                                    w=i, winnerIds=[playerHands[i].playerId];
                                } else if(curKick[curKick.length-3] == winKick[winKick.length-3]){
                                    winnerIds.push(playerHands[i].playerId);
                                }
                                break;
                            case 1: // 5 Kickers allowed
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
                                break;
                            default: // 0 Kickers allowed
                                winnerIds.push(playerHands[i].playerId);
                                break;
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
        'timer': 5,
        'countdown': 5,
        'smallBlind': 25,
        'gameStatus': 0,
        'burnCards': [],
        'cards': [],
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
                'hand': []
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
                'hand': []
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
                'hand': []
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
                'hand': []
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
                'hand': []
            },
            {
                'dead': false,
                'playerId': 60,
                'rank': 6,
                'name': 'Player Five',
                'imageUrl': 'bootstrap/img/ichigo.jpg',
                'chips': 100,
                'button': false,
                'blind': '',
                'firstAct': false,
                'fold': false,
                'actionTaken': false,
                'winner': false,
                'turn': false,
                'currentBet': 0,
                'bet': '',
                'hand': []
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
                'hand': []
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
                'hand': []
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
                'hand': []
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
                'hand': []
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
    $scope.deck=[];
    $scope.myBet=$scope.table.seats[$scope.myPosition].bet;

    // TO TEST HAND STRENGTH, CARDS DEALT COMMENT THE FOLLOWING
    // --------------------------------------------------------
    status.resetTable($scope);

    // TO TEST HAND STRENGTH, CARDS DEALT UNCOMMENT THE FOLLOWING
    // ----------------------------------------------------------
    // status.setLivePlayers($scope);
    // status.dealCards($scope);
    // status.burnTurn($scope);
    // status.findWinner($scope);

}]);
