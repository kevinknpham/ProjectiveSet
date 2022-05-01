const DEFAULT_NUM_DOTS = 6;

const NUM_CHARACTERS_IN_GAME_ID = 6;
// To avoid confusion between characters, i, l, o, and 0 are removed
const GAME_ID_POSSIBLE_CHARACTERS = [
  'A', 'B', 'C', 'D', 'E',
  'F', 'G', 'H', 'J', 'K',
  'M', 'N', 'P', 'Q', 'R',
  'S', 'T', 'U', 'V', 'W',
  'X', 'Y', 'Z', '2', '3',
  '4', '5', '6', '7', '8', '9',
];

const ACTIONS = {
  CREATE_GAME: 'create-game',
  JOIN_GAME: 'join-game',
  START_GAME: 'start-game',
  SUBMIT_SET: 'submit-set',
  LEAVE_GAME: 'leave-game',
};

module.exports = {
  DEFAULT_NUM_DOTS,
  ACTIONS,
  NUM_CHARACTERS_IN_GAME_ID,
  GAME_ID_POSSIBLE_CHARACTERS,
};
