/* 
function parseEvents(state: UpdateArgs) {
    state.events.forEach(event => {
        console.log(`EVENT: `, event);
        switch (event) {
            case 'Player Joined':
                if (state.state.players.length > 1) {
                    if (state.state.gameSequence == GameStates.ReadyForRound) {
                        console.log(`RR - joining event HERE!!!!`);
                        showOther(state.state.players.length - 1);
                    } else if (state.state.gameSequence == GameStates.PlayersJoining) {
                        console.log(`joining event HERE!!!!`);
                        showOther(state.state.players.length - 1);
                    }
                }
                break;
            case 'game starting':
                (document.getElementById('btnStartGame') as HTMLButtonElement).disabled = true;
                toggleCardpoolDrawer('open');
                runCardPoolAnimation().then(() => {
                    //next animation - Monster Deck
                    document.getElementById('MonsterDiv').classList.add('fadeIn');
                    document.getElementById('LocationsDiv').classList.add('fadeIn');
                    document.getElementById('TDDiv').classList.add('fadeIn');
                    setTimeout(() => {
                        runPlayerHandAnimation();
                        if (state.state.turn == playerInfo.id && myStartFlag) {
                            (document.getElementById('btnStartTurn') as HTMLButtonElement).disabled = false;
                        }
                    }, 750);
                });

                //TODO if other players, load their UI too

                break;
            case 'ReadyToStartTurn':
                myStartFlag = true;
                break;
            case 'Enable TD':
                //TODO Deal Players Hand
                let elem = document.getElementsByClassName('playersArea');
                elem[0].classList.add('openPlayersHand');
                setTimeout(() => {
                    //Get cards from state
                    dealPlayerCardFromDeck(playerInfo.hand[0]);
                }, 1000);
                //TODO Deal the TD cards from STATE
                break;
            case 'SelectTD':
                //TODO Enable TD to be clicked and selected and there's active effects
                //TODO Maybe Pulse and/or Glow
                break;
            default:
                break;
        }
    });
} */

/* 
const divLoaded = () => {
  console.log(`loaded state: `, playerInfo);
  playerInfo.otherid.forEach((player, index) => {
      showOther(index + 1);
  });
};

let startGame = (e: Event) => {
  playerInfo.myConnection.startGame({});
};

let startTurn = (e: Event) => {
  playerInfo.myConnection.startTurn({});
};

let endTurn = (e: Event) => {
  playerInfo.myConnection.endTurn({});
}; 

function showOther(numOtherPlayers: number) {
    console.log(`num other players:`, numOtherPlayers);
    const elm = document.getElementById(`other${numOtherPlayers}`);
    console.log(`other player element: `, elm);
    elm.classList.remove('hidden');
}
*/
