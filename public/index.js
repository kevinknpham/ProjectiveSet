(() => {
  const COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'purple', 'pink', 'slate', 'cyan'];
  const RATIO = 5 / 7;

  function init() {
    const table = qs('#table');
    table.appendChild(createCard([1, 0, 1, 1, 1, 0, 1]));
    table.appendChild(createCard([1, 1, 1, 1, 0, 1, 1]));

    for (let i = 1; i < 15; i += 1) {
      table.appendChild(createCard(Array(i).fill(1)));
    }
  }

  function createCard(dotArray) {
    const card = qs('#card').content.cloneNode(true).firstElementChild;
    const dotTemplate = qs('#dot');

    const [cols, rows] = getColRowCount(dotArray.length);

    dotArray.forEach((dotValue, i) => {
      const dot = dotTemplate.content.cloneNode(true).firstElementChild;
      if (!dotValue) {
        dot.classList.add('invisible');
      }
      dot.classList.add(getColor(i));
      card.classList.add(`grid-cols-${cols}`, `grid-rows-${rows}`);
      card.addEventListener('click', cardClicked);
      card.appendChild(dot);
    });
    return card;
  }

  function cardClicked() {
    this.classList.toggle('border-2');
    this.classList.toggle('border-black');
  }

  function getColRowCount(n) {
    const rows = Math.sqrt(n * RATIO);
    const cols = Math.sqrt(n / RATIO);
    const options = [
      [Math.floor(rows), Math.ceil(cols)],
      [Math.ceil(rows), Math.floor(cols)],
      [Math.ceil(rows), Math.ceil(cols)],
    ].filter((el) => el[0] * el[1] >= n); // Filters out options that don't add to n
    options.sort((a, b) => (a[0] * a[1]) - (b[0] * b[1])); // Sorts by lease total to most
    return options[0]; // Grabs least total
  }

  function getColor(n) {
    return `bg-${COLORS[Math.min(n, COLORS.length - 1)]}-500`;
  }

  function qs(query) {
    return document.querySelector(query);
  }

  window.addEventListener('load', init);
})();
