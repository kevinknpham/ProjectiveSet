const express = require('express');
const expressWs = require('express-ws');
const { param } = require('express/lib/request');

const app = express();
require('express-ws')(app);

const PORT = 5000;

app.use(express.static('public'));

app.get('/api', (req, res) => {
  res.send({
    message: 'success',
  });
});

app.listen(process.env.PORT || PORT);

app.ws('/game', (ws, req) => {
  ws.on('message', (msg) => {
    handleMessage(ws, msg, err);
  });
});

// Constants
const DEFAULT_NUM_DOTS = 6;

// games maps the name of a game to an object containing metadata about the game and the
// remaining cards in the deck
// key - name of game
// value - {table=Number[][], deck=Number[][], players=Object[], started=Boolean}
const games = new Map();

function handleMessage(ws, msg, err) {
  try {
    const data = JSON.parse(msg);
    switch (data.action) {
      case 'create-game':
        handleCreate(ws, data.params);
        break;
      case 'join-game':
        handleJoin(ws, data.params);
        break;
      case 'start-game':
        handleStart(ws);
        break;
      case 'submit-set':
        handleSubmit(ws, data.params);
        break;
      default:
        throw `Invalid Action: ${data.action} is not one of [create,submit-set]`;
    }
  } catch (e) {
    err(e);
  }
}

/**
 * Handles creation of a game
 * @param {WebSocket} ws - WebSocket to send responses to
 * @param {Object} params - must contain game's name and name of the player, optionally contains the number of dots to use
 */
function handleCreate(ws, params) {
  if (!params.gameName) {
    throw 'create-game: params.gameName is missing or invalid';
  }
  if (!params.playerName) {
    throw `create-game: params.playerName is missing or invalid`;
  }

  if (games.has(params.gameName)) {
    ws.send(JSON.stringify({
      action: 'create-game',
      status: 'error',
      reason: `The name ${params.gameName} is already taken`
    }));
  } else {
    const numDots = params.numDots || DEFAULT_NUM_DOTS;
    const deck = createDeck(numDots);
    shuffle(deck);
    let gameInfo = {
      numDots: numDots,
      started: false,
      table: [],
      deck: deck,
      players: [{ socket: ws, score: 0 }]
    };
    games.set(params.gameName, gameInfo);
    ws.gameName = params.gameName;
    ws.playerName = params.playerName;
    // TODO send back success status
  }
}

/**
 * Helper method to populate deck
 * @param {Number} numDots - number of dots on each card
 */
function createDeck(numDots, deck = [], currentCard = []) {
  if (numDots <= 0) {
    // if all values are 0, omit this card
    if (!currentCard.includes(1)) {
      deck.push(currentCard);
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

/**
 * Handles adding player to an existing game
 * @param {WebSocket} ws - WebSocket to send responses to
 * @param {Object} params - must contain name of the game and name of the player
 */
function handleJoin(ws, params) {
  if (!params.gameName) {
    throw 'join-game: params.gameName is missing or invalid';
  }
  if (!params.playerName) {
    throw 'join-game: params.playerName is missing or invalid';
  }

  if (!games.has(params.gameName)) {
    ws.send(JSON.stringify({
      action: 'join-game',
      status: 'error',
      reason: `${params.gameName} is does not exist`
    }));
  } else {
    games.get(params.gameName).players.push({ socket: ws, score: 0 });
    ws.gameName = params.gameName;
    ws.playerName = params.playerName;
    // TODO send back success status
  }
}

/**
 * Starts a game
 * @param {WebSocket} ws - WebSocket to send responses to
 */
function handleStart(ws) {
  if (!ws.gameName) {
    throw 'start-game: client is not currently in a game';
  }
  
  if (!games.has(ws.gameName)) {
    throw `Game name ${ws.gameName} not found`;
  }

  const gameInfo = games.get(ws.gameName);
  gameInfo.started = true;

  // Set table
  refillTable(gameInfo.table, gameInfo.deck, gameInfo.numDots);
  // TODO broadcast message to all players
}

/**
 * Handles a player submitting a set
 * @param {WebSocket} ws - WebSocket to send responses to
 * @param {Object} params - must contain list of cards being submitted
 */
function handleSubmit(ws, params) {
  if (!ws.gameName) {
    throw 'submit-set: client is not currently in a game';
  }
  if (!params.cards) {
    throw 'submit-set: params.cards is missing or invalid';
  }
  
  if (!games.has(ws.gameName)) {
    throw `submit-set: Game name ${ws.gameName} not found`;
  }
  const gameInfo = games.get(ws.gameName);
  if (!cardsAreInTable(params.cards, gameInfo.table)) {
    throw 'submit-set: At least one card in the set is not on the table';
  }

  if (!isASet(params.cards)) {
    // TODO Emit error to client
  } else {
    // Update scores
    gameInfo.players.reduce(el => el.socket === ws).forEach(el => el.score++);
    // Remove cards from table
    removeCardsFromTable(params.cards, gameInfo.table);
    // Repopulate deck
    refillTable(gameInfo.table, gameInfo.deck, gameInfo.numDots);
    // Broadcast change to all clients
    // TODO
  }
}

/**
 * Checks that the card has an even number of each dot color
 * @param {Number[][]} cards - list of cards to check
 * @param {Number} numDots - number of dots on a single card
 */
function isASet(cards, numDots) {
  let parities = new Array(numDots);
  parities.fill(0);
  for (const card of cards) {
    for (let i = 0; i < numDots; i++) {
      parities[i] = parities[i] ^ card[i];
    }
  }
  return !parities.includes(1);
}

function cardsAreInTable(set, table) {
  for (const card of set) {
    if (!findCardInTable(table, card)) {
      return false;
    }
  }
  return true;
}

function removeCardsFromTable(set, table) {
  for (const card of set) {
    table.remove(findCardInTable(table, card));
  }
}

function refillTable(table, deck, numDots) {
  while (table.length < numDots + 1 && deck.length > 0) {
    table.push(deck.pop());
  }
}

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

/**
 * 
 * @param {Number[][]} table - list of cards to check
 * @param {Number[]} card - card to check against list
 * @returns card in table that equals card, null if not found
 */
function findCardInTable(table, card) {
  for (const cardInTable of table) {
    if (cardEquals(cardInTable, card)) {
      return cardInTable;
    }
  }
  return null;
}

function cardEquals(card1, card2) {
  if (card1.length !== card2.length) {
    return false;
  }
  for (let i = 0; i < card1.length; i++) {
    if (card1[i] !== card2[i]) {
      return false;
    }
  }
  return true;
}

/**
 * Logs error to console and sends error message over given ws
 * @param {WebSocket} ws - ws to send error to
 * @param {String} message - String with error message
 */
function err(ws, message) {
  console.error(message);
  ws.send(`Encountered error with request: ${message}`);
}

function broadcast(message, webSockets) {
  webSockets.forEach((client) => {
    client.send(message);
  });
}
