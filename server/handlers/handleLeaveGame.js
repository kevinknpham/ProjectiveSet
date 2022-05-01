const validation = require('./parameterValidation');

const { ACTIONS } = require('../Constants');
const {
  broadcastMessage,
  getGameStateObject,
  setWsData,
  getSocketListFromGameInfo,
} = require('./commonFunctions');

const action = ACTIONS.LEAVE_GAME;

function handleLeaveGame(ws, games) {
  validation.playerIsInGame(ws, games, action);

  // remove player from game
  const { gameId } = ws;
  const gameInfo = games.get(gameId);

  gameInfo.players = gameInfo.players.filter((player) => player.socket !== ws);
  setWsData(ws, null, null);

  if (gameInfo.players.length === 0) {
    games.delete(gameId);
    ws.send(JSON.stringify({
      action,
      status: 'success',
    }));
  } else {
    broadcastMessage(getGameStateObject(gameInfo), getSocketListFromGameInfo(gameInfo));
  }
}

module.exports = handleLeaveGame;
