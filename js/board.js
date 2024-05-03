const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export class Board {
  constructor(el, config) {
    this.el = el;
    this.board = new Array(64);
    this.moves = [];
    this.config = config;
    this.turn = 'w';
    this.loaded = false;

    if (this.config.numbered) this.el.classList.add('smaller');

    this.drawSquares();
  }

  async drawSquares() {
    for (let file = 0; file < 8; file++) {
      for (let rank = 0; rank < 8; rank++) {
        const squareEl = document.createElement('div');
        const squareIndex = file * 8 + rank;
        squareEl.classList.add((file + rank) % 2 === 0 ? 'white' : 'black');
        squareEl.role = 'button';
        squareEl.draggable = true;
        squareEl.ondragstart = (e) => e.dataTransfer.setData('text/plain', squareIndex);
        squareEl.ondragover = (e) => e.preventDefault();
        squareEl.ondrop = (e) => this.pieceDrop(e, squareIndex);
        this.el.appendChild(squareEl);
        if (this.config.updateDelay) await sleep(this.config.updateDelay);
      }
    }
    this.loaded = true;
  }

  pieceDrop(e, myIndex) {
    e.preventDefault();
    const from = parseInt(e.dataTransfer.getData('text/plain'));
    const to = parseInt(myIndex);
    if (from === to) return;

    const isLegal = this.config?.isLegalMove(this.board, from, to, this.turn) ?? true;
    if (!isLegal) return;
    this.move(from, to);
    this.show();
  }

  move(from, to) {
    this.board[to] = this.board[from];
    this.board[from] = false;
    this.turn = this.turn === 'w' ? 'b' : 'w';
  }

  load(fen, turn) {
    const boardFen = fen === 'starting'
      ? 'rnbqkbnrpppppppp8888PPPPPPPPRNBQKBNR'.split('')
      : fen.split(' ')[0].split('').filter(c => c !== '/');
    
    if (turn) this.turn = turn;

    let boardPointer = 0;
    for (let char of boardFen) {
      if (isNaN(char)) {
        this.board[boardPointer] = char;
        boardPointer++;
      } else {
        boardPointer += parseInt(char);
      }
    }

    this.show();
  }

  async show() {
    let i = -1;
    for (let square of this.board) {
      if (this.config.updateDelay) await sleep(this.config.updateDelay * 1.2);
      i++;
      const squareEl = this.el.children[i];
      squareEl.innerHTML = '';
      if (this.config.numbered) {
        const numberEl = document.createElement('p');
        numberEl.innerHTML = i;
        numberEl.style.color = 'black';
        squareEl.appendChild(numberEl);
      }
      if (!square) continue;
      const pieceEl = document.createElement('img');
      pieceEl.src = `assets/${square}.svg`;
      squareEl.appendChild(pieceEl);
    }
  }
}