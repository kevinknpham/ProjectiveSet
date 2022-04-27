const InvalidRequestError = require('../errors/InvalidRequestError');
const FailedActionError = require('../errors/FailedActionError');

const handleCreateGame = require('./handleCreateGame');
const handleJoinGame = require('./handleJoinGame');
const handleStartGame = require('./handleStartGame');
const handleSubmitSet = require('./handleSubmitSet');
const handleLeaveGame = require('./handleLeaveGame');

const { ACTIONS } = require('../Constants');

const {
  CREATE_GAME, JOIN_GAME, START_GAME, SUBMIT_SET, LEAVE_GAME,
} = ACTIONS;

function handleMessage(ws, games, msg) {
  try {
    let data;
    try {
      data = JSON.parse(msg);
    } catch (e) {
      if (e instanceof SyntaxError) {
        throw new InvalidRequestError('request was not JSON formatted');
      } else {
        throw e;
      }
    }
    if (!data.action) {
      throw new InvalidRequestError('request is missing "action" attribute');
    }

    switch (data.action) {
      case SUBMIT_SET:
        handleSubmitSet(ws, games, data.params);
        break;
      case CREATE_GAME:
        handleCreateGame(ws, games, data.params);
        break;
      case JOIN_GAME:
        handleJoinGame(ws, games, data.params);
        break;
      case START_GAME:
        handleStartGame(ws, games);
        break;
      case LEAVE_GAME:
        // TODO implement leave-game logic
        // Remember if everyone leaves a game, it should be dropped
        handleLeaveGame(ws, games);
        break;
      default:
        throw new InvalidRequestError(`${data.action} is not one of create-game, join-game, start-game, submit-set, leave-game`);
    }
  } catch (e) {
    if (e instanceof InvalidRequestError) {
      console.log('-----------------------------------------------');
      console.log('Client encountered following error');
      console.log(e);
      console.log('-----------------------------------------------');
      ws.send(JSON.stringify({
        status: 'error',
        reason: e.message,
      }));
    } else if (e instanceof FailedActionError) {
      ws.send(JSON.stringify({
        action: e.action,
        status: 'error',
        reason: e.reason,
      }));
    } else {
      console.error('\u001b[31mEncountered unexpected error while handling message:\u001b[0m');
      console.error(e);
    }
  }
}

module.exports = handleMessage;
