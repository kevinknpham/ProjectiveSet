function refillTable(table, deck, numDots) {
  while (table.length < numDots + 1 && deck.length > 0) {
    table.push(deck.pop());
  }
}

function cardEquals(card1, card2) {
  if (card1.length !== card2.length) {
    return false;
  }
  for (let i = 0; i < card1.length; i += 1) {
    if (card1[i] !== card2[i]) {
      return false;
    }
  }
  return true;
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

/**
 * Stringifies message and sends to all the given clients
 * @param {Object} message - message to send
 * @param {WebSocket[]} clients - list of clients to send message to
 */
function broadcastMessage(message, clients) {
  for (const client of clients) {
    client.send(JSON.stringify(message));
  }
}

/**
 * @param {String} action - action this result came from
 * @param {String} gameId - id of game
 * @param {String} playerName - name of new player
 * @returns
 */
function getJoinGameResult(action, gameId, playerName) {
  return {
    action,
    gameId,
    player: {
      name: playerName,
      score: 0,
    },
  };
}

/**
 * Extracts the external game state data to be sent to clients from the full data stored in `games`
 * @param {Object} fullGameData - data stored internally
 */
function getGameStateObject(fullGameData) {
  const { table } = fullGameData;
  const deckSize = fullGameData.deck.length;
  const players = fullGameData.players.map((player) => ({
    name: player.socket.playerName,
    score: player.score,
  }));
  return {
    table,
    deckSize,
    players,
  };
}

module.exports = {
  refillTable,
  cardEquals,
  findCardInTable,
  broadcastMessage,
  getGameStateObject,
  getJoinGameResult,
};
