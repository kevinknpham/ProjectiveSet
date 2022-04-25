const express = require('express');

const app = express();
require('express-ws')(app);

const PORT = 5000;

app.use(express.static('public'));

app.get('/api', (req, res) => {
  res.send({
    message: 'success',
  });
});

app.listen(process.env.PORT || PORT);
