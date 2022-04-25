const InvalidRequestError = require('../errors/InvalidRequestError');
const FailedActionError = require('../errors/FailedActionError');

const handleCreateGame = require('./handleCreateGame');
const handleJoinGame = require('./handleJoinGame');
const handleStartGame = require('./handleStartGame');
const handleSubmitSet = require('./handleSubmitSet')

function handleMessage(ws, games, msg) {
  try {
    const data = JSON.parse(msg);
    switch (data.action) {
      case 'create-game':
        handleCreateGame(ws, games, data.params);
        break;
      case 'join-game':
        handleJoinGame(ws, games, data.params);
        break;
      case 'start-game':
        handleStartGame(ws, games);
        break;
      case 'submit-set':
        handleSubmitSet(ws, games, data.params);
        break;
      case 'leave-game':
        // TODO implement leave-game logic
        break;
      default:
        throw new InvalidRequestError(`Invalid Action: ${data.action} is not one of create-game, join-game, start-game, submit-set, leave-game`);
    }
  } catch (e) {
    // TODO handle exceptions
    if (e instanceof InvalidRequestError) {
      console.error(e);
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
