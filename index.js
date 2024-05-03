import { Board } from './js/board.js';
import { MoveGeneration } from './js/moves.js';

const moveGeneration = new MoveGeneration({
  onEnd() {
    alert('Game Over!');
  }
});

const board = new Board(document.querySelector('#board'), {
  isLegalMove(board, from, to, turn) {
    let isLegal = false;

    moveGeneration.load(board, turn);
    const moves = moveGeneration.generate();
    if (moves[to] && moves[to].includes(from)) {
      isLegal = true;
      const newTurn = moveGeneration.utils.invertTurn(moveGeneration.turn);
      moveGeneration.turn = newTurn;
    }

    console.log('isLegal', isLegal);
    console.log('from', from);
    console.log('to', to);
    console.log('turn', turn);
    // console.log('moves', moves);
    
    return isLegal;
  }, numbered: 1
});

const testPositions = [
  '8881qQrRbB',
  'knn5pppppppp8888PPPPPPPP5NNK',
];

board.load(testPositions[1], 'w');