const FailedActionError = require('../errors/FailedActionError');
const validation = require('./parameterValidation');

const { broadcastMessage } = require('./commonFunctions');

const { ACTIONS } = require('../Constants');

const action = ACTIONS.JOIN_GAME;

/**
 * Handles adding player to an existing game
 * @param {WebSocket} ws - WebSocket to send responses to
 * @param {Object} params - must contain name of the game and name of the player
 */
function handleJoinGame(ws, games, params) {
  // TODO check if player is already in game, do nothing or error if they are
  validation.paramsNotNull(params, action);
  validation.containsGameName(params, action);
  validation.containsPlayerName(params, action);

  if (!games.has(params.gameName)) {
    throw new FailedActionError(action, `${params.gameName} is does not exist`);
  } else {
    const gameInfo = games.get(params.gameName);
    gameInfo.players.push({ socket: ws, score: 0 });
    ws.gameName = params.gameName;
    ws.playerName = params.playerName;
    ws.send(JSON.stringify({
      action,
      status: 'success',
    }));
    // TODO refactor code for creating player object (duplicated in create)
    broadcastMessage(
      {
        action,
        player: {
          name: params.playerName,
          score: 0,
        },
      },
      gameInfo.players.map((player) => player.socket),
    );
  }
}

module.exports = handleJoinGame;
