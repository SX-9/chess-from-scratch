export class MoveGeneration {
  constructor(config) {
    this.board = new Array(8^2);
    this.moves = {};
    this.moves.white = new Array(8^2);
    this.moves.black = new Array(8^2);
    this.config = config;

    this.gameOver = false;
    this.turn = 'w';

    // this.moves contains arrays
    // the element index is the index on the board
    // if the element is undefined, there are no pieces that can move to that square
    // if the element is an array, the array contains the pieces square index that can move to that square
  }

  load(board, turn) {
    this.board = board;
    let isOver = false;

    if (isOver) {
      this.gameOver = true;
      this.config?.onEnd();
    }
  }

  generate() {
    this.moves.black[16] = [8,1];
    this.moves.black[24] = [8];
    return this.moves;
  }
}