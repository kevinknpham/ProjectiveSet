const validation = require('./parameterValidation');

const {
  DEFAULT_NUM_DOTS, ACTIONS, NUM_CHARACTERS_IN_GAME_ID, GAME_ID_POSSIBLE_CHARACTERS,
} = require('../Constants');
const { getJoinGameResult } = require('./commonFunctions');

const action = ACTIONS.CREATE_GAME;

/**
 * Handles creation of a game
 * @param {WebSocket} ws - WebSocket to send responses to
 * @param {Object} params - must contain name of the player, optionally contains
 * the number of dots to use
 */
function handleCreateGame(ws, games, params) {
  validation.paramsNotNull(params, action);
  validation.containsPlayerName(params, action);

  // Verify numDots is a number
  const numDots = params.numDots || DEFAULT_NUM_DOTS;
  const deck = createDeck(numDots);
  shuffle(deck);
  const gameId = generateGameId(games);

  const gameInfo = {
    numDots,
    started: false,
    table: [],
    deck,
    players: [{ socket: ws, score: 0 }],
  };
  games.set(gameId, gameInfo);
  ws.gameId = gameId;
  ws.playerName = params.playerName;

  ws.send(JSON.stringify(getJoinGameResult(action, gameId, params.playerName)));
}

function generateGameId(existingGamesMap) {
  while (true) {
    let result = '';
    for (let i = 0; i < NUM_CHARACTERS_IN_GAME_ID; i += 1) {
      result += GAME_ID_POSSIBLE_CHARACTERS[
        Math.floor(GAME_ID_POSSIBLE_CHARACTERS.length * Math.random)
      ];
    }
    if (!existingGamesMap.has(result)) {
      return result;
    }
  }
}

/**
 * Helper method to populate deck
 * @param {Number} numDots - number of dots on each card
 */
function createDeck(numDots, deck = [], currentCard = []) {
  if (numDots <= 0) {
    // if all values are 0, omit this card
    if (currentCard.includes(1)) {
      // Push a copy of currentCard on to the array
      deck.push([...currentCard]);
    }
  } else {
    currentCard.push(0);
    createDeck(numDots - 1, deck, currentCard);
    currentCard.pop();
    currentCard.push(1);
    createDeck(numDots - 1, deck, currentCard);
    currentCard.pop();
  }
  return deck;
}

function shuffle(array) {
  let currentIndex = array.length; let
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    const temp = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temp;
  }

  return array;
}

module.exports = handleCreateGame;
