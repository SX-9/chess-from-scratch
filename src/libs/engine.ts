import { BoardArray } from "./array";
import { MoveGenerator } from "./moves";

export class Engine {
  board: BoardArray = new BoardArray(null);
  moveGen: MoveGenerator = new MoveGenerator();
  
  load(board: BoardArray, moveGenerator: MoveGenerator) {
    this.board = board;
    this.moveGen = moveGenerator;
  }

  evaluate() {
    const pieceWeightValues: Record<string, number> = {
      "P": 1,
      "N": 3,
      "B": 3,
      "R": 5,
      "Q": 9,
      "K": 100,
      "p": -1,
      "n": -3,
      "b": -3,
      "r": -5,
      "q": -9,
      "k": -100,
    };

    return this.board.board.filter(p => p).reduce((acc, piece) => {
      return acc + pieceWeightValues[piece as string];
    }, 0);
  }
}