function refillTable(table, deck, numDots) {
  while (table.length < numDots + 1 && deck.length > 0) {
    table.push(deck.pop());
  }
}

function cardEquals(card1, card2) {
  if (card1.length !== card2.length) {
    return false;
  }
  for (let i = 0; i < card1.length; i += 1) {
    if (card1[i] !== card2[i]) {
      return false;
    }
  }
  return true;
}

module.exports = { refillTable, cardEquals };
