const validation = require('./parameterValidation');

const { ACTIONS } = require('../Constants');
const { broadcastMessage, getGameStateObject } = require('./commonFunctions');

const action = ACTIONS.LEAVE_GAME;

function handleLeaveGame(ws, games) {
  validation.playerIsInGame(ws, games, action);

  // remove player from game
  const { gameName } = ws;
  const gameInfo = games.get(gameName);

  // TODO refactor this code and code in create into a common function
  gameInfo.players.filter((player) => player.socket !== ws);
  ws.gameName = null;
  ws.playerName = null;

  if (gameInfo.players.length === 0) {
    games.delete(gameName);
    ws.send(JSON.stringify({
      action,
      status: 'success',
    }));
  } else {
    broadcastMessage(getGameStateObject(gameInfo), gameInfo.players.map((player) => player.socket));
  }
}

module.exports = handleLeaveGame;
