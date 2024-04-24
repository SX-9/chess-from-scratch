import { Board } from './js/board.js';
import { MoveGeneration } from './js/moves.js';

const moveGeneration = new MoveGeneration({
  onEnd() {
    alert('Game Over!');
  }
});
const board = new Board(document.querySelector('#board'), {
  isLegalMove(board, from, to) {
    let isLegal = false;

    // moveGeneration.load(board);
    // const moves = moveGeneration.generate();
    // if (moves[to] && moves[to].includes(from)) {
      isLegal = true;
    // }

    return isLegal;
  }
});

board.load('starting');
