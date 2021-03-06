const express = require('express');

const app = express();

require('express-ws')(app);

const PORT = process.env.PORT || 2345;

app.use(express.static('public'));
// TODO remove for actual finished product
app.use(express.static('test/manual'));

app.get('/api', (req, res) => {
  res.send({
    message: 'success',
  });
});

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
  console.log(`http://localhost:${PORT}/`);
});

// games maps the id of a game to an object containing metadata about the game and the
// remaining cards in the deck
// key - name of game
// value - {table=Number[][], deck=Number[][], players=Object[], started=Boolean, numDots=Number}
const games = new Map();

const handleMessage = require('./server/handlers/handleMessage');
const handleLeaveGame = require('./server/handlers/handleLeaveGame');

// eslint-disable-next-line no-unused-vars
app.ws('/game', (ws, req) => {
  ws.on('message', (msg) => {
    handleMessage(ws, games, msg);
  });

  // eslint-disable-next-line no-unused-vars
  ws.on('close', (reason, description) => {
    if (ws.gameId) {
      handleLeaveGame(ws, games);
    }
  });
});
