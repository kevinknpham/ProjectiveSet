const InvalidRequestError = require('../errors/InvalidRequestError');
const FailedActionError = require('../errors/FailedActionError');

const handleCreateGame = require('./handleCreateGame');
const handleJoinGame = require('./handleJoinGame');
const handleStartGame = require('./handleStartGame');
const handleSubmitSet = require('./handleSubmitSet');

const { ACTIONS } = require('../Constants');

const {
  CREATE_GAME, JOIN_GAME, START_GAME, SUBMIT_SET, LEAVE_GAME,
} = ACTIONS;

function handleMessage(ws, games, msg) {
  try {
    const data = JSON.parse(msg);
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
        break;
      default:
        throw new InvalidRequestError(`Invalid Action: ${data.action} is not one of create-game, join-game, start-game, submit-set, leave-game`);
    }
  } catch (e) {
    // TODO handle exceptions
    if (e instanceof InvalidRequestError) {
      console.log('-----------------------------------------------');
      console.log('Client encountered following error');
      console.log(e);
      console.log('-----------------------------------------------');
      ws.send({
        status: 'error',
        reason: e.message,
      });
    } else if (e instanceof FailedActionError) {
      ws.send(JSON.stringify({
        action: e.action,
        status: 'error',
        reason: e.reason,
      }));
    } else {
      console.error(e);
    }
  }
}

module.exports = handleMessage;
