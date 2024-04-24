export class Board {
  constructor(el, config) {
    this.el = el;
    this.board = new Array(8^2);
    this.moves = [];
    this.config = config;

    for (let file = 0; file < 8; file++) {
      for (let rank = 0; rank < 8; rank++) {
        const squareEl = document.createElement('div');
        const squareIndex = file * 8 + rank;
        squareEl.classList.add((file + rank) % 2 === 0 ? 'white' : 'black');
        squareEl.role = 'button';
        squareEl.draggable = true;
        squareEl.ondragstart = (e) => e.dataTransfer.setData('text/plain', squareIndex);
        squareEl.ondragover = (e) => e.preventDefault();
        squareEl.ondrop = (e) => this.squareDropped(e, squareIndex);
        el.appendChild(squareEl);
      }
    }
  }

  squareDropped(e, myIndex) {
    e.preventDefault();
    const from = parseInt(e.dataTransfer.getData('text/plain'));
    const to = parseInt(myIndex);
    if (from === to) return;

    const isLegal = this.config?.isLegalMove(this.board, from, to) ?? true;
    if (!isLegal) return;
    this.move(from, to);
    this.show();
  }

  move(from, to) {
    this.board[to] = this.board[from];
    this.board[from] = false;
  }

  load(fen) {
    const boardFen = fen === 'starting'
      ? 'rnbqkbnrpppppppp8888PPPPPPPPRNBQKBNR'.split('')
      : fen.split(' ')[0].split('').filter(c => c !== '/');
    
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

  show() {
    let i = -1;
    for (let square of this.board) {
      i++;
      const squareEl = this.el.children[i];
      squareEl.innerHTML = '';
      if (!square) continue;
      const pieceEl = document.createElement('img');
      pieceEl.src = `assets/${square}.svg`;
      squareEl.appendChild(pieceEl);
    }
  }
}