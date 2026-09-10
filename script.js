(() => {
  const WIN_COMBOS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],   // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8],   // columns
    [0, 4, 8], [2, 4, 6]               // diagonals
  ];

  // Line endpoints per combo, in the 0-300 viewBox coordinate space,
  // matching the 3x3 grid's cell centers/edges.
  const LINE_COORDS = {
    '0,1,2': [20, 50, 280, 50],
    '3,4,5': [20, 150, 280, 150],
    '6,7,8': [20, 250, 280, 250],
    '0,3,6': [50, 20, 50, 280],
    '1,4,7': [150, 20, 150, 280],
    '2,5,8': [250, 20, 250, 280],
    '0,4,8': [25, 25, 275, 275],
    '2,4,6': [275, 25, 25, 275]
  };

  const gridEl = document.getElementById('grid');
  const cells = Array.from(document.querySelectorAll('.cell'));
  const statusEl = document.getElementById('status');
  const winLineEl = document.getElementById('winLine');
  const winLinePathEl = document.getElementById('winLinePath');
  const scoreXEl = document.getElementById('scoreX');
  const scoreOEl = document.getElementById('scoreO');
  const scoreDrawEl = document.getElementById('scoreDraw');
  const newRoundBtn = document.getElementById('newRound');
  const resetScoresBtn = document.getElementById('resetScores');

  const ROW_LABELS = ['Row 1', 'Row 2', 'Row 3'];
  const COL_LABELS = ['column 1', 'column 2', 'column 3'];

  let board = Array(9).fill(null);
  let currentPlayer = 'x';
  let gameOver = false;
  let scores = { x: 0, o: 0, draw: 0 };

  function cellLabel(index, mark) {
    const row = Math.floor(index / 3);
    const col = index % 3;
    const state = mark ? `, ${mark.toUpperCase()}` : ', empty';
    return `${ROW_LABELS[row]}, ${COL_LABELS[col]}${state}`;
  }

  function render() {
    cells.forEach((cell, i) => {
      const mark = board[i];
      cell.textContent = mark ? mark.toUpperCase() : '';
      if (mark) {
        cell.setAttribute('data-mark', mark);
        cell.disabled = true;
      } else {
        cell.removeAttribute('data-mark');
        cell.disabled = gameOver;
      }
      cell.setAttribute('aria-label', cellLabel(i, mark));
      cell.classList.remove('win-cell');
    });
  }

  function updateStatus(text, isWin = false) {
    statusEl.textContent = text;
    statusEl.classList.toggle('is-win', isWin);
  }

  function checkWinner() {
    for (const combo of WIN_COMBOS) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { mark: board[a], combo };
      }
    }
    return null;
  }

  function isDraw() {
    return board.every(cell => cell !== null);
  }

  function drawWinLine(combo) {
    const key = combo.join(',');
    const [x1, y1, x2, y2] = LINE_COORDS[key];
    winLinePathEl.setAttribute('x1', x1);
    winLinePathEl.setAttribute('y1', y1);
    winLinePathEl.setAttribute('x2', x2);
    winLinePathEl.setAttribute('y2', y2);
    winLineEl.classList.add('show');
  }

  function updateScoreboard() {
    scoreXEl.textContent = scores.x;
    scoreOEl.textContent = scores.o;
    scoreDrawEl.textContent = scores.draw;
  }

  function handleCellClick(event) {
    if (gameOver) return;
    const index = Number(event.currentTarget.dataset.index);
    if (board[index]) return;

    board[index] = currentPlayer;
    render();

    const result = checkWinner();
    if (result) {
      gameOver = true;
      result.combo.forEach(i => cells[i].classList.add('win-cell'));
      drawWinLine(result.combo);
      cells.forEach(cell => { if (!cell.dataset.mark) cell.disabled = true; });
      scores[result.mark] += 1;
      updateScoreboard();
      updateStatus(`${result.mark.toUpperCase()} wins`, true);
      return;
    }

    if (isDraw()) {
      gameOver = true;
      scores.draw += 1;
      updateScoreboard();
      updateStatus("It's a draw");
      return;
    }

    currentPlayer = currentPlayer === 'x' ? 'o' : 'x';
    updateStatus(`${currentPlayer.toUpperCase()} to move`);
  }

  function newRound() {
    board = Array(9).fill(null);
    currentPlayer = 'x';
    gameOver = false;
    winLineEl.classList.remove('show');
    render();
    updateStatus('X to move');
  }

  function resetScores() {
    scores = { x: 0, o: 0, draw: 0 };
    updateScoreboard();
    newRound();
  }

  cells.forEach(cell => cell.addEventListener('click', handleCellClick));
  newRoundBtn.addEventListener('click', newRound);
  resetScoresBtn.addEventListener('click', resetScores);

  render();
  updateStatus('X to move');
  updateScoreboard();
})();
