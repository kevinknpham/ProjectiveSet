/**
 * Error for when a user's request can't be completed due to the game state
 */
class FailedActionError extends Error {
  constructor(action, reason) {
    super(`Error for action: ${action} with reason: ${reason}`);
    this.action = action;
    this.reason = reason;
    this.name = 'InvalidRequestError';
  }
}

module.exports = FailedActionError;
